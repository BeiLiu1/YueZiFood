# 悦子吃什么

一个给情侣日常点菜用的全栈 PWA：她在 iPhone 上翻菜单、一次点多道菜或许下新菜心愿；大厨在 PC 端维护分类、菜品、食谱和食材，处理订单并获得提醒。

## 已实现

- 数据库存储的管理员/普通用户、密码哈希、Cookie 会话和权限守卫
- 最多两级分类，一道菜可属于多个分类
- 菜品图片、上下架、食材用量和分步食谱管理
- 移动菜单搜索、多菜篮子、预约日期/餐次和留言
- 订单接单、备菜、完成、拒绝、取消及合并食材清单
- 新菜心愿的研究、拒绝、转菜品草稿和上架闭环
- 站内通知、可选 Web Push、PWA 主屏幕安装
- SQLite 自动迁移、Docker Compose、Caddy HTTPS 和备份脚本

## 本地运行

要求 Node.js 22.19+、pnpm 11。

```powershell
pnpm install
Copy-Item .env.example .env
# 修改 .env：至少填写 NUXT_SESSION_PASSWORD（32 位以上）和 BOOTSTRAP_ADMIN_PASSWORD（8 位以上）
pnpm dev
```

访问 `http://127.0.0.1:3000`。首次启动会自动执行迁移，并初始化 `ADMIN`、`USER` 两种角色和一个管理员。

## 公网部署

1. 把域名 A 记录指向服务器公网 IP，开放 80、443 TCP 和 443 UDP。
2. 复制 `.env.example` 为 `.env`，填写强随机密钥、管理员密码和 `DOMAIN`。
3. 如需推送，执行 `pnpm push:keys`，把输出写入 `VAPID_PUBLIC_KEY`、`VAPID_PRIVATE_KEY`，同时修改 `VAPID_SUBJECT`。
4. 启动：

```bash
docker compose up --build -d
```

Caddy 会自动申请和续期 HTTPS 证书。业务数据库在 `data/`，菜品图片在 `uploads/`。

## iPhone 安装

用 Safari 打开 HTTPS 域名，点击底部“分享”按钮，选择“添加到主屏幕”，再点击“添加”。iOS Web Push 需要从主屏幕图标启动应用，然后在“消息”页点击“开启”。

## 备份与验证

```bash
pnpm backup
pnpm test
pnpm typecheck
pnpm build
```

`pnpm backup` 会使用 SQLite 在线备份 API，将一致性数据库副本和上传图片写入 `backups/<时间>/`。恢复前应停止服务，并将备份中的 `yuezi.db` 和 `uploads/` 放回对应持久化目录。
