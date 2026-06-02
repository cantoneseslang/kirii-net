# ランチ注文システム API 使用例

AIチャットボットが今日のメニューを取得するためのAPIエンドポイントです。

## 🌐 デプロイ済みURL

Vercelにデプロイ済みのAPIエンドポイント：
- **本番環境**: `https://v0-random-ui-example.vercel.app/api/menu`
- **開発環境**: `http://localhost:3000/api/menu`

## 利用可能なエンドポイント

### 1. 今日のメニューを取得
```
GET /api/menu
```

**レスポンス例:**
```json
{
  "success": true,
  "data": {
    "date": "2024-01-15",
    "weekday": "星期一",
    "dishes": [
      "梅菜蒸肉餅飯",
      "豆腐火腩飯", 
      "叉燒炒蛋飯",
      "四川雞球飯",
      "星洲炒米",
      "豆腐栗米飯",
      "什菇時菜飯"
    ],
    "drinks": [
      {"name": "熱奶茶", "price": 16},
      {"name": "凍奶茶", "price": 18},
      // ... その他の飲み物
    ],
    "drinksByCategory": {
      "hot": [...],
      "cold": [...],
      "other": [...]
    }
  }
}
```

### 2. 特定の曜日のメニューを取得
```
GET /api/menu/[weekday]
```

**例:**
```
GET /api/menu/星期二
```

**有効な曜日:**
- 星期一 (月曜日)
- 星期二 (火曜日)
- 星期三 (水曜日)
- 星期四 (木曜日)
- 星期五 (金曜日)
- 星期六 (土曜日)
- 星期日 (日曜日)

### 3. 全てのメニューを取得
```
GET /api/menu/all
```

**レスポンス例:**
```json
{
  "success": true,
  "data": {
    "allMenus": {
      "星期一": [...],
      "星期二": [...],
      // ... 全ての曜日
    },
    "drinks": {
      "hot": [...],
      "cold": [...],
      "other": [...]
    },
    "allDrinks": [...]
  }
}
```

## AIチャットボットでの使用例

### JavaScript/TypeScript
```javascript
// 今日のメニューを取得
const response = await fetch('https://v0-random-ui-example.vercel.app/api/menu');
const data = await response.json();

if (data.success) {
  const { dishes, drinks } = data.data;
  console.log(`今日のメニュー: ${dishes.join(', ')}`);
  console.log(`利用可能な飲み物: ${drinks.map(d => d.name).join(', ')}`);
}
```

### Python
```python
import requests

# 今日のメニューを取得
response = requests.get('https://v0-random-ui-example.vercel.app/api/menu')
data = response.json()

if data['success']:
    dishes = data['data']['dishes']
    drinks = data['data']['drinks']
    print(f"今日のメニュー: {', '.join(dishes)}")
    print(f"利用可能な飲み物: {', '.join([d['name'] for d in drinks])}")
```

## エラーハンドリング

APIは以下のエラーレスポンスを返す可能性があります：

```json
{
  "success": false,
  "error": "エラーメッセージ"
}
```

**ステータスコード:**
- 200: 成功
- 400: 無効なリクエスト（例：無効な曜日）
- 500: サーバーエラー

## 注意事項

- メニューは香港時間（zh-HK）に基づいて今日の曜日が決定されます
- 飲み物の価格は香港ドル（HKD）で表示されています
- APIはCORSをサポートしているため、外部のAIチャットボットからもアクセス可能です
- **メニューは月極で自動切り替え**: 現在のメニューと次のメニューが設定されており、指定した日付で自動的に切り替わります
- **現在のメニュー**: 2024年8月〜2024年12月
- **次のメニュー**: 2025年1月〜2025年12月（2025年1月1日から自動切り替え） 