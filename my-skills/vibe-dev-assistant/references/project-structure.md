# 标准项目目录结构规范

本规范旨在提供统一的项目组织方式，兼顾 AI 导航效率与开发灵活性。

---

## 🏗️ 模式选择

AI 在初始化项目时应根据需求复杂度选择合适的模式：

### 1. 极简模式 (Minimalist)
适用于：小型应用、脚本工具、单页 Web 项目（如：贪吃蛇游戏）。
```
project/
├── index.html             # (如果是 Web)
├── README.md
├── plan/                  # 项目分层执行计划 ( plan_XX_*.md )
├── my-skills/             # AI 辅助开发技能包
├── src/                   # 所有代码及资源
│   ├── css/
│   ├── js/
│   └── assets/            # 需要打包编译的资源
└── .gitignore
```

### 2. 工程模式 (Professional)
适用于：生产级后端、复杂前端应用、AI/ML 项目。
遵循下方的“核心层级结构”。

---

## 📂 核心层级结构 (工程模式)

### 顶层目录
```
project/
├── README.md              # 项目说明、安装与使用指南
├── my-skills/             # AI 辅助开发技能包 (核心 AI 资产)
├── package.json / requirements.txt  # 依赖清单
├── .gitignore             # Git 忽略规则
├── .env.example           # 环境变量模板（敏感信息不入库）
├── src/                   # 核心源代码核心逻辑
├── tests/                 # 测试代码
├── docs/                  # 文档与设计草稿
├── scripts/               # 运维、构建、批处理等自动化脚本
├── configs/               # 业务配置文件 (YAML/JSON)
├── data/                  # 静态数据（原始、处理后、示例数据）
├── assets/                # 多媒体资源 (设计稿、原始素材)
├── public/                # Web 项目静态公共资源 (不经编译直接暴露)
├── models/                # AI 模型权重、配置文件 (checkpoints, pth, onnx)
├── docker/                # 部署相关 (Dockerfile, compose 配置)
├── CLAUDE.md              # 【关键】项目当前上下文、规范备忘与开发进度 (AI 的长效记忆)
└── [Tool Configs]         # 允许在根目录存在的工具配置 (如 vite.config.ts, docker-compose.yml)
```

### 🧪 AI/ML 项目补充 (扩展结构)
针对深度学习与数据科学项目，增加以下目录：
```
project/
├── models/                # 模型存档 (建议在 .gitignore 中忽略大文件)
│   ├── pretrained/        # 预训练模型
│   └── checkpoints/       # 训练中的检查点
├── notebooks/             # Jupyter Analysis & Experiments
├── results/               # 训练产出（图表、最终模型报告、可视化）
└── experiments/           # 实验配置 (YAML) 与运行日志
```

### 🧠 src/ 内部结构 (建议)

为支持前后端及 AI 任务的解耦，建议采用以下分层：

```
src/
├── main.py / index.ts     # 程序入口
├── api/ / routes/         # 接口定义（路由、Controller）
├── services/ / logic/     # 核心业务逻辑实现 (Service 层)
├── models/                # 【重要】数据库实体/模型定义 (Code Only)
├── repository/            # 数据访问控制 (DAO/CRUD 封装)
├── schemas/               # 数据验证/序列化 (Pydantic, DTO, Zod)
├── middlewares/           # 拦截器、跨域、鉴权等插件
├── core/                  # 系统级核心（引擎、基础算法、常量）
├── components/            # 前端 UI 组件 (Web 项目专用)
├── utils/                 # 无状态通用工具函数
└── config/                # 代码内默认配置 (非敏感)
```

> **注意**：
> 1. **顶级 `models/`** 存放二进制模型权重 (如 `.pth`, `.onnx`)。
> 2. **`src/models/`** 存放描述数据的代码 (如 SQLAlchemy 类, TypeScript Type)。

---

## 🛠️ AI 生成约定 (执行戒律)

1.  **非必留根目录原则**：除 README、依赖清单和必要的工具配置文件外，**禁止**在根目录直接堆放业务代码文件。
2.  **分层清晰原则**：后端代码禁止在 `api/` 层直接编写复杂的数据库 SQL。逻辑应下沉到 `services/` 或 `repository/`。
3.  **语义优先**：文件夹命名必须具有明确的学科语义。例如：存图片用 `assets/images/` 而不是 `stuff/`。
4.  **技术栈随俗**：
    *   **Python 项目**：保留 `__init__.py`，遵循 PEP8。
    *   **Frontend 项目**：优先遵循框架官方约定目录（如 Vite 的 `public/`）。
5.  **隔离性**：永远不要让 `data/` (静态数据) 和 `src/` (业务代码) 的职责发生重叠。

---

## 📊 生成规则汇总

| 类别 | 存放路径 | 命名约定 | 备注 |
| :--- | :--- | :--- | :--- |
| **执行计划** | `/plan` | `plan_序位_任务.md` | 必须严格遵守序位递增 |
| **业务逻辑** | `/src/core` | 小写、下划线/连字符 | 禁止存放配置 |
| **单元测试** | `/tests/unit` | `test_*` 或 `*.test.*` | 镜像 src 结构 |
| **工具脚本** | `/scripts` | 动词开头 | 包含 `setup`, `deploy`, `migrate`, `clean` 等 |
| **项目上下文** | `CLAUDE.md` | 固定命名 | 包含核心命令、代码风格要求、当前进度 |
| **镜像构建** | `/docker` | 语义化文件夹 | 存放复杂的 Docker 编排 |
| **临时输出** | `/output` | 时间戳后缀 | 必须在 .gitignore 中忽略 |

