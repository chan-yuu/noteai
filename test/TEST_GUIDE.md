# NotebookAI 功能测试指南

本指南提供了通过详细步骤和资源来测试 NotebookAI 核心功能的说明。

## 1. 来源管理 (Source Management)

### 目标
验证系统是否能正确导入、处理和嵌入外部知识来源（URL 和文件）。

### 测试用例 A: URL 来源 (论文)
1.  打开 **来源 (Sources)** 页面 (`/sources`) 或使用命令面板 (`Ctrl+K` -> "新建来源")。
2.  选择 **URL** 选项卡。
3.  输入以下任一 URL:
    *   **Attention Is All You Need (Transformer 论文)**: `https://arxiv.org/abs/1706.03762`
    *   **Llama 2: Open Foundation and Chat Models**: `https://arxiv.org/abs/2307.09288`
    *   **Segment Anything**: `https://arxiv.org/abs/2304.02643`
4.  点击 **导入 (Import)**。
5.  **验证**:
    *   来源出现在列表中。
    *   状态变为 "已处理 (Processed)" (绿色对勾)。
    *   点击来源可查看解析后的内容。

### 测试用例 B: 本地文件来源 (Markdown)
1.  打开 **来源** 页面。
2.  选择 **文件 (File)** 选项卡。
3.  上传本目录提供的示例文件:
    *   `test/sample_perception_knowledge.md`
4.  点击 **导入**。
5.  **验证**:
    *   来源列表中出现标题为 "Autonomous Driving Perception Systems..." 的文件。
    *   状态变为 "已处理"。

---

## 2. 摘要与笔记本对话 (Summarization & Notebook Chat)

### 目标
验证 AI 是否能基于笔记本的特定上下文回答问题。

### 准备工作
1.  创建一个新笔记本 (`/notebooks`)，标题为 **"自动驾驶研究"**。
2.  将 **"Autonomous Driving Perception Systems..."** 来源添加到此笔记本中（使用上下文选择器或拖拽）。

### 测试提示词 (Prompts)
在笔记本聊天界面（底部输入栏）使用以下提示词：

**摘要类:**
> 请总结一下自动驾驶感知系统中的主要传感器类型及其优缺点。

> 什么是"Deep Fusion"？它与Early Fusion和Late Fusion有什么区别？

**细节检索类:**
> 解释一下BevFormer的作用是什么？

**综合分析类:**
> 基于提供的知识，如果我要在恶劣天气下（如大雾）进行物体检测，应该主要依赖哪种传感器？为什么？

**验证**:
*   AI 应明确引用 `sample_perception_knowledge.md` 中的内容。
*   回答应提及 LiDAR、摄像头、雷达及其具体优缺点。

---

## 3. 全局搜索与提问 (Global Search & Ask)

### 目标
验证跨所有已处理来源的全局搜索能力 (`/search`)。

### 测试用例 A: 搜索模式 (Search Mode)
*   **查询词**: `sensor fusion`
*   **预期结果**: 应列出 "Autonomous Driving" 来源，并高亮显示 "Sensor Fusion Strategies" 章节。

### 测试用例 B: 询问模式 (Ask Mode)
将开关切换到 "询问 (Ask)"（或使用 `Ctrl+K` -> `__ask__`）。

**提示词:**
> 既然我们已经有了LiDAR，为什么还需要摄像头？

> 自动驾驶中遇到的长尾问题（Long-tail events）有哪些例子？

**验证**:
*   回答应综合全局知识库中的信息。
*   引用应链接回来源文件。

---

## 4. AI 绘图 (AI Diagramming)

### 目标
验证 DiagramAI 功能 (Mermaid.js 生成)。

### 访问方式
*   在侧边栏点击 **"AI绘图"** 或使用 `Ctrl+K` -> `diagramai`。

### 测试提示词
将以下提示词复制到 AI 绘图的聊天窗口中：

**流程图 (Flowchart):**
> 帮我画一个自动驾驶感知模块的数据处理流程图。从传感器输入（LiDAR, Camera, Radar）开始，经过数据预处理，然后是感知算法（检测、跟踪、分割），最后输出给规划模块。使用中文节点。

**类图 (Class Diagram):**
> 我正在设计一个电商系统，请画一个类图。包含 User, Order, Product, Payment 类。User 可以下多个 Order，Order 包含多个 Product，Order 关联一个 Payment。

**时序图 (Sequence Diagram):**
> 画一个用户登录的序列图。包含 User, Frontend, API Server, Database。包括成功的登录流程和密码错误的失败流程。

**思维导图 (Mindmap):**
> 生成一个关于“人工智能”的思维导图。包含机器学习、深度学习、自然语言处理、计算机视觉四个主要分支，并列举一些子技术。

**验证**:
*   等待 "生成中..." 状态结束。
*   画布上应出现渲染好的图表。
*   可以对图表进行缩放/平移。
*   左侧代码编辑器应显示有效的 Mermaid 语法。
