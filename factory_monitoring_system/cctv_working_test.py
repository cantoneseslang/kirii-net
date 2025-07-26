#!/usr/bin/env python3

import requests
import cv2
import numpy as np
from flask import Flask, render_template_string, Response
import threading
import time
import base64
from requests.auth import HTTPBasicAuth
import urllib3

# SSL警告を無効化
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

app = Flask(__name__)

class CCTVWorkingTester:
    def __init__(self):
        self.working_url = "http://admin:admin@192.168.1.10/cgi-bin/guest/Video.cgi?media=MJPEG"
        self.current_frame = None
        self.is_streaming = False
        
    def test_simple_connection(self):
        """シンプル接続テスト"""
        print(f"🔍 シンプル接続テスト: {self.working_url}")
        
        try:
            # 最もシンプルなリクエスト
            response = requests.get(
                "http://192.168.1.10/cgi-bin/guest/Video.cgi?media=MJPEG",
                auth=HTTPBasicAuth('admin', 'admin'),
                timeout=5,
                stream=False
            )
            
            print(f"✅ ステータスコード: {response.status_code}")
            print(f"📋 Content-Type: {response.headers.get('content-type', 'N/A')}")
            print(f"📋 Content-Length: {response.headers.get('content-length', 'N/A')}")
            print(f"📋 Server: {response.headers.get('server', 'N/A')}")
            
            if response.status_code == 200:
                content = response.content[:200]
                print(f"📋 最初の200バイト: {content}")
                return True, f"HTTP {response.status_code} - Content: {len(response.content)} bytes"
            else:
                return False, f"HTTP {response.status_code}"
                
        except Exception as e:
            print(f"❌ エラー: {e}")
            return False, str(e)
    
    def test_curl_equivalent(self):
        """curl相当のテスト"""
        print("🔍 curl相当テスト")
        
        try:
            # curlコマンド相当
            headers = {
                'User-Agent': 'curl/7.68.0',
                'Accept': '*/*',
            }
            
            response = requests.get(
                "http://192.168.1.10/cgi-bin/guest/Video.cgi?media=MJPEG",
                auth=HTTPBasicAuth('admin', 'admin'),
                headers=headers,
                timeout=10,
                stream=True
            )
            
            print(f"✅ curl テスト - ステータス: {response.status_code}")
            
            if response.status_code == 200:
                # 最初のチャンクを読む
                chunk = next(response.iter_content(chunk_size=1024))
                print(f"📋 最初のチャンク: {len(chunk)} bytes")
                print(f"📋 内容: {chunk[:100]}...")
                return True, f"curl成功 - {len(chunk)} bytes received"
            else:
                return False, f"curl失敗 - HTTP {response.status_code}"
                
        except Exception as e:
            print(f"❌ curl エラー: {e}")
            return False, str(e)
    
    def start_simple_stream(self):
        """シンプルストリーム"""
        self.is_streaming = True
        
        def stream_worker():
            try:
                print("🎥 シンプルストリーム開始...")
                
                # 最もシンプルな設定
                response = requests.get(
                    "http://192.168.1.10/cgi-bin/guest/Video.cgi?media=MJPEG",
                    auth=HTTPBasicAuth('admin', 'admin'),
                    stream=True,
                    timeout=30
                )
                
                if response.status_code == 200:
                    print("✅ ストリーム開始成功")
                    
                    buffer = b''
                    frame_count = 0
                    
                    for chunk in response.iter_content(chunk_size=1024):
                        if not self.is_streaming:
                            break
                            
                        buffer += chunk
                        
                        # JPEG境界を探す
                        while True:
                            start = buffer.find(b'\xff\xd8')
                            end = buffer.find(b'\xff\xd9')
                            
                            if start != -1 and end != -1 and end > start:
                                # JPEG画像を抽出
                                jpeg_data = buffer[start:end+2]
                                buffer = buffer[end+2:]
                                
                                # Base64エンコード
                                frame_base64 = base64.b64encode(jpeg_data).decode('utf-8')
                                self.current_frame = frame_base64
                                
                                frame_count += 1
                                print(f"🖼️ フレーム {frame_count}: {len(jpeg_data)} bytes")
                                
                                time.sleep(0.1)
                            else:
                                break
                else:
                    print(f"❌ ストリーム失敗: {response.status_code}")
                    
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
tester = CCTVWorkingTester()

