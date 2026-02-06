#!/bin/bash

################################################################################
# NotebookAI 服务启动脚本
# 
# 此脚本将启动三个服务:
# 1. SurrealDB 数据库 (端口 8000)
# 2. 后端 API 服务 (端口 5055)
# 3. 前端 Next.js 服务 (端口 8502)
#
# 所有服务将在后台运行，日志输出到 logs/ 目录
#
# 使用方法:
#   chmod +x start_services.sh
#   ./start_services.sh
################################################################################

set -e  # 遇到错误时退出

# 设置 PATH - 添加必要的工具路径
export PATH="$HOME/.surrealdb:$HOME/.cargo/bin:$PATH"

# 加载 nvm (如果存在)
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

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

# 创建日志目录
mkdir -p logs

# 创建 PID 目录
mkdir -p .pids

# 加载环境变量
if [ -f ".env" ]; then
    export $(cat .env | grep -v '^#' | xargs)
fi

# 设置默认值
SURREALDB_PORT=${SURREALDB_PORT:-8000}
API_PORT=${API_PORT:-5055}
FRONTEND_PORT=${FRONTEND_PORT:-8502}

log_info "NotebookAI 服务启动中..."

################################################################################
# 1. 启动 SurrealDB
################################################################################
log_info "启动 SurrealDB 数据库..."

# 检查 SurrealDB 是否已在运行
if [ -f ".pids/surrealdb.pid" ]; then
    OLD_PID=$(cat .pids/surrealdb.pid)
    if ps -p $OLD_PID > /dev/null 2>&1; then
        log_warning "SurrealDB 已在运行 (PID: $OLD_PID)"
    else
        rm .pids/surrealdb.pid
    fi
fi

if [ ! -f ".pids/surrealdb.pid" ]; then
    # 启动 SurrealDB（使用文件存储）
    nohup surreal start \
        --user root \
        --pass root \
        --bind 0.0.0.0:${SURREALDB_PORT} \
        file:./surreal_data/database.db \
        > logs/surrealdb.log 2>&1 &
    
    SURREALDB_PID=$!
    echo $SURREALDB_PID > .pids/surrealdb.pid
    
    log_info "等待 SurrealDB 启动..."
    sleep 3
    
    # 检查进程是否还在运行
    if ps -p $SURREALDB_PID > /dev/null; then
        log_success "SurrealDB 已启动 (PID: $SURREALDB_PID, 端口: ${SURREALDB_PORT})"
    else
        log_error "SurrealDB 启动失败，请查看 logs/surrealdb.log"
        exit 1
    fi
fi

################################################################################
# 2. 启动后端 API
################################################################################
log_info "启动后端 API 服务..."

# 检查后端 API 是否已在运行
if [ -f ".pids/api.pid" ]; then
    OLD_PID=$(cat .pids/api.pid)
    if ps -p $OLD_PID > /dev/null 2>&1; then
        log_warning "后端 API 已在运行 (PID: $OLD_PID)"
    else
        rm .pids/api.pid
    fi
fi

if [ ! -f ".pids/api.pid" ]; then
    # 等待 SurrealDB 完全启动
    log_info "等待 SurrealDB 就绪..."
    max_attempts=30
    attempt=0
    while [ $attempt -lt $max_attempts ]; do
        if curl -s http://localhost:${SURREALDB_PORT}/health > /dev/null 2>&1; then
            log_success "SurrealDB 已就绪"
            break
        fi
        attempt=$((attempt + 1))
        if [ $attempt -eq $max_attempts ]; then
            log_error "SurrealDB 启动超时"
            exit 1
        fi
        sleep 1
    done
    
    # 使用 uv 运行后端服务
    log_info "使用 uvicorn 启动后端..."
    nohup uv run uvicorn api.main:app \
        --host 0.0.0.0 \
        --port ${API_PORT} \
        --log-level info \
        > logs/api.log 2>&1 &
    
    API_PID=$!
    echo $API_PID > .pids/api.pid
    
    log_info "等待后端 API 启动..."
    sleep 3
    
    # 检查进程是否还在运行
    if ps -p $API_PID > /dev/null; then
        log_success "后端 API 已启动 (PID: $API_PID, 端口: ${API_PORT})"
    else
        log_error "后端 API 启动失败，请查看 logs/api.log"
        exit 1
    fi
fi

################################################################################
# 3. 启动前端服务
################################################################################
log_info "启动前端服务..."

# 检查前端是否已在运行
if [ -f ".pids/frontend.pid" ]; then
    OLD_PID=$(cat .pids/frontend.pid)
    if ps -p $OLD_PID > /dev/null 2>&1; then
        log_warning "前端服务已在运行 (PID: $OLD_PID)"
    else
        rm .pids/frontend.pid
    fi
fi

if [ ! -f ".pids/frontend.pid" ]; then
    if [ -d "frontend" ]; then
        cd frontend
        
        # 复制静态文件到 standalone 目录
        log_info "准备静态文件..."
        if [ -d ".next/standalone" ]; then
            # 复制静态资源
            cp -r .next/static .next/standalone/.next/ 2>/dev/null || true
            cp -r public .next/standalone/ 2>/dev/null || true
        fi
        
        # 启动 Next.js 生产服务器
        log_info "启动 Next.js 服务器..."
        # 设置端口环境变量
        PORT=${FRONTEND_PORT} nohup node .next/standalone/server.js \
            > ../logs/frontend.log 2>&1 &
        
        FRONTEND_PID=$!
        echo $FRONTEND_PID > ../.pids/frontend.pid
        
        cd "$SCRIPT_DIR"
        
        log_info "等待前端服务启动..."
        sleep 3
        
        # 检查进程是否还在运行
        if ps -p $FRONTEND_PID > /dev/null; then
            log_success "前端服务已启动 (PID: $FRONTEND_PID, 端口: ${FRONTEND_PORT})"
        else
            log_error "前端服务启动失败，请查看 logs/frontend.log"
            exit 1
        fi
    else
        log_warning "未找到 frontend 目录，跳过前端启动"
    fi
fi

################################################################################
# 服务启动完成
################################################################################

echo ""
echo "=========================================="
log_success "所有服务已启动！"
echo "=========================================="
echo ""
echo "服务地址:"
echo "  - SurrealDB:  http://localhost:${SURREALDB_PORT}"
echo "  - 后端 API:   http://localhost:${API_PORT}"
echo "  - 前端应用:   http://localhost:${FRONTEND_PORT}"
echo "  - AI绘图:     http://localhost:${FRONTEND_PORT}/diagramai (已集成到前端)"
echo ""
echo "查看日志:"
echo "  - SurrealDB:  tail -f logs/surrealdb.log"
echo "  - 后端 API:   tail -f logs/api.log"
echo "  - 前端服务:   tail -f logs/frontend.log"
if [ -f ".pids/diagramai.pid" ]; then
    echo "  - DiagramAI:  tail -f logs/diagramai.log"
fi
echo ""
echo "停止服务:"
echo "  ./stop_services.sh"
echo ""
echo "=========================================="
