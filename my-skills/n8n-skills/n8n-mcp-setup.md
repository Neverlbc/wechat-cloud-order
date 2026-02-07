# n8n-MCP 服务器配置指南

本指南帮助您配置 n8n-mcp MCP 服务器，以便使用 n8n 工作流技能。

---

## 🚀 快速开始

### 方式一：托管服务（最简单，无需安装）☁️

最快捷的方式，无需安装配置：

👉 [dashboard.n8n-mcp.com](https://dashboard.n8n-mcp.com)

- ✅ 免费版：每天 100 次工具调用
- ✅ 即时访问：立即开始构建工作流
- ✅ 始终最新：最新的 n8n 节点和模板

只需注册、获取 API 密钥，然后连接到您的 MCP 客户端。

---

## 🏠 本地安装选项

### 前提条件

- [Node.js](https://nodejs.org/) 已安装

### 方式 A：使用 npx（快速本地设置）🚀

```bash
# 直接运行（无需安装）
npx n8n-mcp
```

### 方式 B：使用 Docker（隔离且可重复）🐳

```bash
# 拉取 Docker 镜像（约 280MB）
docker pull ghcr.io/czlonkowski/n8n-mcp:latest
```

---

## ⚙️ 配置 MCP 客户端

### 配置文件位置

| 系统 | 路径 |
|------|------|
| **macOS** | `~/Library/Application Support/Claude/claude_desktop_config.json` |
| **Windows** | `%APPDATA%\Claude\claude_desktop_config.json` |
| **Linux** | `~/.config/Claude/claude_desktop_config.json` |

### 基础配置（仅文档工具）

```json
{
  "mcpServers": {
    "n8n-mcp": {
      "command": "npx",
      "args": ["n8n-mcp"],
      "env": {
        "MCP_MODE": "stdio",
        "LOG_LEVEL": "error",
        "DISABLE_CONSOLE_OUTPUT": "true"
      }
    }
  }
}
```

### 完整配置（包含 n8n 管理工具）

```json
{
  "mcpServers": {
    "n8n-mcp": {
      "command": "npx",
      "args": ["n8n-mcp"],
      "env": {
        "MCP_MODE": "stdio",
        "LOG_LEVEL": "error",
        "DISABLE_CONSOLE_OUTPUT": "true",
        "N8N_API_URL": "https://your-n8n-instance.com",
        "N8N_API_KEY": "your-api-key"
      }
    }
  }
}
```

### Docker 完整配置

```json
{
  "mcpServers": {
    "n8n-mcp": {
      "command": "docker",
      "args": [
        "run",
        "-i",
        "--rm",
        "--init",
        "-e", "MCP_MODE=stdio",
        "-e", "LOG_LEVEL=error",
        "-e", "DISABLE_CONSOLE_OUTPUT=true",
        "-e", "N8N_API_URL=https://your-n8n-instance.com",
        "-e", "N8N_API_KEY=your-api-key",
        "ghcr.io/czlonkowski/n8n-mcp:latest"
      ]
    }
  }
}
```

> 💡 **提示**: 如果您在同一台机器上本地运行 n8n（例如通过 Docker），请使用 `http://host.docker.internal:5678` 作为 `N8N_API_URL`。

---

## 🔑 获取 n8n API 密钥

1. 登录您的 n8n 实例
2. 进入 **Settings** → **API**
3. 点击 **Create API Key**
4. 复制生成的密钥

---

## 📡 可用的 MCP 工具

### 核心工具（7 个）

| 工具 | 描述 |
|------|------|
| `search_nodes` | 按关键词搜索节点 |
| `get_node` | 获取节点详情 |
| `validate_node` | 验证节点配置 |
| `validate_workflow` | 验证完整工作流 |
| `search_templates` | 搜索工作流模板 |
| `get_template` | 获取模板详情 |
| `tools_documentation` | 工具元文档 |

### n8n 管理工具（13 个，需要 API 配置）

| 工具 | 描述 |
|------|------|
| `n8n_create_workflow` | 创建新工作流 |
| `n8n_update_partial_workflow` | 增量更新工作流 |
| `n8n_validate_workflow` | 按 ID 验证 |
| `n8n_autofix_workflow` | 自动修复问题 |
| `n8n_deploy_template` | 部署模板 |
| `n8n_workflow_versions` | 版本历史和回滚 |
| `n8n_test_workflow` | 测试执行 |
| `n8n_executions` | 管理执行 |

---

## ⚠️ 安全警告

**永远不要直接用 AI 编辑生产工作流！**

- 🔄 在使用 AI 工具之前，先复制您的工作流
- 🧪 首先在开发环境中测试
- 💾 导出重要工作流的备份
- ⚡ 部署到生产环境之前验证更改

---

## 📚 更多文档

- [Claude Code 设置](https://github.com/czlonkowski/n8n-mcp/blob/main/docs/CLAUDE_CODE_SETUP.md)
- [VS Code 设置](https://github.com/czlonkowski/n8n-mcp/blob/main/docs/VS_CODE_PROJECT_SETUP.md)
- [Cursor 设置](https://github.com/czlonkowski/n8n-mcp/blob/main/docs/CURSOR_SETUP.md)
- [Antigravity 设置](https://github.com/czlonkowski/n8n-mcp/blob/main/docs/ANTIGRAVITY_SETUP.md)

---

## 🔗 相关链接

- [n8n-mcp GitHub](https://github.com/czlonkowski/n8n-mcp)
- [n8n-skills GitHub](https://github.com/czlonkowski/n8n-skills)
- [n8n 官网](https://n8n.io/)
