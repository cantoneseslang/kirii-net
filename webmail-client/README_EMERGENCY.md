# 🆘 緊急事態対応マニュアル

## 🚨 アプリが壊れた！記憶喪失！どうする？

### ⚡ 一撃解決コマンド
```bash
bash emergency_reset.sh
```

**これだけで全て解決します。**

## 📚 詳細マニュアル

- **完全復旧手順**: `EMERGENCY_RESET.md`
- **個別コマンド集**: `RECOVERY_COMMANDS.md`  
- **現在の正常状態**: `SYSTEM_STATUS.md`

## 🎯 現在の正常動作確認

```bash
# この3つのコマンドで状態確認
curl -I http://localhost:3000        # → HTTP 200 OK
wc -l email-app.tsx                  # → 1617行
grep "Kmail" email-app.tsx           # → 見つかる
```

## 🚫 絶対にやってはいけないこと

1. `email-app.tsx` の変更
2. `electron/` フォルダの変更
3. UIの無断変更
4. ブランディング（Kmail）の変更

---

**迷ったら**: `bash emergency_reset.sh` を実行してください。