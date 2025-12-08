# 🚨 メニューファイル管理の重要事項

## ⚠️ 最大の注意事項

**`data/menu-schedule.ts`は必ずGit管理下に置くこと。このファイルがGit管理外（Untracked）になると、Vercelデプロイ時に古いメニューが使用され、重大な問題が発生します。**

## 🔴 過去に発生した問題

### 問題の概要
- **発生日**: 2024年12月8日
- **症状**: 先月の古いメニューが突然表示された
- **原因**: `data/menu-schedule.ts`がGit管理外（Untracked）だった

### 問題の原因

1. **Git管理外のファイルはVercelデプロイに含まれない**
   - VercelはGitリポジトリからファイルを取得するため、Untrackedファイルはデプロイに含まれない
   - その結果、以前のデプロイで使用された古いビルドキャッシュや、Gitにコミットされていた古いメニューファイルが使用される

2. **ビルドは成功するが、古いメニューが使われる**
   - ビルドエラーは発生しないため、問題に気づきにくい
   - ユーザーがアクセスすると、古いメニューが表示される

3. **自動更新機能との相互作用**
   - 30秒ごとの自動更新でデータベースから注文データを読み込む
   - 古いメニュー名の注文がデータベースに残っている場合、それが表示される

## ✅ 対策

### 1. Git管理の確認（必須）

メニューファイルを編集した後、**必ず**以下を実行：

```bash
# 1. Git管理下にあることを確認
git ls-files data/menu-schedule.ts

# 2. 変更をステージング
git add data/menu-schedule.ts

# 3. コミット
git commit -m "update: メニューを更新"

# 4. プッシュ
git push origin main
```

### 2. ビルド時の自動チェック

`package.json`にビルド前チェックスクリプトを追加済み。ビルド時に自動的にメニューファイルがGit管理下にあることを確認します。

### 3. .gitignoreの確認

`.gitignore`に`menu-schedule.ts`が含まれていないことを確認：

```bash
grep -i "menu-schedule" .gitignore
```

**結果が何も表示されないことを確認してください。**

### 4. デプロイ前の確認チェックリスト

デプロイ前に以下を確認：

- [ ] `git status`で`data/menu-schedule.ts`がUntrackedになっていないか
- [ ] `git ls-files data/menu-schedule.ts`でファイルがGit管理下にあることを確認
- [ ] メニューの変更がコミットされているか
- [ ] プッシュが完了しているか

### 5. 古いメニューファイルの削除

**重要**: 古いメニューファイルやバックアップファイルは削除すること。

- `data/menu-schedule-old.ts` のような古いファイルは存在しない
- `data/menu-schedule-backup.ts` のようなバックアップファイルも存在しない
- メニューの履歴はGit履歴で管理する

## 🔒 セキュリティ対策

### ビルド時チェックスクリプト

`scripts/check-menu-file.sh`が実装済み。このスクリプトは：

1. `data/menu-schedule.ts`が存在することを確認
2. Git管理下にあることを確認
3. チェックに失敗した場合、ビルドを中断

### プリコミットフック（推奨）

`package.json`の`precommit`スクリプトで、コミット前に自動チェックが実行されます。

## 📝 メニュー更新時の正しい手順

1. **ファイルを編集**
   ```bash
   code data/menu-schedule.ts
   ```

2. **Git管理を確認**
   ```bash
   git ls-files data/menu-schedule.ts
   # 出力があることを確認
   ```

3. **変更をステージング**
   ```bash
   git add data/menu-schedule.ts
   ```

4. **コミット**
   ```bash
   git commit -m "update: メニューを更新"
   ```

5. **プッシュ**
   ```bash
   git push origin main
   ```

6. **デプロイ**
   ```bash
   vercel --prod --yes
   ```

7. **確認**
   - デプロイ後のURLで正しいメニューが表示されることを確認

## 🚫 絶対にやってはいけないこと

1. ❌ `data/menu-schedule.ts`を`.gitignore`に追加する
2. ❌ メニューを更新した後、Gitにコミットしない
3. ❌ 古いメニューファイルを残す（`menu-schedule-old.ts`など）
4. ❌ Untrackedファイルのままデプロイする
5. ❌ ビルドエラーを無視する

## 🔍 問題が発生した場合の確認方法

### 1. Git管理の確認
```bash
git ls-files data/menu-schedule.ts
```

### 2. ファイルの存在確認
```bash
ls -la data/menu-schedule.ts
```

### 3. Gitステータスの確認
```bash
git status data/menu-schedule.ts
```

### 4. 最新のコミットを確認
```bash
git log --oneline -5 -- data/menu-schedule.ts
```

## 📞 問題発生時の対応

1. **即座にGit管理に追加**
   ```bash
   git add data/menu-schedule.ts
   git commit -m "fix: menu-schedule.tsをGit管理に追加"
   git push origin main
   ```

2. **再デプロイ**
   ```bash
   vercel --prod --yes
   ```

3. **確認**
   - デプロイ後のURLで正しいメニューが表示されることを確認

## 🎯 まとめ

- **`data/menu-schedule.ts`は必ずGit管理下に置く**
- **メニュー更新後は必ずコミット・プッシュする**
- **古いメニューファイルは削除する**
- **デプロイ前にGit管理を確認する**

この問題が再発すると、ユーザーに古いメニューが表示され、注文システム全体に影響を与えます。**最大の注意を払ってください。**

