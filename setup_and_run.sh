#!/bin/bash

################################################################################
# NotebookAI 本地安装和启动脚本
# 
# 此脚本将:
# 1. 安装必要的系统依赖
# 2. 安装 SurrealDB 数据库
# 3. 使用 uv 创建 Python 虚拟环境并安装依赖
# 4. 安装 Node.js 依赖并构建前端
# 5. 启动 SurrealDB 数据库
# 6. 启动后端 API 服务
# 7. 启动前端服务
#
# 使用方法:
#   chmod +x setup_and_run.sh
#   ./setup_and_run.sh
################################################################################

set -e  # 遇到错误时退出

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

log_info "工作目录: $SCRIPT_DIR"

################################################################################
# 1. 检查并安装系统依赖
################################################################################
log_info "步骤 1/7: 检查系统依赖..."

# 检查是否为 root 用户（用于安装系统包）
if [[ $EUID -ne 0 ]]; then
   log_warning "此脚本需要 sudo 权限来安装系统依赖"
   log_info "某些步骤可能需要输入密码"
fi

# 检查 curl
if ! command -v curl &> /dev/null; then
    log_info "安装 curl..."
    sudo apt-get update
    sudo apt-get install -y curl
fi

# 检查 ffmpeg (用于音频处理)
if ! command -v ffmpeg &> /dev/null; then
    log_info "安装 ffmpeg..."
    sudo apt-get update
    sudo apt-get install -y ffmpeg
fi

# 检查 build-essential (编译依赖)
if ! dpkg -l | grep -q build-essential; then
    log_info "安装 build-essential..."
    sudo apt-get update
    sudo apt-get install -y build-essential
fi

log_success "系统依赖检查完成"

################################################################################
# 2. 安装 SurrealDB
################################################################################
log_info "步骤 2/7: 安装 SurrealDB..."

if ! command -v surreal &> /dev/null; then
    log_info "下载并安装 SurrealDB..."
    curl --proto '=https' --tlsv1.2 -sSf https://install.surrealdb.com | sh
    
    # 将 SurrealDB 添加到 PATH
    if [[ ":$PATH:" != *":$HOME/.surrealdb:"* ]]; then
        export PATH="$HOME/.surrealdb:$PATH"
        echo 'export PATH="$HOME/.surrealdb:$PATH"' >> ~/.bashrc
    fi
else
    log_success "SurrealDB 已安装: $(surreal version)"
fi

################################################################################
# 3. 安装 uv (Python 包管理器)
################################################################################
log_info "步骤 3/7: 检查 uv..."

if ! command -v uv &> /dev/null; then
    log_info "安装 uv..."
    curl -LsSf https://astral.sh/uv/install.sh | sh
    
    # 将 uv 添加到 PATH
    export PATH="$HOME/.cargo/bin:$PATH"
else
    log_success "uv 已安装: $(uv --version)"
fi

################################################################################
# 4. 创建 Python 虚拟环境并安装依赖
################################################################################
log_info "步骤 4/7: 设置 Python 环境..."

# 使用 uv 同步依赖（会自动创建虚拟环境）
log_info "使用 uv 安装 Python 依赖..."
uv sync

log_success "Python 环境设置完成"

################################################################################
# 5. 安装 Node.js 和前端依赖
################################################################################
log_info "步骤 5/7: 设置 Node.js 环境..."

# 检查并安装 nvm
if [ ! -d "$HOME/.nvm" ]; then
    log_info "安装 nvm (Node.js 版本管理器)..."
    curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash
    
    # 加载 nvm
    export NVM_DIR="$HOME/.nvm"
    [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
    [ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"
else
    log_success "nvm 已安装"
    # 加载 nvm
    export NVM_DIR="$HOME/.nvm"
    [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
    [ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"
fi

# 检查 Node.js 版本
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version | sed 's/v//')
    REQUIRED_MAJOR=20
    CURRENT_MAJOR=$(echo $NODE_VERSION | cut -d. -f1)
    
    if [ "$CURRENT_MAJOR" -lt "$REQUIRED_MAJOR" ]; then
        log_warning "当前 Node.js 版本: v$NODE_VERSION (需要 >= v20.9.0)"
        log_info "使用 nvm 安装 Node.js 20..."
        
        nvm install 20
        nvm use 20
        nvm alias default 20
        
        NEW_VERSION=$(node --version)
        log_success "Node.js 已升级到: $NEW_VERSION"
    else
        log_success "Node.js 已安装: v$NODE_VERSION (满足要求)"
    fi
else
    log_info "使用 nvm 安装 Node.js 20..."
    nvm install 20
    nvm use 20
    nvm alias default 20
    
    if command -v node &> /dev/null; then
        log_success "Node.js 已安装: $(node --version)"
    else
        log_error "Node.js 安装失败"
        exit 1
    fi
fi

# 安装前端依赖
if [ -d "frontend" ]; then
    log_info "安装前端依赖..."
    cd frontend
    
    # 使用国内镜像加速（可选）
    # npm config set registry https://registry.npmmirror.com
    
    npm ci || npm install
    
    log_info "构建前端..."
    npm run build
    
    cd "$SCRIPT_DIR"
    log_success "前端构建完成"
else
    log_warning "未找到 frontend 目录"
fi

log_info "DiagramAI 已集成到前端应用中,无需单独构建"

################################################################################
# 6. 创建必要的数据目录
################################################################################
log_info "步骤 6/7: 创建数据目录..."

mkdir -p notebook_data/sqlite-db
mkdir -p notebook_data/tiktoken-cache
mkdir -p notebook_data/uploads
mkdir -p surreal_data

log_success "数据目录创建完成"

################################################################################
# 7. 创建环境变量文件（如果不存在）
################################################################################
log_info "步骤 7/7: 检查环境配置..."

if [ ! -f ".env" ]; then
    log_info "创建 .env 文件..."
    cat > .env << 'EOF'
# SurrealDB 配置
SURREALDB_URL=http://localhost:8000
SURREALDB_USER=root
SURREALDB_PASS=root
SURREALDB_NS=test
SURREALDB_DB=test

# SurrealDB 配置 (API 使用的环境变量名称)
SURREAL_URL=ws://localhost:8000/rpc
SURREAL_USER=root
SURREAL_PASSWORD=root
SURREAL_NAMESPACE=test
SURREAL_DATABASE=test

# API 配置
API_HOST=0.0.0.0
API_PORT=5055

# 前端配置
FRONTEND_PORT=8502

# 数据目录
DATA_DIR=./notebook_data
UPLOADS_DIR=./notebook_data/uploads

# 日志级别
LOG_LEVEL=INFO
EOF
    log_success ".env 文件已创建，请根据需要修改配置"
else
    log_success ".env 文件已存在"
fi

log_success "所有安装步骤完成！"

echo ""
echo "=========================================="
echo "安装完成！"
echo "=========================================="
echo ""
echo "接下来的步骤:"
echo ""
echo "1. 启动服务:"
echo "   ./start_services.sh"
echo ""
echo "2. 停止服务:"
echo "   ./stop_services.sh"
echo ""
echo "3. 查看日志:"
echo "   tail -f logs/*.log"
echo ""
echo "=========================================="
