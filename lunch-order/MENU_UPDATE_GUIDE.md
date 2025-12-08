# 🍽️ 月次メニュー更新作業手順書

## ⚠️ **最重要事項 - 必ず読むこと**

**`data/menu-schedule.ts`は必ずGit管理下に置くこと。このファイルがGit管理外（Untracked）になると、Vercelデプロイ時に古いメニューが使用され、重大な問題が発生します。**

詳細は [`docs/MENU_FILE_SECURITY.md`](../docs/MENU_FILE_SECURITY.md) を参照してください。

## 📋 作業概要
毎月末に翌月のメニューを更新し、Vercelにデプロイする作業手順です。

## ⏰ 作業タイミング
- **作業日**: 毎月末（例：8月25日）
- **更新対象**: 翌月のメニュー（例：9月メニュー）
- **切り替え日時**: 翌月1日 00:00 から

## 🔧 作業手順

### 1. メニューデータファイルの更新

#### 1-1. ファイルを開く
```bash
# プロジェクトディレクトリに移動
cd /Users/sakonhiroki/lunch-order

# ⚠️ 重要: Git管理下にあることを確認
git ls-files data/menu-schedule.ts
# 出力があることを確認（何も表示されない場合は問題あり）

# メニューデータファイルを開く
code data/menu-schedule.ts
```

#### 1-2. 現在のメニュー期間を更新
```typescript
// 現在のメニュー期間を翌月末まで延長
export const CURRENT_MENU: MenuSchedule = {
  startDate: "2024-07-25T00:00:00",
  endDate: "2024-09-30T23:59:59", // ← この行を翌月末に変更
  menus: {
    // メニュー内容は変更なし
  }
};
```

#### 1-3. 次のメニュー期間を更新
```typescript
// 次のメニュー期間を翌々月末まで設定
export const NEXT_MENU: MenuSchedule = {
  startDate: "2024-10-01T00:00:00", // ← この行を翌月1日00:00に変更
  endDate: "2024-10-31T23:59:59",   // ← この行を翌月末23:59に変更
  menus: {
    // 新しいメニュー内容を設定
    星期一: ["新しい料理1", "新しい料理2", ...],
    星期二: ["新しい料理1", "新しい料理2", ...],
    // ... 他の曜日も同様
  }
};
```

### 2. メニュー内容の確認

#### 2-1. 各曜日のメニュー数確認
- 月曜日〜金曜日: 7品目
- 土曜日・日曜日: 6品目
- 豆腐粟米飯、什菇時菜飯は毎日固定

#### 2-2. フォーマット確認
```typescript
// ✅ 正しいフォーマット（1行にまとめる）
星期一: ["料理1", "料理2", "料理3", "料理4", "料理5", "豆腐粟米飯", "什菇時菜飯"],

// ❌ 間違ったフォーマット（改行しない）
星期一: [
  "料理1",
  "料理2",
  // ...
],
```

### 3. ローカルでの動作確認

#### 3-1. 開発サーバー起動
```bash
npm run dev
```

#### 3-2. API動作確認
```bash
# 今日のメニュー取得
curl http://localhost:3000/api/menu

# 特定曜日のメニュー取得
curl http://localhost:3000/api/menu/星期一

# 全メニュー取得
curl http://localhost:3000/api/menu/all
```

#### 3-3. 日付切り替えの確認
```typescript
// テスト用に日付を一時的に変更して確認
// 例：9月30日23:59 → 10月1日00:00 の切り替え
```

### 4. Git管理の確認（⚠️ 必須）

#### 4-1. Git管理下にあることを確認
```bash
# ⚠️ 最重要: メニューファイルがGit管理下にあることを確認
git ls-files data/menu-schedule.ts
# 出力があることを確認（何も表示されない場合は問題あり）

# Gitステータスの確認
git status data/menu-schedule.ts
# "Untracked files"に表示されていないことを確認
```

#### 4-2. 変更をコミット・プッシュ
```bash
# 変更をステージング
git add data/menu-schedule.ts

# コミット
git commit -m "update: メニューを更新"

# プッシュ
git push origin main

# ⚠️ 重要: プッシュ後に再度確認
git ls-files data/menu-schedule.ts
```

### 5. Vercelへのデプロイ

