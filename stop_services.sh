#!/bin/bash

################################################################################
# NotebookAI 服务停止脚本
# 
# 此脚本将停止所有运行中的服务:
# 1. 前端 Next.js 服务
# 2. 后端 API 服务
# 3. SurrealDB 数据库
#
# 使用方法:
#   chmod +x stop_services.sh
#   ./stop_services.sh
################################################################################

# 设置 PATH - 添加必要的工具路径
export PATH="$HOME/.surrealdb:$HOME/.cargo/bin:$PATH"

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 日志函数
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 获取脚本所在目录
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

log_info "停止 NotebookAI 服务..."

################################################################################
# 停止服务的函数
################################################################################
stop_service() {
    local service_name=$1
    local pid_file=$2
    
    if [ -f "$pid_file" ]; then
        PID=$(cat "$pid_file")
        if ps -p $PID > /dev/null 2>&1; then
            log_info "停止 ${service_name} (PID: $PID)..."
            kill $PID
            
            # 等待进程结束
            for i in {1..10}; do
                if ! ps -p $PID > /dev/null 2>&1; then
                    break
                fi
                sleep 1
            done
            
            # 如果进程仍在运行，强制结束
            if ps -p $PID > /dev/null 2>&1; then
                log_warning "强制停止 ${service_name}..."
                kill -9 $PID
                sleep 1
            fi
            
            if ! ps -p $PID > /dev/null 2>&1; then
                log_success "${service_name} 已停止"
                rm "$pid_file"
            else
                log_error "无法停止 ${service_name}"
            fi
        else
            log_warning "${service_name} 未在运行"
            rm "$pid_file"
        fi
    else
        log_warning "未找到 ${service_name} 的 PID 文件"
    fi
}

################################################################################
# 1. 停止前端服务
################################################################################
stop_service "前端服务" ".pids/frontend.pid"

################################################################################
# 2. 停止后端 API
################################################################################
stop_service "后端 API" ".pids/api.pid"

################################################################################
# 3. 停止 SurrealDB
################################################################################
stop_service "SurrealDB" ".pids/surrealdb.pid"

################################################################################
# 清理额外的进程
################################################################################
log_info "检查并清理残留进程..."

# 查找并停止所有相关进程
pkill -f "uvicorn api.main:app" 2>/dev/null && log_info "清理 uvicorn 进程"
pkill -f "node .next/standalone/server.js" 2>/dev/null && log_info "清理 Node.js 进程"
pkill -f "npm run start" 2>/dev/null && log_info "清理 npm start 进程"
pkill -f "surreal start" 2>/dev/null && log_info "清理 SurrealDB 进程"

sleep 2

echo ""
echo "=========================================="
log_success "所有服务已停止！"
echo "=========================================="
echo ""
