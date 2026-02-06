# 🎉 多服务商支持 & 模型推荐配置

本项目已完成对国内便宜API服务商的多服务商同时支持！

## ✨ 新特性

### 1. 同时支持多个OpenAI兼容服务商
- ✅ 阿里云百炼 (DashScope)
- ✅ 硅基流动 (SiliconFlow)  
- ✅ 火山方舟/豆包 (Volcengine)
- ✅ DeepSeek (原生支持)

### 2. 独立的Provider选项
每个服务商在UI中显示为独立的Provider，可以自由切换。

### 3. 移除了外部文档链接
- 移除了"了解如何配置服务商 →"链接
- 移除了"我该选择哪个模型？→"链接
- 更简洁的用户界面

## 📁 新增文档

### 1. `CHINESE_PROVIDERS.md`
详细的国内服务商配置指南：
- 每个服务商的介绍
- 环境变量配置方法
- 常见问题解答
- 技术实现细节

### 2. `MODEL_RECOMMENDATIONS.md` ⭐
**强烈推荐阅读**！包含：
- 三种配置方案（极致性价比/平衡/火山方舟）
- 详细的模型推荐和价格对比
- 完整的配置示例
- 实际成本估算
- 快速配置检查清单

### 3. `setup_recommended_models.py`
快速配置脚本（容器内运行）：
```bash
docker exec -it <container_id> python3 setup_recommended_models.py
```

### 4. `test_providers.py`
测试多服务商配置的脚本。

## 🚀 快速开始

### 1. 查看推荐配置
```bash
cat MODEL_RECOMMENDATIONS.md
```

### 2. 确认环境变量
你的 `docker-compose.yml` 已经配置好了：
- ✅ DASHSCOPE_BASE_URL + API_KEY
- ✅ SILICONFLOW_BASE_URL + API_KEY
- ✅ VOLCENGINE_BASE_URL + API_KEY
- ✅ DEEPSEEK_API_KEY

### 3. 重启服务
```bash
docker-compose down
docker-compose up -d
```

### 4. 添加推荐模型

访问 http://localhost:8502 → Settings → Models

#### 语言模型 (Language)
```
1. Provider: siliconflow, Model: Qwen/Qwen2.5-7B-Instruct (日常)
2. Provider: siliconflow, Model: deepseek-ai/DeepSeek-V3 (复杂)
3. Provider: dashscope, Model: qwen-turbo (备用)
```

#### 嵌入模型 (Embedding)
```
1. Provider: siliconflow, Model: BAAI/bge-large-zh-v1.5 (推荐)
```

#### 设置默认模型
- Default Chat Model: Qwen/Qwen2.5-7B-Instruct
- Default Transformation Model: deepseek-ai/DeepSeek-V3
- Default Embedding Model: BAAI/bge-large-zh-v1.5
- Large Context Model: qwen-turbo
- Tools Model: deepseek-ai/DeepSeek-V3

## 💰 成本优势

使用推荐配置，每月成本不到2元！

| 场景 | 每月tokens | 硅基流动成本 | OpenAI成本 | 节省 |
|------|------------|--------------|------------|------|
| 轻度使用 | 1M | ¥1.88 | ¥158 | 98.8% |
| 中度使用 | 5M | ¥9.40 | ¥790 | 98.8% |
| 重度使用 | 20M | ¥37.60 | ¥3160 | 98.8% |

## 🔧 代码修改

### 后端 (Python)
1. **api/routers/models.py**
   - 新增 `_check_named_openai_compatible_support()`
   - 添加 dashscope/siliconflow/volcengine 到 provider_status
   - 添加对新provider的类型支持检测

2. **open_notebook/ai/models.py**
   - 修改 `ModelManager.get_model()` 支持新provider
   - 添加 `Model.get_by_name_and_provider()` 辅助方法
   - 自动转换和注入 BASE_URL/API_KEY

### 前端 (TypeScript/React)
1. **frontend/src/app/(dashboard)/models/components/ProviderStatus.tsx**
   - 移除"了解如何配置服务商"链接

2. **frontend/src/app/(dashboard)/models/components/DefaultModelsSection.tsx**
   - 移除"我该选择哪个模型"链接

### 配置文件
1. **docker-compose.yml**
   - 更新为新的环境变量格式
   - 同时配置三个服务商

2. **.env.example**
   - 添加新服务商的配置示例

## 📊 推荐模型详情

### 极致性价比方案

#### 语言模型
- **Qwen/Qwen2.5-7B-Instruct** (siliconflow)
  - 价格: ¥0.00035/千tokens
  - 用途: 日常对话，快速响应
  - 特点: 超便宜，速度快

- **deepseek-ai/DeepSeek-V3** (siliconflow)
  - 价格: ¥0.0014/千tokens (输入)
  - 用途: 复杂推理，代码生成
  - 特点: 能力强大，最新模型

#### 嵌入模型
- **BAAI/bge-large-zh-v1.5** (siliconflow)
  - 价格: ¥0.0001/千tokens
  - 维度: 1024
  - 特点: 中文效果极好

## 🎯 使用建议

### 任务分配
- **日常对话**: Qwen2.5-7B → 最便宜
- **复杂分析**: DeepSeek-V3 → 强能力
- **长文档**: qwen-turbo → 稳定
- **文档嵌入**: BGE-Large-ZH → 专业

### 成本控制
1. 优先使用硅基流动的模型（最便宜）
2. 阿里云百炼作为备用（稳定）
3. 遇到限流时切换服务商
4. 监控各服务商的用量

## 📝 配置检查清单

- [ ] 已阅读 `MODEL_RECOMMENDATIONS.md`
- [ ] 环境变量已配置
- [ ] 容器已重启
- [ ] 已添加语言模型（至少2个）
- [ ] 已添加嵌入模型（至少1个）
- [ ] 已设置默认模型
- [ ] 已测试对话功能
- [ ] 已测试文档上传功能

## ❓ 常见问题

### Q: Provider列表中看不到新的服务商？
A: 检查环境变量是否正确配置，确保同时设置了 BASE_URL 和 API_KEY。

### Q: 添加模型时提示找不到provider？
A: 重启容器后等待30秒，让系统初始化。

### Q: 如何知道哪个服务商最便宜？
A: 查看 `MODEL_RECOMMENDATIONS.md` 中的价格对比表。

### Q: 可以只配置一个服务商吗？
A: 可以，但建议至少配置两个，互为备用。

### Q: 火山方舟如何获取模型名称？
A: 火山方舟需要在控制台创建推理接入点，使用接入点的 endpoint_id。

## 🔗 相关文档

- [国内服务商配置详解](./CHINESE_PROVIDERS.md)
- [模型推荐和配置指南](./MODEL_RECOMMENDATIONS.md) ⭐
- [原项目文档](./README.md)

## 🎁 获取API Key

### 阿里云百炼
https://dashscope.console.aliyun.com/

### 硅基流动  
https://cloud.siliconflow.cn/

### 火山方舟
https://console.volcengine.com/ark/

### DeepSeek
https://platform.deepseek.com/

---

**享受便宜又好用的AI服务！** 🚀
