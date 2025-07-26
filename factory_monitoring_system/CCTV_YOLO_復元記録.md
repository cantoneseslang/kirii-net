# 🏭 KIRII CCTV-YOLO監視システム 復元記録

## 📅 作成日時
2025年7月26日 17:56

## 🚨 問題発生の経緯

### なぜシステムが動かなくなったのか

1. **コード削除事故**
   - 以前動作していた正しいCCTV接続コードが誤って削除された
   - 複数のテストファイルが作成される過程で、動作確認済みのコードが上書きされた
   - 特に `fixed_remote_access.py` に含まれていた正しいURL情報が見落とされていた

2. **ネットワーク設定の混乱**
   - CCTV本体のIP: `192.168.1.10` (dlink-791Eネットワーク)
   - 開発PC: `192.168.0.x` (kirii-wifiネットワーク) 
   - 異なるネットワークセグメント間の接続問題

3. **間違ったURL試行**
   - `192.168.0.115` (中間ルーター) 経由での複数URL試行
   - セッション管理やプロキシ設定の複雑化
   - 全て失敗に終わった

## ✅ 解決方法と正しいルート

### 🎯 最終的に動作したURL
```
http://192.168.0.98:18080/cgi-bin/guest/Video.cgi?media=MJPEG
```

### 🔑 認証情報
```
Username: admin
Password: admin
```

### 🛣️ ネットワークルート
```
開発PC (192.168.0.149) 
    ↓
kirii-wifi (192.168.0.x)
    ↓  
中間ルーター (192.168.0.98:18080) ← 【重要】正しいルーター
    ↓
CCTV (192.168.1.10)
```

## 🔧 復元手順 (緊急時対応マニュアル)

### Step 1: 正しいファイルの確認
```bash
# 動作確認済みファイルを確認
ls -la fixed_remote_access.py
grep -n "192.168.0.98" fixed_remote_access.py
```

### Step 2: 復元システムの作成
```bash
# 復元版システムファイル作成
cp cctv_working_restored.py cctv_working_restored_backup.py
```

### Step 3: システム起動
```bash
cd /Users/sakonhiroki/factory_monitoring_system
python cctv_working_restored.py
```

### Step 4: 動作確認
- ブラウザで `http://localhost:5009` にアクセス
- 「▶️ 監視開始」ボタンをクリック
- CCTV映像とYOLO検出が正常動作することを確認

## 📋 システム仕様

### 🖥️ 動作環境
- **ファイル名**: `cctv_working_restored.py`
- **ポート**: `5009`
- **アクセスURL**: `http://localhost:5009`

### 🎥 CCTV設定
- **CCTV URL**: `http://192.168.0.98:18080/cgi-bin/guest/Video.cgi?media=MJPEG`
- **認証**: Basic認証 (admin:admin)
- **ストリーム形式**: MJPEG
- **接続タイムアウト**: 10秒

### 🤖 YOLO設定
- **モデル**: YOLO11n (`yolo11n.pt`)
- **検出閾値**: 0.5
- **検出対象**: 80種類のオブジェクト
- **フレーム処理**: リアルタイム

## 🚫 失敗したアプローチ (今後避けるべき)

### ❌ 間違ったURL群
```bash
# これらは全て失敗
http://192.168.0.115/192.168.1.10/cgi-bin/guest/Video.cgi?media=MJPEG
http://192.168.0.115:8080/cgi-bin/guest/Video.cgi?media=MJPEG
http://192.168.0.115:8081/cgi-bin/guest/Video.cgi?media=MJPEG
http://192.168.0.115:10000/cgi-bin/guest/Video.cgi?media=MJPEG
```

### ❌ 複雑化したアプローチ
- セッションID抽出
- HTMLパース処理
- 複数ポート試行
- プロキシ設定

## 🔍 トラブルシューティング

### 問題: 「0 objects detected」が続く場合
```python
# 検出閾値を下げる
results = self.model(frame, conf=0.3)  # 0.5 → 0.3に変更
```

### 問題: CCTV接続エラーの場合
```bash
# URL接続テスト
curl -u admin:admin "http://192.168.0.98:18080/cgi-bin/guest/Video.cgi?media=MJPEG" --max-time 10
```

### 問題: ネットワーク接続確認
```bash
# ping テスト
ping 192.168.0.98
ping 192.168.1.10

# ルート確認
netstat -rn
```

## 📁 重要ファイル一覧

### 🟢 動作確認済み (保護必須)
- `cctv_working_restored.py` - **メインシステム (ポート5009)**
- `fixed_remote_access.py` - **正しいURL情報源**

### 🟡 参考ファイル
- `cctv_yolo_system.py` - dlink-791E直接接続版
- `cctv_kirii_wifi_system.py` - 初期テスト版
- `cctv_proxy_working_system.py` - プロキシテスト版
- `cctv_session_system.py` - セッション管理版

### 🔴 削除対象 (混乱を避けるため)
- `cctv_working_test.py`
- `cctv_router_test.py` 
- `cctv_proxy_system.py`

## 🎯 成功の要因

1. **正しいURL発見**: `192.168.0.98:18080` が鍵だった
2. **シンプルな実装**: 複雑な処理を排除
3. **過去ファイルの活用**: `fixed_remote_access.py` から情報抽出
4. **段階的テスト**: curl → Python実装の順序

## 📞 緊急時の対応手順

### 🚨 システムが動かない場合
1. このファイルを開く
2. 「復元手順」に従って実行
3. `cctv_working_restored.py` を起動
4. `http://localhost:5009` で動作確認

### 🔄 完全復旧手順
```bash
# 1. バックアップから復元
cp cctv_working_restored_backup.py cctv_working_restored.py

# 2. システム起動
python cctv_working_restored.py

# 3. 動作確認
curl http://localhost:5009
```

## 📝 学んだ教訓

1. **動作確認済みコードは絶対に保護する**
2. **ネットワーク設定は詳細に記録する**
3. **シンプルな解決策を優先する**
4. **過去の作業ファイルを安易に削除しない**
5. **段階的なテストアプローチが重要**

---
**⚠️ 重要**: この記録を削除せず、今後のトラブル時に必ず参照すること 