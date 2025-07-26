#!/usr/bin/env python3

import requests
import cv2
import numpy as np
from flask import Flask, render_template_string, Response
import threading
import time
from urllib.parse import urlparse
import base64

app = Flask(__name__)

class CCTVDirectTester:
    def __init__(self):
        # ブラウザで確認済みの動作するURL
        self.working_url = "http://admin:admin@192.168.1.10/cgi-bin/guest/Video.cgi?media=MJPEG"
        self.current_frame = None
        self.is_streaming = False
        
    def test_direct_connection(self):
        """直接接続テスト"""
        print(f"🔍 直接接続テスト: {self.working_url}")
        
        try:
            # より詳細なリクエスト設定
            headers = {
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                'Accept-Language': 'ja,en-US;q=0.7,en;q=0.3',
                'Accept-Encoding': 'gzip, deflate',
                'Connection': 'keep-alive',
                'Upgrade-Insecure-Requests': '1',
            }
            
            # セッション使用でCookie管理
            session = requests.Session()
            session.headers.update(headers)
            
            # まず通常のGETリクエスト
            print("📡 GET リクエスト送信中...")
            response = session.get(self.working_url, timeout=10, stream=True)
            
            print(f"✅ ステータスコード: {response.status_code}")
            print(f"📋 Content-Type: {response.headers.get('content-type', 'N/A')}")
            print(f"📋 Content-Length: {response.headers.get('content-length', 'N/A')}")
            
            if response.status_code == 200:
                # 最初の数バイトを読んでMJPEGか確認
                chunk = response.raw.read(1024)
                print(f"🔍 最初の1024バイト: {chunk[:100]}...")
                
                if b'--' in chunk or b'JFIF' in chunk:
                    print("✅ MJPEGストリーム検出!")
                    return True, "MJPEG stream detected"
                else:
                    print("❌ MJPEG形式ではありません")
                    return False, f"Not MJPEG format: {chunk[:50]}"
            else:
                return False, f"HTTP {response.status_code}"
                
        except Exception as e:
            print(f"❌ エラー: {e}")
            return False, str(e)
    
    def start_mjpeg_stream(self):
        """MJPEGストリーム開始"""
        self.is_streaming = True
        
        def stream_worker():
            try:
                headers = {
                    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
                    'Accept': 'multipart/x-mixed-replace,*/*',
                    'Connection': 'keep-alive',
                }
                
                session = requests.Session()
                session.headers.update(headers)
                
                print("🎥 MJPEGストリーム開始...")
                response = session.get(self.working_url, timeout=30, stream=True)
                
                if response.status_code == 200:
                    print("✅ ストリーム接続成功")
                    
                    # MJPEGストリームを解析
                    buffer = b''
                    for chunk in response.iter_content(chunk_size=1024):
                        if not self.is_streaming:
                            break
                            
                        buffer += chunk
                        
                        # JPEG画像の境界を探す
                        start = buffer.find(b'\xff\xd8')  # JPEG開始
                        end = buffer.find(b'\xff\xd9')    # JPEG終了
                        
                        if start != -1 and end != -1 and end > start:
                            # JPEG画像を抽出
                            jpeg_data = buffer[start:end+2]
                            buffer = buffer[end+2:]
                            
                            # Base64エンコード
                            frame_base64 = base64.b64encode(jpeg_data).decode('utf-8')
                            self.current_frame = frame_base64
                            
                            print(f"🖼️ フレーム取得: {len(jpeg_data)} bytes")
                            time.sleep(0.1)  # 10 FPS
                            
                else:
                    print(f"❌ ストリーム接続失敗: {response.status_code}")
                    
            except Exception as e:
                print(f"❌ ストリームエラー: {e}")
            finally:
                self.is_streaming = False
        
        thread = threading.Thread(target=stream_worker)
        thread.daemon = True
        thread.start()
    
    def stop_stream(self):
        """ストリーム停止"""
        self.is_streaming = False
        self.current_frame = None

# グローバルインスタンス
tester = CCTVDirectTester()

