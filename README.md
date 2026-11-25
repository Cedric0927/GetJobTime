# LuckyJob

## 前端生产发布

前端由 `124.222.76.67` 的 Nginx 提供服务，域名为 `jobinfo.apphome.me`；Vercel Git 自动部署已关闭。GitHub Actions 在 `main` 推送后安装锁定依赖、运行 ESLint 和构建，通过后再上传独立发布目录并原子切换 `/var/www/luckyjob/current`。旧发布目录保留供回滚，后端部署流程不变。

首发前在本仓库的 Actions Secrets 配置专用部署密钥 `LUCKYJOB_SSH_PRIVATE_KEY` 和经过独立确认的服务器公钥记录 `LUCKYJOB_SSH_KNOWN_HOSTS`。不要复用个人 SSH 私钥。也可从 `main` 手动运行该工作流；本地应急发布仍可使用 `pwsh -File scripts/deploy-frontend.ps1`。

首次配置参考 `deploy/luckyjob.nginx.conf`；它只用于初次启用 HTTP，不能覆盖 Certbot 管理的线上 HTTPS 配置。

## 运营日报

- 入口：`/admin/analytics`。日报以北京时间自然日汇总，支持近 7 天和 30 天。
- 上线前，在后端 systemd 服务的环境文件里配置独立的高强度 `JOBTIME_ANALYTICS_TOKEN`，不要写进 Git 或前端环境变量。部署后端时执行 Alembic 迁移，再发布前端。
- 发布后验证：不带令牌查询日报应返回 `401`；在页面输入令牌应能查询。正常浏览一次公开首页后，刷新日报检查页面浏览事件。UV 是匿名浏览器数，不等于真实人数。
- 不回填历史数据。公开事件可能受浏览器拦截或自动访问影响，不作为精确审计数据。

## React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
