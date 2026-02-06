# 便宜好用的模型配置推荐

## 📋 快速配置指南

基于**性价比**和**功能完整性**，以下是推荐的模型配置方案。

---

## 🎯 推荐方案一：极致性价比（最便宜）

### 1️⃣ 语言模型 (Language Models)

#### 主力模型 - 硅基流动
```
Provider: siliconflow
Model Name: Qwen/Qwen2.5-7B-Instruct
用途: 日常对话、文档分析
价格: ¥0.00035/千tokens (输入), ¥0.00035/千tokens (输出)
特点: 超便宜，速度快，质量不错
```

#### 复杂任务模型 - 硅基流动
```
Provider: siliconflow  
Model Name: deepseek-ai/DeepSeek-V3
用途: 复杂推理、代码生成
价格: ¥0.0014/千tokens (输入), ¥0.0028/千tokens (输出)
特点: 强大的推理能力，DeepSeek最新模型
```

#### 备用模型 - DeepSeek官方
```
Provider: deepseek
Model Name: deepseek-chat
用途: 备用或对比
价格: ¥0.001/千tokens (输入), ¥0.002/千tokens (输出)
特点: 官方稳定，缓存价格更低
```

### 2️⃣ 嵌入模型 (Embedding Models)

#### 推荐 - 硅基流动
```
Provider: siliconflow
Model Name: BAAI/bge-large-zh-v1.5
用途: 中文文档嵌入、语义搜索
价格: ¥0.0001/千tokens
维度: 1024
特点: 中文效果好，价格极低
```

#### 备选 - 阿里云百炼
```
Provider: dashscope
Model Name: text-embedding-v3
用途: 通用嵌入
价格: ¥0.0005/千tokens
维度: 1536
特点: 质量稳定，中英文均好
```

### 3️⃣ 文字转语音 (Text-to-Speech)

**暂不推荐配置** - 国内服务商TTS支持有限，建议：
- 如需使用：配置 OpenAI 的 `tts-1` (¥0.015/千字符)
- 或使用本地方案：Coqui TTS (免费)

### 4️⃣ 语音转文字 (Speech-to-Text)

**暂不推荐配置** - 建议：
- 如需使用：配置 OpenAI 的 `whisper-1` (¥0.006/分钟)
- 或使用本地方案：Whisper.cpp (免费)

---

## 🎯 推荐方案二：平衡方案（稳定+便宜）

### 1️⃣ 语言模型 (Language Models)

#### 主力模型 - 阿里云百炼
```
Provider: dashscope
Model Name: qwen-turbo
用途: 日常对话、快速响应
价格: ¥0.002/千tokens (输入), ¥0.006/千tokens (输出)
特点: 阿里云官方，稳定性好，速度快
```

#### 复杂任务模型 - 阿里云百炼
```
Provider: dashscope
Model Name: qwen-plus
用途: 复杂推理、长文档
价格: ¥0.004/千tokens (输入), ¥0.012/千tokens (输出)
特点: 性能优秀，性价比高
```

#### 顶级模型 - 硅基流动
```
Provider: siliconflow
Model Name: deepseek-ai/DeepSeek-V3
用途: 最复杂的任务
价格: ¥0.0014/千tokens (输入), ¥0.0028/千tokens (输出)
特点: 能力强大，价格仍然很便宜
```

### 2️⃣ 嵌入模型 (Embedding Models)

#### 推荐 - 阿里云百炼
```
Provider: dashscope
Model Name: text-embedding-v3
用途: 所有嵌入任务
价格: ¥0.0005/千tokens
维度: 1536
特点: 质量稳定，中英文效果好
```

---

## 🎯 推荐方案三：火山方舟方案

### 1️⃣ 语言模型 (Language Models)

火山方舟需要先创建接入点，然后使用对应的模型ID。

```
Provider: volcengine
Model Name: <你的接入点endpoint_id>
用途: 根据你选择的底层模型
价格: 查看火山方舟控制台
特点: 字节跳动官方，可能需要单独配置
```

**注意**: 火山方舟使用接入点ID，不是模型名称。需要在控制台创建推理接入点后获取。

---

## 💾 完整配置示例

### Docker Compose 配置

```yaml
environment:
  # === 语言模型配置 ===
  
  # 硅基流动 - 便宜的主力
  - SILICONFLOW_BASE_URL=https://api.siliconflow.cn/v1
  - SILICONFLOW_API_KEY=sk-qtpxjyljhqipkoxdgcsbynhdvydtmqjzmtfuzwaojgwpdshg
  
  # 阿里云百炼 - 稳定的选择
  - DASHSCOPE_BASE_URL=https://dashscope.aliyuncs.com/compatible-mode/v1
  - DASHSCOPE_API_KEY=sk-ed28dce9908f432bacca53fcf76e92eb
  
  # DeepSeek官方 - 备用
  - DEEPSEEK_API_KEY=sk-28d7d669e40b406a91f76cdba0e7c5c5
  
  # 火山方舟 (可选)
  - VOLCENGINE_BASE_URL=https://ark.cn-beijing.volces.com/api/v3
  - VOLCENGINE_API_KEY=d891ecdc-caf0-404b-bb82-664e40cef71a
```

### 在UI中添加模型

1. 访问 **Settings → Models**

2. 点击 **"+ Add Model"** 添加以下模型：

#### 语言模型
```
✅ 添加: Qwen2.5-7B (日常对话)
   Type: language
   Provider: siliconflow
   Model Name: Qwen/Qwen2.5-7B-Instruct

✅ 添加: DeepSeek-V3 (复杂任务)
   Type: language
   Provider: siliconflow
   Model Name: deepseek-ai/DeepSeek-V3

✅ 添加: qwen-turbo (阿里云备用)
   Type: language
   Provider: dashscope
   Model Name: qwen-turbo
```

