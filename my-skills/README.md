# My Skills - AI 开发技能包

这是我的 AI 辅助开发技能集合。**新建项目时，将此文件夹复制到项目根目录即可使用。**

---

## 📋 使用方法

### 1. 复制到新项目
```powershell
xcopy "D:\vibe coding\my-skills" "D:\你的新项目\my-skills" /E /I
```

### 2. 告诉 AI 开始开发
```
请参考 my-skills 目录中的技能，帮我开发一个 xxx 项目
```

AI 会自动：
- 读取技能目录
- 按需加载相关技能
- 按规范创建目录结构
- 生成符合规范的代码

---

## 📁 包含的技能

### 🔧 自定义技能

| 技能 | 描述 | 使用场景 |
|------|------|----------|
| **vibe-dev-assistant** | 综合开发助手 | 项目规划、代码开发、结构标准化、Glue Coding |

### 🏢 Claude 官方技能

| 技能 | 描述 | 使用场景 |
|------|------|----------|
| **frontend-design** | 前端设计 | 创建高质量、独特的前端界面，避免 AI 风格泛化设计 |
| **webapp-testing** | Web 应用测试 | 使用 Playwright 自动化测试 Web 应用 |
| **mcp-builder** | MCP 服务器构建 | 创建 MCP 服务器让 AI 与外部服务交互 |
| **skill-creator** | 技能创建器 | 学习如何创建新的技能 |
| **web-artifacts-builder** | Web 工件构建 | 构建可交互的 Web 组件和工件 |

---

## 🎯 技能触发说明

AI 会根据你的需求自动选择合适的技能：

| 你说的话 | AI 会加载的技能 |
|----------|----------------|
| "帮我开发一个项目" | vibe-dev-assistant |
| "创建一个漂亮的登录页面" | frontend-design |
| "测试这个 Web 应用" | webapp-testing |
| "创建一个 MCP 服务器" | mcp-builder |
| "帮我创建一个新技能" | skill-creator |
| "构建一个可交互组件" | web-artifacts-builder |

---

## 💡 快速开始指令

复制以下指令给 AI，快速开始新项目：

```
请参考 my-skills 目录中的技能：
1. 帮我创建一个 [项目名称] 项目
2. 按照 vibe-dev-assistant 的标准目录结构初始化
3. 生成项目计划文档
4. 开始核心功能开发
```

---

## 🔧 添加新技能

在此目录下创建新文件夹，包含 `SKILL.md` 即可：

```
my-skills/
├── README.md
├── vibe-dev-assistant/
├── frontend-design/
├── webapp-testing/
├── mcp-builder/
├── skill-creator/
├── web-artifacts-builder/
└── 你的新技能/
    └── SKILL.md
```

---

## 📊 技能统计

- **总计**: 6 个技能
- **自定义**: 1 个
- **官方**: 5 个
- **总大小**: ~50 个文件
