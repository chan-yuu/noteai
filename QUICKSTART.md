# NotebookAI 快速启动

## 快速开始

```bash
# 1. 首次安装 (仅需一次)
./setup_and_run.sh

# 2. 启动所有服务
./start_services.sh

# 3. 停止服务
./stop_services.sh

# 4. 查看状态
./check_status.sh

# 5. 清理旧的 DiagramAI 文件 (可选,节省 2GB 空间)
./cleanup_diagramai.sh
```

## 访问地址

- **NotebookAI 主应用**: http://localhost:8502
- **DiagramAI (已集成)**: http://localhost:8502/diagramai
- **后端 API**: http://localhost:5055
- **SurrealDB**: http://localhost:8000

> 注意: DiagramAI 已完全集成到 NotebookAI 前端中,不再作为独立服务运行

## 服务架构

```
┌──────────────────────────────┐
│   NotebookAI Frontend        │
│   http://localhost:8502      │
│   ┌────────────────────────┐ │
│   │  DiagramAI 集成页面    │ │
│   │  /diagramai            │ │
│   └────────────────────────┘ │
└──────────────┬───────────────┘
               │
    ┌──────────▼──────────┐
    │   Backend API       │
    │   :5055             │
    └──────────┬──────────┘
               │
    ┌──────────▼──────────┐
    │   SurrealDB         │
    │   :8000             │
    └─────────────────────┘
```

## 日志位置

```bash
logs/
├── surrealdb.log    # SurrealDB 数据库日志
├── api.log          # 后端 API 日志
└── frontend.log     # 前端服务日志 (包含 DiagramAI)
```

查看日志: `tail -f logs/*.log`
