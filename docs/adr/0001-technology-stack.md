# ADR 0001: MVPの技術構成

## Status

Accepted

## Context

forty-typeは、40%キーボードのレイヤー操作を練習するブラウザアプリである。個人学習を目的に、読みやすく一般的な技術を使い、Cloudflareの無料枠で公開・運用できることを目標とする。

MVPではCornix LPの物理レイアウトをアプリへ同梱し、ユーザーが選択したVial `.vil`をブラウザ内で解析する。キーマップはサーバーへ送信しない。

## Decision

- UI: React 19 + TypeScript
- ビルド: Vite
- CSS: Tailwind CSS v4
- 配信: Cloudflare Workers Static Assets
- テスト: Vitest + Testing Library、E2EにPlaywright
- CI: GitHub Actions
- CD: Cloudflare Workers Builds（GitHub連携）
- パッケージ管理: npm

状態はReact標準のstateとreducerから開始する。Vialの読み込みはUIから分離し、アプリ固有のキーマップモデルへ変換する。MVPではデータベース、認証、WebHID、サーバー保存を導入しない。

## Consequences

- Vite・React・Tailwindの標準的な資料をそのまま学習に活かせる。
- 静的SPAとして小さく開始でき、キーマップのプライバシーを守れる。
- Cloudflare Workers Buildsの設定は、Cloudflare DashboardでGitHubリポジトリを接続して行う必要がある。
- 将来、汎用Vial対応には`.vil`に加え物理レイアウトを記した`vial.json`が必要になる。