@app.route('/')
def index():
    return render_template_string('''
    <!DOCTYPE html>
    <html>
    <head>
        <title>CCTV Direct Tester</title>
        <meta charset="UTF-8">
        <style>
            body { font-family: Arial, sans-serif; margin: 20px; background: #f0f0f0; }
            .container { max-width: 1200px; margin: 0 auto; background: white; padding: 20px; border-radius: 10px; }
            h1 { color: #333; text-align: center; }
            .btn { padding: 12px 24px; background: #007bff; color: white; border: none; border-radius: 5px; cursor: pointer; margin: 10px; font-size: 16px; }
            .btn:hover { background: #0056b3; }
            .btn.success { background: #28a745; }
            .btn.danger { background: #dc3545; }
            .video-container { text-align: center; margin: 20px 0; border: 2px solid #ddd; padding: 20px; border-radius: 10px; }
            .video-frame { max-width: 100%; height: auto; border: 1px solid #ccc; }
            .status { padding: 15px; margin: 10px 0; border-radius: 5px; font-weight: bold; }
            .status.success { background: #d4edda; color: #155724; }
            .status.error { background: #f8d7da; color: #721c24; }
            .url-info { background: #e7f3ff; padding: 15px; border-radius: 5px; margin: 20px 0; }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>🎥 CCTV Direct Connection Tester</h1>
            
            <div class="url-info">
                <h3>📋 テスト対象URL</h3>
                <p><code>http://admin:admin@192.168.1.10/cgi-bin/guest/Video.cgi?media=MJPEG</code></p>
                <p><strong>ブラウザで確認済み:</strong> ✅ 映像表示OK</p>
            </div>
            
            <div style="text-align: center;">
                <button class="btn" onclick="testConnection()">🔍 接続テスト</button>
                <button class="btn success" onclick="startStream()">▶️ ストリーム開始</button>
                <button class="btn danger" onclick="stopStream()">⏹️ ストリーム停止</button>
            </div>
            
            <div id="status" class="status">
                待機中 - 接続テストを開始してください
            </div>
            
            <div class="video-container">
                <h3>📺 ライブ映像</h3>
                <img id="videoFrame" class="video-frame" style="display: none;" alt="CCTV Stream">
                <div id="noVideo" style="color: #666;">映像はありません</div>
            </div>
        </div>
        
        <script>
            let updateInterval = null;
            
            function testConnection() {
                updateStatus('🔍 接続テスト中...', 'info');
                
                fetch('/test_connection', {method: 'POST'})
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        updateStatus('✅ 接続成功: ' + data.message, 'success');
                    } else {
                        updateStatus('❌ 接続失敗: ' + data.error, 'error');
                    }
                });
            }
            
            function startStream() {
                updateStatus('🎥 ストリーム開始中...', 'info');
                
                fetch('/start_stream', {method: 'POST'})
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        updateStatus('✅ ストリーム開始', 'success');
                        updateInterval = setInterval(updateFrame, 500);
                    } else {
                        updateStatus('❌ ストリーム開始失敗', 'error');
                    }
                });
            }
            
            function stopStream() {
                if (updateInterval) {
                    clearInterval(updateInterval);
                    updateInterval = null;
                }
                
                fetch('/stop_stream', {method: 'POST'})
                .then(response => response.json())
                .then(data => {
                    updateStatus('⏹️ ストリーム停止', 'info');
                    document.getElementById('videoFrame').style.display = 'none';
                    document.getElementById('noVideo').style.display = 'block';
                });
            }
            
            function updateFrame() {
                fetch('/get_frame')
                .then(response => response.json())
                .then(data => {
                    if (data.success && data.frame) {
                        const img = document.getElementById('videoFrame');
                        img.src = 'data:image/jpeg;base64,' + data.frame;
                        img.style.display = 'block';
                        document.getElementById('noVideo').style.display = 'none';
                        updateStatus('✅ ストリーミング中', 'success');
                    } else {
                        updateStatus('❌ フレーム取得失敗', 'error');
                    }
                });
            }
            
            function updateStatus(message, type) {
                const status = document.getElementById('status');
                status.textContent = message;
                status.className = 'status ' + type;
            }
        </script>
    </body>
    </html>
    ''')

@app.route('/test_connection', methods=['POST'])
def test_connection():
    """接続テスト"""
    success, message = tester.test_direct_connection()
    return {'success': success, 'message': message if success else '', 'error': message if not success else ''}

@app.route('/start_stream', methods=['POST'])
def start_stream():
    """ストリーム開始"""
    try:
        tester.start_mjpeg_stream()
        return {'success': True}
    except Exception as e:
        return {'success': False, 'error': str(e)}

@app.route('/stop_stream', methods=['POST'])
def stop_stream():
    """ストリーム停止"""
    tester.stop_stream()
    return {'success': True}

@app.route('/get_frame')
def get_frame():
    """フレーム取得"""
    if tester.current_frame:
        return {'success': True, 'frame': tester.current_frame}
    else:
        return {'success': False}

if __name__ == '__main__':
    print("🎥 CCTV Direct Tester 起動中...")
    print("🌐 アクセス: http://localhost:5002")
    print(f"🎯 テスト対象: {tester.working_url}")
    app.run(host='0.0.0.0', port=5002, debug=True) 