@app.route('/')
def index():
    return render_template_string('''
    <!DOCTYPE html>
    <html>
    <head>
        <title>CCTV Working Tester</title>
        <meta charset="UTF-8">
        <style>
            body { font-family: Arial, sans-serif; margin: 20px; background: #f0f0f0; }
            .container { max-width: 1200px; margin: 0 auto; background: white; padding: 20px; border-radius: 10px; }
            h1 { color: #333; text-align: center; }
            .btn { padding: 12px 24px; background: #007bff; color: white; border: none; border-radius: 5px; cursor: pointer; margin: 10px; font-size: 16px; }
            .btn:hover { background: #0056b3; }
            .btn.success { background: #28a745; }
            .btn.danger { background: #dc3545; }
            .btn.warning { background: #ffc107; color: #212529; }
            .video-container { text-align: center; margin: 20px 0; border: 2px solid #ddd; padding: 20px; border-radius: 10px; }
            .video-frame { max-width: 100%; height: auto; border: 1px solid #ccc; }
            .status { padding: 15px; margin: 10px 0; border-radius: 5px; font-weight: bold; }
            .status.success { background: #d4edda; color: #155724; }
            .status.error { background: #f8d7da; color: #721c24; }
            .status.info { background: #d1ecf1; color: #0c5460; }
            .test-results { background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0; }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>🔧 CCTV Working Tester</h1>
            
            <div style="text-align: center;">
                <button class="btn warning" onclick="testSimple()">🔍 シンプルテスト</button>
                <button class="btn warning" onclick="testCurl()">🔧 curlテスト</button>
                <button class="btn success" onclick="startStream()">▶️ ストリーム開始</button>
                <button class="btn danger" onclick="stopStream()">⏹️ ストリーム停止</button>
            </div>
            
            <div id="status" class="status info">
                待機中 - テストを開始してください
            </div>
            
            <div class="test-results">
                <h3>📊 テスト結果</h3>
                <div id="testResults">結果はありません</div>
            </div>
            
            <div class="video-container">
                <h3>📺 ライブ映像</h3>
                <img id="videoFrame" class="video-frame" style="display: none;" alt="CCTV Stream">
                <div id="noVideo" style="color: #666;">映像はありません</div>
            </div>
        </div>
        
        <script>
            let updateInterval = null;
            
            function testSimple() {
                updateStatus('🔍 シンプルテスト実行中...', 'info');
                
                fetch('/test_simple', {method: 'POST'})
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        updateStatus('✅ シンプルテスト成功: ' + data.message, 'success');
                        updateResults('シンプルテスト: ✅ 成功 - ' + data.message);
                    } else {
                        updateStatus('❌ シンプルテスト失敗: ' + data.error, 'error');
                        updateResults('シンプルテスト: ❌ 失敗 - ' + data.error);
                    }
                });
            }
            
            function testCurl() {
                updateStatus('🔧 curlテスト実行中...', 'info');
                
                fetch('/test_curl', {method: 'POST'})
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        updateStatus('✅ curlテスト成功: ' + data.message, 'success');
                        updateResults('curlテスト: ✅ 成功 - ' + data.message);
                    } else {
                        updateStatus('❌ curlテスト失敗: ' + data.error, 'error');
                        updateResults('curlテスト: ❌ 失敗 - ' + data.error);
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
            
            function updateResults(result) {
                const results = document.getElementById('testResults');
                const currentTime = new Date().toLocaleTimeString();
                results.innerHTML += '<div>[' + currentTime + '] ' + result + '</div>';
            }
        </script>
    </body>
    </html>
    ''')

@app.route('/test_simple', methods=['POST'])
def test_simple():
    """シンプルテスト"""
    success, message = tester.test_simple_connection()
    return {'success': success, 'message': message if success else '', 'error': message if not success else ''}

@app.route('/test_curl', methods=['POST'])
def test_curl():
    """curlテスト"""
    success, message = tester.test_curl_equivalent()
    return {'success': success, 'message': message if success else '', 'error': message if not success else ''}

@app.route('/start_stream', methods=['POST'])
def start_stream():
    """ストリーム開始"""
    try:
        tester.start_simple_stream()
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
    print("🔧 CCTV Working Tester 起動中...")
    print("🌐 アクセス: http://localhost:5003")
    print("🎯 目標: ブラウザと同じ方法でCCTV接続")
    app.run(host='0.0.0.0', port=5003, debug=True) 