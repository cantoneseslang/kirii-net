#!/usr/bin/env python3

import requests
import cv2
import numpy as np
from flask import Flask, render_template_string
import threading
import time
import base64
from requests.auth import HTTPBasicAuth
from ultralytics import YOLO
import os
import re

app = Flask(__name__)

class CCTVSessionSystem:
    def __init__(self):
        # 中間ルーター経由でのCCTVアクセス設定
        self.router_ip = "192.168.0.115"
        self.cctv_ip = "192.168.1.10"
        self.username = "admin"
        self.password = "admin"
        
        # セッション管理
        self.session = requests.Session()
        self.session.auth = HTTPBasicAuth(self.username, self.password)
        self.session_id = None
        self.working_url = None
        
        # YOLO設定
        self.model = None
        self.load_yolo_model()
        
        # ストリーム設定
        self.current_frame = None
        self.is_streaming = False
        self.detection_results = []
        self.connection_status = "未接続"
        self.debug_info = []
        
    def load_yolo_model(self):
        """YOLOモデル読み込み"""
        try:
            model_path = 'yolo11n.pt'
            if os.path.exists(model_path):
                self.model = YOLO(model_path)
                print("✅ YOLO11モデル読み込み成功")
            else:
                print("❌ YOLOモデルファイルが見つかりません")
        except Exception as e:
            print(f"❌ YOLOモデル読み込みエラー: {e}")
    
    def establish_cctv_session(self):
        """CCTVセッション確立"""
        print("🔐 CCTVセッション確立開始...")
        self.debug_info = []
        
        try:
            # 1. CCTV管理画面にアクセスしてセッションIDを取得
            print(f"📡 CCTV管理画面アクセス: http://{self.router_ip}/{self.cctv_ip}/")
            
            response = self.session.get(
                f"http://{self.router_ip}/{self.cctv_ip}/",
                timeout=10,
                allow_redirects=True
            )
            
            if response.status_code == 200:
                print("✅ CCTV管理画面アクセス成功")
                self.debug_info.append("✅ CCTV管理画面: アクセス成功")
                
                # セッションIDを抽出
                session_patterns = [
                    r'cs[a-f0-9]{8,}',  # cs + 16進数文字列
                    r'/([a-f0-9]{8,})/',  # パス内の16進数文字列
                    r'sessionid=([a-f0-9]+)',  # sessionidパラメータ
                ]
                
                found_sessions = []
                for pattern in session_patterns:
                    matches = re.findall(pattern, response.text, re.IGNORECASE)
                    found_sessions.extend(matches)
                
                # URLからもセッションIDを抽出
                if response.url != response.request.url:
                    print(f"🔄 リダイレクト先: {response.url}")
                    self.debug_info.append(f"🔄 リダイレクト先: {response.url}")
                    
                    url_session = re.search(r'/([a-f0-9]{8,})/', response.url)
                    if url_session:
                        found_sessions.append(url_session.group(1))
                
                if found_sessions:
                    self.session_id = found_sessions[0]
                    print(f"✅ セッションID取得: {self.session_id}")
                    self.debug_info.append(f"✅ セッションID: {self.session_id}")
                    return True
                else:
                    print("⚠️ セッションIDが見つかりません")
                    self.debug_info.append("⚠️ セッションIDが見つかりません")
                    # セッションIDなしでも試行
                    return True
                    
            else:
                print(f"❌ CCTV管理画面アクセス失敗: {response.status_code}")
                self.debug_info.append(f"❌ CCTV管理画面: HTTP {response.status_code}")
                return False
                
        except Exception as e:
            print(f"❌ CCTVセッション確立エラー: {e}")
            self.debug_info.append(f"❌ セッション確立エラー: {str(e)[:50]}")
            return False
    
    def test_video_urls_with_session(self):
        """セッション付き映像URL群をテスト"""
        print("🎥 セッション付き映像URL群テスト開始...")
        
        # セッションIDありのURL構造
        if self.session_id:
            session_urls = [
                f"http://{self.router_ip}/{self.session_id}/{self.cctv_ip}:80/cgi-bin/guest/Video.cgi?media=MJPEG",
                f"http://{self.router_ip}/{self.session_id}/cgi-bin/guest/Video.cgi?media=MJPEG",
                f"http://{self.router_ip}/{self.session_id}/192.168.1.10/cgi-bin/guest/Video.cgi?media=MJPEG",
            ]
        else:
            session_urls = []
        
        # 基本URL構造
        basic_urls = [
            f"http://{self.router_ip}/{self.cctv_ip}:80/cgi-bin/guest/Video.cgi?media=MJPEG",
            f"http://{self.router_ip}/{self.cctv_ip}/cgi-bin/guest/Video.cgi?media=MJPEG",
            f"http://{self.router_ip}/cgi-bin/guest/Video.cgi?media=MJPEG&target={self.cctv_ip}",
        ]
        
        test_urls = session_urls + basic_urls
        
        for i, url in enumerate(test_urls, 1):
            print(f"📡 テスト {i}: {url}")
            
            try:
                headers = {
                    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
                    'Accept': 'multipart/x-mixed-replace,*/*',
                    'Connection': 'keep-alive'
                }
                
                # まずHEADリクエストで確認
                response = self.session.head(
                    url,
                    headers=headers,
                    timeout=8,
                    allow_redirects=True
                )
                
                print(f"📊 HTTP Status: {response.status_code}")
                content_type = response.headers.get('content-type', 'Unknown')
                print(f"📊 Content-Type: {content_type}")
                
                if response.status_code == 200:
                    if 'multipart' in content_type.lower() or 'image' in content_type.lower():
                        print(f"✅ 映像ストリーム発見: {url}")
                        self.working_url = url
                        self.connection_status = f"映像ストリーム発見 (方法{i})"
                        self.debug_info.append(f"✅ 成功URL: {url}")
                        self.debug_info.append(f"✅ Content-Type: {content_type}")
                        return True
                    else:
                        # GETリクエストで実際のデータを少し取得して確認
                        try:
                            get_response = self.session.get(
                                url,
                                headers=headers,
                                timeout=5,
                                stream=True
                            )
                            
                            # 最初の2048バイトを取得（より多くのデータを確認）
                            chunk = b''
                            for data in get_response.iter_content(chunk_size=1024):
                                chunk += data
                                if len(chunk) >= 2048:
                                    break
                            get_response.close()
                            
                            # JPEG画像の開始バイトまたはMJPEG境界をチェック
                            if (chunk.startswith(b'\xff\xd8') or 
                                b'--boundary' in chunk or 
                                b'Content-Type: image/jpeg' in chunk):
                                print(f"✅ MJPEG画像データ検出: {url}")
                                self.working_url = url
                                self.connection_status = f"MJPEG検出 (方法{i})"
                                self.debug_info.append(f"✅ MJPEG URL: {url}")
                                return True
                            else:
                                print(f"⚠️ 画像データではない: {url}")
                                self.debug_info.append(f"⚠️ URL{i}: 画像データではない")
                                # デバッグ用：最初の100バイトを表示
                                print(f"🔍 データサンプル: {chunk[:100]}")
                                
                        except Exception as e:
                            print(f"⚠️ データ取得エラー: {str(e)[:50]}")
                            self.debug_info.append(f"⚠️ URL{i}: データ取得エラー")
                            
                elif response.status_code == 401:
                    print(f"🔐 認証エラー: {url}")
                    self.debug_info.append(f"🔐 URL{i}: 認証エラー")
                else:
                    print(f"❌ HTTP {response.status_code}: {url}")
                    self.debug_info.append(f"❌ URL{i}: HTTP {response.status_code}")
                    
            except requests.exceptions.ConnectTimeout:
                print(f"⏰ タイムアウト: {url}")
                self.debug_info.append(f"⏰ URL{i}: タイムアウト")
            except requests.exceptions.ConnectionError as e:
                print(f"🔌 接続エラー: {url}")
                self.debug_info.append(f"🔌 URL{i}: 接続エラー")
            except Exception as e:
                print(f"❌ その他エラー: {url} - {str(e)[:50]}")
                self.debug_info.append(f"❌ URL{i}: {str(e)[:30]}")
        
        self.connection_status = "全ての映像URL失敗"
        self.debug_info.append("❌ 全ての映像URLテスト失敗")
        return False
    
    def test_cctv_connections(self):
        """CCTV接続テスト（セッション管理付き）"""
        print("🔍 CCTV接続テスト開始...")
        
        # 1. CCTVセッション確立
        if not self.establish_cctv_session():
            return False
        
        # 2. セッション付き映像URL群テスト
        return self.test_video_urls_with_session()
    
    def detect_objects(self, frame):
        """YOLO物体検出"""
        if self.model is None:
            return frame, []
        
        try:
            results = self.model(frame, verbose=False)
            detections = []
            
            for result in results:
                boxes = result.boxes
                if boxes is not None:
                    for box in boxes:
                        x1, y1, x2, y2 = box.xyxy[0].cpu().numpy()
                        conf = box.conf[0].cpu().numpy()
                        cls = int(box.cls[0].cpu().numpy())
                        
                        if conf > 0.5:
                            class_name = self.model.names[cls]
                            detections.append({
                                'class': class_name,
                                'confidence': float(conf),
                                'bbox': [int(x1), int(y1), int(x2), int(y2)]
                            })
                            
                            cv2.rectangle(frame, (int(x1), int(y1)), (int(x2), int(y2)), (0, 255, 0), 2)
                            label = f'{class_name}: {conf:.2f}'
                            cv2.putText(frame, label, (int(x1), int(y1) - 10), 
                                      cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 0), 2)
            
            return frame, detections
            
        except Exception as e:
            print(f"❌ YOLO検出エラー: {e}")
            return frame, []
    
    def start_cctv_stream(self):
        """CCTVストリーム開始"""
        if not self.test_cctv_connections():
            print("❌ CCTV接続に失敗しました")
            return False
        
        self.is_streaming = True
        
        def stream_worker():
            try:
                print(f"🎥 CCTVストリーム開始: {self.working_url}")
                
                headers = {
                    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
                    'Accept': 'multipart/x-mixed-replace,*/*',
                    'Connection': 'keep-alive'
                }
                
                response = self.session.get(
                    self.working_url,
                    headers=headers,
                    stream=True,
                    timeout=30
                )
                
                if response.status_code == 200:
                    print("✅ CCTV映像ストリーム開始")
                    self.connection_status = "ストリーミング中"
                    
                    buffer = b''
                    frame_count = 0
                    
                    for chunk in response.iter_content(chunk_size=1024):
                        if not self.is_streaming:
                            break
                            
                        buffer += chunk
                        
                        while True:
                            start = buffer.find(b'\xff\xd8')
                            end = buffer.find(b'\xff\xd9')
                            
                            if start != -1 and end != -1 and end > start:
                                jpeg_data = buffer[start:end+2]
                                buffer = buffer[end+2:]
                                
                                img_array = np.frombuffer(jpeg_data, np.uint8)
                                frame = cv2.imdecode(img_array, cv2.IMREAD_COLOR)
                                
                                if frame is not None:
                                    processed_frame, detections = self.detect_objects(frame)
                                    
                                    _, buffer_encoded = cv2.imencode('.jpg', processed_frame, 
                                                                   [cv2.IMWRITE_JPEG_QUALITY, 80])
                                    frame_base64 = base64.b64encode(buffer_encoded).decode('utf-8')
                                    
                                    self.current_frame = frame_base64
                                    self.detection_results = detections
                                    
                                    frame_count += 1
                                    if frame_count % 30 == 0:
                                        print(f"🖼️ フレーム {frame_count}: {len(detections)} objects detected")
                                    
                                    time.sleep(0.1)
                            else:
                                break
                else:
                    print(f"❌ CCTV映像ストリーム失敗: {response.status_code}")
                    self.connection_status = f"HTTP {response.status_code} エラー"
                    
            except Exception as e:
                print(f"❌ CCTVストリームエラー: {e}")
                self.connection_status = f"エラー: {str(e)}"
            finally:
                self.is_streaming = False
                print("🔴 CCTVストリーム停止")
        
        thread = threading.Thread(target=stream_worker, daemon=True)
        thread.start()
        return True
    
    def stop_stream(self):
        """ストリーム停止"""
        self.is_streaming = False
        self.current_frame = None
        self.detection_results = []
        self.connection_status = "停止中"