#### 嵌入模型
```
✅ 添加: BGE-Large-ZH (推荐)
   Type: embedding
   Provider: siliconflow
   Model Name: BAAI/bge-large-zh-v1.5
```

3. 在 **Default Models** 部分设置：
   - **Default Chat Model**: Qwen2.5-7B (日常对话)
   - **Default Transformation Model**: DeepSeek-V3 (文档处理)
   - **Large Context Model**: qwen-turbo (长文档)
   - **Default Embedding Model**: BGE-Large-ZH
   - **Tools Model**: DeepSeek-V3 (工具调用)

---

## 💰 价格对比表

| 服务商 | 模型 | 输入价格 | 输出价格 | 适用场景 |
|--------|------|----------|----------|----------|
| 硅基流动 | Qwen2.5-7B | ¥0.00035/千tokens | ¥0.00035/千tokens | 日常对话 ⭐ |
| 硅基流动 | DeepSeek-V3 | ¥0.0014/千tokens | ¥0.0028/千tokens | 复杂推理 ⭐⭐⭐ |
| DeepSeek | deepseek-chat | ¥0.001/千tokens | ¥0.002/千tokens | 通用任务 ⭐⭐ |
| 阿里云 | qwen-turbo | ¥0.002/千tokens | ¥0.006/千tokens | 快速响应 ⭐⭐ |
| 阿里云 | qwen-plus | ¥0.004/千tokens | ¥0.012/千tokens | 高质量 ⭐⭐⭐ |
| 阿里云 | qwen-max | ¥0.02/千tokens | ¥0.06/千tokens | 顶级能力 ⭐⭐⭐⭐ |
| OpenAI | gpt-4o-mini | $0.00015/千tokens | $0.0006/千tokens | 对比参考 |
| OpenAI | gpt-4o | $0.0025/千tokens | $0.01/千tokens | 高价参考 |

**嵌入模型价格**:
- 硅基流动 BGE: ¥0.0001/千tokens ⭐⭐⭐
- 阿里云 text-embedding-v3: ¥0.0005/千tokens ⭐⭐
- OpenAI text-embedding-3-small: $0.00002/千tokens (约¥0.00014)

---

## 🚀 快速开始步骤

### 1. 确认配置
```bash
# 检查docker-compose.yml中的环境变量
cat docker-compose.yml | grep -A2 "SILICONFLOW\|DASHSCOPE"
```

### 2. 重启服务
```bash
docker-compose down
docker-compose up -d
```

### 3. 访问并配置
```
浏览器打开: http://localhost:8502
进入: Settings → Models
按照上面的配置添加模型
```

### 4. 测试
```
进入 Chat 页面
发送测试消息
检查是否正常响应
```

---

## ❓ 常见问题

### Q1: 为什么推荐硅基流动？
A: 硅基流动价格极低（DeepSeek-V3只要¥0.0014/千tokens），但质量很好。适合高频使用场景。

### Q2: 阿里云百炼和硅基流动选哪个？
A: 
- **预算优先**: 硅基流动（便宜50-70%）
- **稳定优先**: 阿里云百炼（大厂服务）
- **最佳方案**: 两个都配置，按需切换

### Q3: 需要配置语音模型吗？
A: 如果不用Podcast功能，可以暂时不配置。需要时再添加OpenAI的语音模型。

### Q4: 嵌入模型怎么选？
A: 
- **中文为主**: BAAI/bge-large-zh-v1.5 (硅基流动)
- **中英文**: text-embedding-v3 (阿里云百炼)
- **预算充足**: OpenAI text-embedding-3-large

### Q5: 如何知道用了多少tokens？
A: 每个API服务商的控制台都有用量统计，可以实时查看消费。

---

## 📊 实际成本估算

假设每天使用：
- 对话：100次，平均每次500 tokens (输入) + 200 tokens (输出)
- 文档处理：10个，平均每个2000 tokens
- 嵌入：20个文档，平均每个5000 tokens

### 使用硅基流动方案
```
对话成本:
  输入: 100 × 0.5K × ¥0.00035 = ¥0.0175
  输出: 100 × 0.2K × ¥0.00035 = ¥0.007
  
文档处理:
  10 × 2K × ¥0.0014 = ¥0.028

嵌入:
  20 × 5K × ¥0.0001 = ¥0.01

每日总计: ¥0.0625
每月总计: ¥1.88
```

### 使用阿里云百炼方案
```
对话成本: ¥0.22/天
文档处理: ¥0.08/天  
嵌入: ¥0.05/天

每日总计: ¥0.35
每月总计: ¥10.5
```

**结论**: 硅基流动方案每月不到2元，阿里云方案约10元，都非常便宜！

---

## 🎁 额外福利

### 硅基流动优势
- 新用户送免费额度
- 多种开源模型可选
- API响应速度快

### 阿里云百炼优势  
- 企业级稳定性
- 中文优化好
- 有免费试用额度

### DeepSeek优势
- 缓存机制（重复内容价格降低95%）
- API稳定可靠
- 国内访问快

---

## 📝 配置检查清单

- [ ] 硅基流动 API Key 已配置
- [ ] 阿里云百炼 API Key 已配置  
- [ ] DeepSeek API Key 已配置
- [ ] 容器已重启
- [ ] 添加了 Qwen2.5-7B 语言模型
- [ ] 添加了 DeepSeek-V3 语言模型
- [ ] 添加了 BGE-Large-ZH 嵌入模型
- [ ] 设置了默认模型
- [ ] 测试对话功能正常

---

**建议**: 先使用推荐方案一（极致性价比），如果遇到限流或稳定性问题，再切换到方案二（平衡方案）。
