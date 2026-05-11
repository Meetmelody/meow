# 部署说明 / Deployment

> 当前线上版本：**v0.3.x**（中文单语精简 + UI 真图接入完成）

## 一、当前部署方式

| 项 | 配置 |
| --- | --- |
| 平台 | [Vercel](https://vercel.com/) |
| 框架 | Vite + Phaser 3（纯静态，无后端、无数据库） |
| 触发方式 | 推送到 `main` → 自动 Production 部署；其它分支 / PR → Preview |
| 配置文件 | `vercel.json`（锁定 framework / build / output） |

## 二、线上访问地址

- **Production**：[https://reborn-as-a-cat.vercel.app](https://reborn-as-a-cat.vercel.app) ← 稳定别名，永远指向最新生产版本
- **Project Inspector**：[Vercel Dashboard](https://vercel.com/meetmelodyin-8018s-projects/reborn-as-a-cat)
- **GitHub 仓库**：[Meetmelody/meow](https://github.com/Meetmelody/meow)

> ✅ **GitHub 自动部署已启用**（Vercel 项目已绑定 `Meetmelody/meow`）。
> - `main` 分支：每次 push 自动部署到 Production，URL 别名 `reborn-as-a-cat.vercel.app` 自动指向最新版
> - 其它分支 / PR：自动产生独立 Preview URL（评论也会贴到 PR 里）
> - 本地兜底：仍可随时 `npx vercel --prod` 手动发布（约 30 秒，绕开 Git）

## 三、本地命令

```bash
npm install        # 安装依赖
npm run dev        # 本地开发：http://127.0.0.1:5173
npm run build      # 生产构建：输出到 dist/
npm run preview    # 本地预览生产构建
npm run lint       # ESLint
```

## 四、Vercel 项目配置（已写入 `vercel.json`）

| 项 | 值 |
| --- | --- |
| Framework Preset | `vite` |
| Build Command | `npm run build` |
| Output Directory | `dist` |
| Install Command | `npm install` |
| Development Command | `npm run dev` |
| Root Directory | `./`（仓库根） |
| Node 版本 | Vercel 默认（Node 20+） |

无需任何环境变量（项目无后端）。

## 五、首次部署流程（已完成，仅备查）

```bash
# 1. 安装 Vercel CLI（如已安装可跳过）
npm install -g vercel

# 2. 登录（在浏览器完成账号授权）
vercel login

# 3. 项目关联：按提示选 scope、给项目命名（建议 meow-manor）
vercel link

# 4. 第一次正式部署到 Production
vercel --prod
```

执行 `vercel link` 后会生成 `.vercel/project.json`（已加入 `.gitignore`，不会进仓库）。

## 六、日常重新部署 ＝ Git Push

`main` 分支与 Vercel 项目已绑定，**任何 `git push origin main` 都会自动触发 Production 部署**：

```bash
git add .
git commit -m "your message"
git push origin main
```

去 [Vercel Dashboard](https://vercel.com/dashboard) 看项目可见构建日志和 deploy 历史。

如果只想发布"预览版"自测（不推到 production）：

```bash
vercel        # 创建 preview，输出独立 URL
```

需要把某个 preview "提"为 production：

```bash
vercel promote <preview-url>     # 不重新构建，直接切换 production 别名
```

紧急回滚：

```bash
vercel rollback                  # 回滚到上一个 production
```

## 七、资源路径与 Vite base 说明

- `vite.config.js` 的 `base: './'`：构建产物里 `index.html` 用的是相对路径（`./assets/index-XXX.js`），同时兼容根目录和子路径部署。
- Phaser 资源路径走 `assetManifest.js` 里的 `'assets/images/...'`（无前导 `/`），浏览器从当前页面 URL 解析为绝对地址。
- `public/assets/` 下的所有图片在构建时被 Vite 原样复制到 `dist/assets/`，**不会被打进 JS bundle**。新增图片直接放到 `public/assets/...` 即可。

## 八、常见问题排查

### 1. 部署后图片丢失（404）
- 确认 PNG 真的在 `public/assets/images/...` 下（仓库里能看到）
- 确认 `assetManifest.js` 里的 `path` 与文件实际大小写一致（macOS 大小写不敏感、Linux 敏感）
- 浏览器 DevTools → Network 看实际请求 URL，与 dist 里的资源结构对照

### 2. 字体没加载
- `index.html` 通过 Google Fonts CDN 引入 `Ma Shan Zheng` / `Noto Sans SC`
- 若离线/墙后访问，字体会 fallback 到系统字体；不影响游戏可玩性

### 3. 控制台警告 `[Preload] missing asset, fallback to placeholder`
- 这是**预期行为**：缺图时由 PreloadScene 用 Phaser Graphics 生成占位
- 补真图后该警告自动消失

### 4. `vercel --prod` 报构建失败
- 先在本地跑 `npm run build` 确认能通过
- 看 Vercel Dashboard 的 build log 定位具体报错
- 若是依赖问题：本地 `rm -rf node_modules dist && npm install && npm run build` 复现

### 5. localStorage 存档丢失
- Vercel 部署的域名变了 → localStorage 是按域名隔离的，不同 preview URL 各自独立
- 用 production 的固定域名（`*.vercel.app`）才能保留存档

## 九、下一步候选优化

- 自定义域名（Vercel Dashboard → Project → Settings → Domains）
- bundle 体积（当前 1.27 MB / gzip 353 KB）：按需 import Phaser 子模块、拆 chunk
- 加 PWA manifest，支持移动端"添加到主屏幕"

---

**最后更新**：2026-05-10
