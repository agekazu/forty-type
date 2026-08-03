# Cloudflare Workers Builds

`forty-type` は静的アセットWorkerとして配信し、`wrangler.jsonc` をデプロイ設定の正とする。
`worker/index.js` の明示的な `fetch` ハンドラーは、非本番ブランチでの
`wrangler versions upload` にも有効なWorkerバージョンを登録するために使用する。
静的アセットはWorkerより先に配信され、ハンドラーはAssets bindingへフォールバックする。

Workers Buildsでは次の設定を使用する。

- Gitリポジトリ: `agekazu/forty-type`
- 本番ブランチ: `main`
- ビルドコマンド: `npm run build`
- 本番デプロイコマンド: `npx wrangler deploy`
- 非本番ブランチのデプロイコマンド: `npx wrangler versions upload`
- 非本番ブランチのビルド: 有効

非本番ブランチは本番へ昇格させず、バージョンごとのPreview URLを発行する。`main`へのマージ時だけ本番デプロイを行う。

## ローカル確認

```sh
npm run lint
npm run test
npm run test:e2e
npm run deploy:dry-run
```
