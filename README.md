# NotebookAI
## 📅 待办事项清单 (Current Tasks)

### 🎙️ 一：AI 播客 (AI Podcast)
- [ ] **策划阶段**
    - [ ] 确定本期主题（例如：Transformer 架构解析）
    - [ ] 邀请嘉宾或准备单口大纲
- [ ] **制作阶段**
    - [ ] 录制音频素材
    - [ ] 使用 AI 工具（如 Adobe Podcast）进行降噪处理
    - [ ] 剪辑与合成背景音乐
- [ ] **发布阶段**
    - [ ] 生成 Shownotes（时间轴 + 简介）
    - [ ] 上传至托管平台 (Spotify/Apple/小宇宙)

### 💻 二：AI 代码审查 (AI Code Review)
- [ ] **环境配置**
    - [x] 申请 OpenAI/Claude API Key - [ ] 配置本地开发环境 (Python/Node.js)
- [ ] **功能开发**
    - [ ] 编写 Prompt：`你是一个资深架构师，请审查这段代码...`
    - [ ] 开发 GitHub Action 或 GitLab CI 集成脚本
    - [ ] 测试：针对一段充满 Bug 的代码进行测试
- [ ] **部署上线**
    - [ ] 编写使用文档 (README.md)
    - [ ] 
<img width="2560" height="1537" alt="1" src="https://github.com/user-attachments/assets/1ae14083-7357-4cc5-9ee7-792451c3014b" />

<img width="2560" height="1537" alt="2" src="https://github.com/user-attachments/assets/21190bc5-d683-48d1-9094-0d54c3143510" />


<img width="2560" height="1537" alt="3" src="https://github.com/user-attachments/assets/60d07888-510d-4da0-8660-a9f15bd4fa67" />

## 快速开始

```bash
# 1. 首次安装 (仅需一次)
./setup_and_run.sh

# 2. 启动所有服务
./start_services.sh

# 3. 停止服务
./stop_services.sh

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
