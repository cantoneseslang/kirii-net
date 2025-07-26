#!/usr/bin/env python3
"""
基本的な映像表示テスト
YouTubeストリーム → OpenCV表示
"""

import cv2
import yt_dlp
import sys
import time

def test_youtube_stream():
    print("🎬 YouTubeストリーム基本テスト開始")
    
    youtube_url = "https://www.youtube.com/live/_Upz1dlQgpg?si=vPvgjPtX32p6zXo2"
    print(f"📺 YouTube URL: {youtube_url}")
    
    try:
        # 1. YouTubeストリームURL取得
        print("1️⃣ ストリームURL取得中...")
        ydl_opts = {
            'format': 'best[ext=mp4]',
            'quiet': True,
            'no_warnings': True
        }
        
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(youtube_url, download=False)
            stream_url = info.get('url')
            title = info.get('title', '不明')
        
        print(f"✅ ストリームURL取得成功")
        print(f"📝 タイトル: {title}")
        print(f"🔗 ストリームURL: {stream_url[:100]}...")
        
        # 2. OpenCVで接続
        print("2️⃣ OpenCV接続中...")
        cap = cv2.VideoCapture(stream_url)
        
        if not cap.isOpened():
            print("❌ OpenCV接続失敗")
            return False
        
        print("✅ OpenCV接続成功")
        
        # 3. フレーム読み込みテスト
        print("3️⃣ フレーム読み込みテスト...")
        ret, frame = cap.read()
        
        if not ret or frame is None:
            print("❌ フレーム読み込み失敗")
            cap.release()
            return False
        
        print(f"✅ フレーム読み込み成功: {frame.shape}")
        
        # 4. 映像表示（10秒間）
        print("4️⃣ 映像表示開始（10秒間）")
        print("📺 OpenCVウィンドウが開きます...")
        print("⏹️ 'q'キーまたはウィンドウを閉じて終了")
        
        frame_count = 0
        start_time = time.time()
        
        while True:
            ret, frame = cap.read()
            
            if not ret or frame is None:
                print("⚠️ フレーム読み込み失敗")
                break
            
            frame_count += 1
            
            # フレームサイズ調整（表示用）
            height, width = frame.shape[:2]
            if width > 800:
                scale = 800 / width
                new_width = int(width * scale)
                new_height = int(height * scale)
                frame = cv2.resize(frame, (new_width, new_height))
            
            # フレーム情報表示
            cv2.putText(frame, f"Frame: {frame_count}", (10, 30), 
                       cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2)
            cv2.putText(frame, f"Time: {int(time.time() - start_time)}s", (10, 70), 
                       cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2)
            
            # 映像表示
            cv2.imshow('YouTube Live Stream Test', frame)
            
            # キー入力チェック
            key = cv2.waitKey(1) & 0xFF
            if key == ord('q'):
                print("🛑 ユーザーによる終了")
                break
            
            # 10秒経過で自動終了
            if time.time() - start_time > 10:
                print("⏰ 10秒経過、自動終了")
                break
            
            # 進捗表示
            if frame_count % 30 == 0:
                print(f"📊 フレーム処理中: {frame_count} ({int(time.time() - start_time)}秒)")
        
        # 5. 終了処理
        print("5️⃣ 終了処理...")
        cap.release()
        cv2.destroyAllWindows()
        
        print(f"✅ テスト完了: {frame_count}フレーム処理")
        return True
        
    except Exception as e:
        print(f"❌ エラー発生: {e}")
        return False

if __name__ == "__main__":
    print("=" * 50)
    print("🧪 YouTube Live Stream 基本テスト")
    print("=" * 50)
    
    success = test_youtube_stream()
    
    print("=" * 50)
    if success:
        print("🎉 テスト成功！YouTubeストリーム表示OK")
    else:
        print("💥 テスト失敗！問題があります")
    print("=" * 50) 