# グローバルインスタンス
cctv_system = CCTVSessionSystem()

@app.route('/')
def index():
    return render_template_string('''
    <!DOCTYPE html>
    <html>
    <head>
        <title>🏭 KIRII CCTV-YOLO (Session)</title>
        <meta charset="UTF-8">
        <style>
            body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; }
            .container { max-width: 1400px; margin: 0 auto; }
            h1 { text-align: center; font-size: 36px; margin-bottom: 30px; text-shadow: 2px 2px 4px rgba(0,0,0,0.3); }
            .controls { text-align: center; margin: 20px 0; }
            .btn { padding: 15px 30px; margin: 10px; border: none; border-radius: 25px; font-size: 18px; font-weight: bold; cursor: pointer; transition: all 0.3s; box-shadow: 0 4px 15px rgba(0,0,0,0.2); }
            .btn:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(0,0,0,0.3); }
            .btn-success { background: #28a745; color: white; }
            .btn-danger { background: #dc3545; color: white; }
            .btn-info { background: #17a2b8; color: white; }
            .video-container { display: flex; gap: 20px; margin: 20px 0; }
            .video-section { flex: 1; background: rgba(255,255,255,0.1); border-radius: 15px; padding: 20px; backdrop-filter: blur(10px); }
            .video-frame { width: 100%; height: 400px; object-fit: contain; border-radius: 10px; background: #000; }
            .detection-panel { background: rgba(255,255,255,0.1); border-radius: 15px; padding: 20px; margin: 20px 0; backdrop-filter: blur(10px); }
            .detection-item { background: rgba(255,255,255,0.2); margin: 5px 0; padding: 10px; border-radius: 5px; display: flex; justify-content: space-between; }
            .debug-panel { background: rgba(255,255,255,0.1); border-radius: 15px; padding: 20px; margin: 20px 0; backdrop-filter: blur(10px); }
            .debug-item { background: rgba(255,255,255,0.1); margin: 3px 0; padding: 8px; border-radius: 3px; font-size: 14px; font-family: monospace; }
            .stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin: 20px 0; }
            .stat-card { background: rgba(255,255,255,0.1); padding: 15px; border-radius: 10px; text-align: center; backdrop-filter: blur(10px); }
            .stat-number { font-size: 24px; font-weight: bold; color: #ffc107; }
            .status { padding: 15px; margin: 10px 0; border-radius: 10px; font-weight: bold; text-align: center; }
            .status.success { background: rgba(40, 167, 69, 0.3); border: 2px solid #28a745; }
            .status.error { background: rgba(220, 53, 69, 0.3); border: 2px solid #dc3545; }
            .status.info { background: rgba(23, 162, 184, 0.3); border: 2px solid #17a2b8; }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>🏭 KIRII CCTV-YOLO (Session管理)</h1>
            
            <div class="controls">
                <button class="btn btn-info" onclick="testConnection()">🔐 セッション確立</button>
                <button class="btn btn-success" onclick="startStream()">▶️ 監視開始</button>
                <button class="btn btn-danger" onclick="stopStream()">⏹️ 監視停止</button>
            </div>
            
            <div id="status" class="status info">
                待機中 - セッション確立ボタンをクリックしてください
            </div>
            
            <div class="stats">
                <div class="stat-card">
                    <div class="stat-number" id="objectCount">0</div>
                    <div>検出オブジェクト数</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number" id="streamStatus">停止中</div>
                    <div>ストリーム状態</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number">Session Mode</div>
                    <div>セッション管理付き</div>
                </div>
            </div>
            
            <div class="video-container">
                <div class="video-section">
                    <h3>📺 CCTV + YOLO検出</h3>
                    <img id="videoFrame" class="video-frame" style="display: none;" alt="CCTV YOLO Stream">
                    <div id="noVideo" style="text-align: center; line-height: 400px; color: #ccc;">映像はありません</div>
                </div>
            </div>
            
            <div class="debug-panel">
                <h3>🔐 セッション管理ログ</h3>
                <div id="debugInfo">
                    <div style="color: #ccc; text-align: center;">セッション確立を実行してください</div>
                </div>
            </div>
            
            <div class="detection-panel">
                <h3>🎯 リアルタイム検出結果</h3>
                <div id="detectionList">
                    <div style="color: #ccc; text-align: center;">検出されたオブジェクトはありません</div>
                </div>
            </div>
        </div>
        
        <script>
            let updateInterval = null;
            let isStreaming = false;
            
            function testConnection() {
                updateStatus('🔐 セッション確立中...', 'info');
                
                fetch('/test_connection', {method: 'POST'})
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        updateStatus('✅ セッション確立成功: ' + data.method, 'success');
                        updateDebugInfo(data.debug_info || []);
                    } else {
                        updateStatus('❌ セッション確立失敗: ' + data.error, 'error');
                        updateDebugInfo(data.debug_info || []);
                    }
                });
            }
            
            function updateDebugInfo(debugInfo) {
                const debugDiv = document.getElementById('debugInfo');
                if (debugInfo && debugInfo.length > 0) {
                    const debugHtml = debugInfo.map(info => 
                        `<div class="debug-item">${info}</div>`
                    ).join('');
                    debugDiv.innerHTML = debugHtml;
                } else {
                    debugDiv.innerHTML = '<div style="color: #ccc; text-align: center;">デバッグ情報なし</div>';
                }
            }
            
            function startStream() {
                updateStatus('🎥 CCTV接続中...', 'info');
                document.getElementById('streamStatus').textContent = '接続中';
                
                fetch('/start_stream', {method: 'POST'})
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        updateStatus('✅ YOLO監視開始', 'success');
                        document.getElementById('streamStatus').textContent = '監視中';
                        isStreaming = true;
                        updateInterval = setInterval(updateFrame, 200);
                    } else {
                        updateStatus('❌ 監視開始失敗', 'error');
                        document.getElementById('streamStatus').textContent = 'エラー';
                    }
                });
            }
            
            function stopStream() {
                if (updateInterval) {
                    clearInterval(updateInterval);
                    updateInterval = null;
                }
                isStreaming = false;
                
                fetch('/stop_stream', {method: 'POST'})
                .then(response => response.json())
                .then(data => {
                    updateStatus('⏹️ 監視停止', 'info');
                    document.getElementById('streamStatus').textContent = '停止中';
                    document.getElementById('videoFrame').style.display = 'none';
                    document.getElementById('noVideo').style.display = 'block';
                    document.getElementById('objectCount').textContent = '0';
                    document.getElementById('detectionList').innerHTML = '<div style="color: #ccc; text-align: center;">検出されたオブジェクトはありません</div>';
                });
            }
            
            function updateFrame() {
                if (!isStreaming) return;
                
                fetch('/get_frame')
                .then(response => response.json())
                .then(data => {
                    if (data.success && data.frame) {
                        const img = document.getElementById('videoFrame');
                        img.src = 'data:image/jpeg;base64,' + data.frame;
                        img.style.display = 'block';
                        document.getElementById('noVideo').style.display = 'none';
                        
                        updateDetections(data.detections || []);
                        document.getElementById('objectCount').textContent = (data.detections || []).length;
                        
                        updateStatus('✅ YOLO監視中 - ' + new Date().toLocaleTimeString(), 'success');
                    } else {
                        updateStatus('❌ フレーム取得失敗', 'error');
                    }
                })
                .catch(error => {
                    console.error('更新エラー:', error);
                    updateStatus('❌ 通信エラー', 'error');
                });
            }
            
            function updateDetections(detections) {
                const detectionList = document.getElementById('detectionList');
                if (detections && detections.length > 0) {
                    const listHtml = detections.map(det => 
                        `<div class="detection-item">
                            <span><strong>${det.class}</strong></span>
                            <span>${(det.confidence * 100).toFixed(1)}%</span>
                        </div>`
                    ).join('');
                    detectionList.innerHTML = listHtml;
                } else {
                    detectionList.innerHTML = '<div style="color: #ccc; text-align: center;">検出されたオブジェクトはありません</div>';
                }
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
    try:
        success = cctv_system.test_cctv_connections()
        return {
            'success': success, 
            'method': cctv_system.connection_status,
            'url': cctv_system.working_url,
            'debug_info': cctv_system.debug_info
        }
    except Exception as e:
        return {
            'success': False, 
            'error': str(e),
            'debug_info': cctv_system.debug_info
        }

@app.route('/start_stream', methods=['POST'])
def start_stream():
    """ストリーム開始"""
    try:
        success = cctv_system.start_cctv_stream()
        return {'success': success}
    except Exception as e:
        return {'success': False, 'error': str(e)}

@app.route('/stop_stream', methods=['POST'])
def stop_stream():
    """ストリーム停止"""
    cctv_system.stop_stream()
    return {'success': True}

@app.route('/get_frame')
def get_frame():
    """フレーム取得"""
    if cctv_system.current_frame:
        return {
            'success': True, 
            'frame': cctv_system.current_frame,
            'detections': cctv_system.detection_results
        }
    else:
        return {'success': False}

if __name__ == '__main__':
    print("🏭 KIRII CCTV-YOLO監視システム (Session管理)")
    print("📡 中間ルーター: 192.168.0.115")
    print("📺 CCTV: 192.168.1.10:80")
    print("🔐 セッション管理機能付き")
    print("🌐 アクセス: http://localhost:5008")
    app.run(host='0.0.0.0', port=5008, debug=True) 