#### 5-1. デプロイ前の確認チェックリスト
```bash
# ✅ チェック1: プロジェクトIDの確認
cat .vercel/project.json
# 正しいプロジェクトID: prj_seXpPQd8AWY5dVMwYq8UySWoYnqQ
# 正しいチームID: team_hfdVMgcn7GojZhG8Cz5Pb3iA

# ✅ チェック2: メニューファイルがGit管理下にあることを確認
git ls-files data/menu-schedule.ts
# 出力があることを確認

# ✅ チェック3: .gitignoreにmenu-schedule.tsが含まれていないことを確認
grep -i "menu-schedule" .gitignore
# 何も表示されないことを確認

# ✅ チェック4: ビルド前チェックスクリプトの実行
npm run check-menu
# "✅ data/menu-schedule.ts is properly tracked by Git" と表示されることを確認
```

#### 5-2. 本番デプロイ実行
```bash
# ⚠️ 重要: 上記のチェックリストをすべて確認してから実行
vercel --prod --yes
```

#### 5-3. デプロイ成功確認
```bash
# デプロイURLの確認
# 例: https://v0-random-ui-example-xxxxx.vercel.app

# 本番環境でのAPI動作確認
curl https://v0-random-ui-example.vercel.app/api/menu
```

### 6. 動作確認とトラブルシューティング

#### 6-1. よくあるエラーと対処法

**エラー1: ビルドエラー**
```bash
# インポートパスの確認
# app/api/menu/route.ts → ../../../data/menu-schedule
# app/api/menu/[weekday]/route.ts → ../../../data/menu-schedule
# app/api/menu/all/route.ts → ../../../data/menu-schedule
```

**エラー2: メニューが表示されない**
- 日付フォーマットの確認（YYYY-MM-DDTHH:mm:ss）
- タイムゾーンの確認（日本時間）

**エラー3: デプロイが失敗する**
- プロジェクトIDの確認
- 正しいディレクトリでの実行確認

**エラー4: 古いメニューが表示される（⚠️ 重大）**
```bash
# 1. メニューファイルがGit管理下にあることを確認
git ls-files data/menu-schedule.ts

# 2. もしUntrackedの場合、即座に追加
git add data/menu-schedule.ts
git commit -m "fix: menu-schedule.tsをGit管理に追加"
git push origin main

# 3. 再デプロイ
vercel --prod --yes
```

#### 6-2. ログ確認方法
```bash
# Vercelのログ確認
vercel inspect [deployment-url] --logs

# ローカルでのビルド確認
npm run build
```

## 📅 月次更新スケジュール例

### 8月更新作業（7月25日実施）
- **現在メニュー**: 7月25日〜8月31日
- **次のメニュー**: 9月1日〜9月30日

### 9月更新作業（8月31日実施）
- **現在メニュー**: 8月1日〜9月30日
- **次のメニュー**: 10月1日〜10月31日

### 10月更新作業（9月30日実施）
- **現在メニュー**: 9月1日〜10月31日
- **次のメニュー**: 11月1日〜11月30日

## 🔍 更新後の確認項目

### ✅ 必須確認項目
1. **メニュー期間**: 開始日・終了日が正しい
2. **メニュー内容**: 各曜日の料理が正しく設定されている
3. **フォーマット**: 改行なしの1行形式
4. **API動作**: ローカル・本番環境で正常動作
5. **デプロイ成功**: Vercelで正常にデプロイ完了

### 📝 更新履歴の記録
```markdown
## 更新履歴
- 2024年8月22日: 9月メニュー更新（7月25日〜9月30日）
- 2024年9月30日: 10月メニュー更新（9月1日〜10月31日）
- 2024年10月31日: 11月メニュー更新（10月1日〜11月30日）
```

## 🚨 緊急時の対応

### メニュー切り替えが動作しない場合
1. 日付フォーマットの確認
2. タイムゾーンの確認
3. ローカルでの動作確認
4. 必要に応じて手動でメニューを切り替え

### デプロイが失敗する場合
1. プロジェクトIDの確認
2. インポートパスの確認
3. ビルドエラーの詳細確認
4. 必要に応じてローカルでビルドテスト

---

## 💡 便利なコマンド集

```bash
# プロジェクトディレクトリ移動
cd /Users/sakonhiroki/lunch-order

# 開発サーバー起動
npm run dev

# ビルドテスト
npm run build

# Vercelデプロイ
vercel --prod --yes

# プロジェクト情報確認
cat .vercel/project.json

# API動作確認
curl http://localhost:3000/api/menu
curl https://v0-random-ui-example.vercel.app/api/menu
```

この手順書を参考に、毎月のメニュー更新作業を実施してください！


