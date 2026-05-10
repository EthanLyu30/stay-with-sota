# Contributing to SOTA Daily

感谢你对 SOTA Daily 的兴趣！我们欢迎所有形式的贡献。

## 如何贡献

### 报告问题

1. 检查是否已有类似 issue
2. 创建新 issue，包含：
   - 问题描述
   - 复现步骤
   - 期望行为
   - 实际行为
   - 环境信息（Node.js 版本、操作系统等）

### 提交代码

1. Fork 本仓库
2. 创建功能分支：`git checkout -b feature/amazing-feature`
3. 提交更改：`git commit -m 'Add amazing feature'`
4. 推送分支：`git push origin feature/amazing-feature`
5. 创建 Pull Request

### 开发环境设置

```bash
# 克隆仓库
git clone https://github.com/EthanLyu30/stay-with-sota.git
cd stay-with-sota

# 安装依赖
npm install

# 配置环境变量
cp .env.example .env.local
# 编辑 .env.local 填入必要配置

# 启动开发服务器
npm run dev
```

### 代码规范

- 使用 TypeScript 严格模式
- 遵循现有代码风格
- 添加必要的注释
- 确保 `npm run type-check` 通过
- 确保 `npm run lint` 通过
- 确保 `npm test` 通过

### 提交信息规范

我们使用 [Conventional Commits](https://www.conventionalcommits.org/)：

- `feat:` 新功能
- `fix:` 修复
- `docs:` 文档
- `style:` 格式（不影响代码含义）
- `refactor:` 重构
- `test:` 测试
- `chore:` 构建/工具

### 测试

- 为新功能添加单元测试
- 确保所有测试通过
- 保持测试覆盖率

## 行为准则

- 尊重所有参与者
- 接受建设性批评
- 关注对社区最有利的事情

## 许可证

通过贡献代码，你同意你的贡献将在 MIT 许可证下发布。
