# forty-type

40%キーボード向けの、Vialキーマップを利用したタイピング練習アプリです。

MVPではCornix LPと`.vil`ファイルを対象にします。キーマップの解析はブラウザ内で完結し、外部へ送信しません。

## 開発

```sh
npm install
npm run dev
```

品質チェック:

```sh
npm run lint
npm run test
npm run test:e2e
npm run build
```

設計判断・MVP仕様・開発計画は[`docs/`](docs/)にあります。Workers Buildsの設定値は[`docs/cloudflare-builds.md`](docs/cloudflare-builds.md)を参照してください。
