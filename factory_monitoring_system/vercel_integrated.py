#!/usr/bin/env python3

from flask import Flask, render_template_string, jsonify, request
import cv2
import numpy as np
from ultralytics import YOLO
import base64
import threading
import time
import os
import requests
from datetime import datetime

app = Flask(__name__)

class VercelIntegratedYOLO:
    def __init__(self):
        self.model = None
        self.current_frame = None
        self.detection_data = {
            'detections': [],
            'detection_count': 0,
            'timestamp': None,
            'frame_count': 0,
            'status': 'stopped'
        }
        self.is_streaming = False
        self.camera_url = None
        self.load_model()
        
    def load_model(self):
        """YOLOモデルの読み込み"""
        try:
            # Vercel環境でのモデル読み込み
            model_path = 'yolo11n.pt'
            if os.path.exists(model_path):
                self.model = YOLO(model_path)
                print("✅ YOLOモデル読み込み成功")
            else:
                print("❌ YOLOモデルファイルが見つかりません")
        except Exception as e:
            print(f"❌ モデル読み込みエラー: {e}")
    
    def detect_objects(self, frame):
        """オブジェクト検出"""
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
                        
                        if conf > 0.5:  # 信頼度閾値
                            class_name = self.model.names[cls]
                            detections.append({
                                'class': class_name,
                                'confidence': float(conf),
                                'bbox': [int(x1), int(y1), int(x2), int(y2)]
                            })
                            
                            # バウンディングボックスを描画
                            cv2.rectangle(frame, (int(x1), int(y1)), (int(x2), int(y2)), (0, 255, 0), 2)
                            cv2.putText(frame, f'{class_name}: {conf:.2f}', 
                                      (int(x1), int(y1) - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 0), 2)
            
            return frame, detections
            
        except Exception as e:
            print(f"❌ 検出エラー: {e}")
            return frame, []
    
    def process_camera_stream(self):
        """カメラストリーム処理"""
        if not self.camera_url:
            return
            
        self.is_streaming = True
        self.detection_data['status'] = 'streaming'
        frame_count = 0
        
        while self.is_streaming:
            try:
                # HTTPストリームから画像を取得
                response = requests.get(self.camera_url, timeout=10, stream=True)
                if response.status_code == 200:
                    # バイトデータから画像を作成
                    img_array = np.frombuffer(response.content, np.uint8)
                    frame = cv2.imdecode(img_array, cv2.IMREAD_COLOR)
                    
                    if frame is not None:
                        # オブジェクト検出
                        processed_frame, detections = self.detect_objects(frame)
                        
                        # JPEGエンコード
                        _, buffer = cv2.imencode('.jpg', processed_frame, [cv2.IMWRITE_JPEG_QUALITY, 80])
                        frame_base64 = base64.b64encode(buffer).decode('utf-8')
                        
                        # データ更新
                        self.current_frame = frame_base64
                        self.detection_data.update({
                            'detections': detections,
                            'detection_count': len(detections),
                            'timestamp': datetime.now().isoformat(),
                            'frame_count': frame_count,
                            'status': 'streaming'
                        })
                        
                        frame_count += 1
                        
                    time.sleep(0.1)  # 10 FPS
                else:
                    print(f"❌ カメラ接続エラー: {response.status_code}")
                    time.sleep(2)
                    
            except Exception as e:
                print(f"❌ ストリーム処理エラー: {e}")
                time.sleep(2)
        
        self.detection_data['status'] = 'stopped'
        print("🔚 ストリーミング停止")

# グローバルインスタンス
yolo_system = VercelIntegratedYOLO()

@app.route('/')
def index():
    return render_template_string('''
    <!DOCTYPE html>
    <html>
    <head>
        <title>KIRII-VERCEL-YOLO-VIEWER</title>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
            body { 
                margin: 0; 
                padding: 20px; 
                font-family: Arial, sans-serif; 
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
            }
            .header {
                text-align: center;
                margin-bottom: 30px;
                background: rgba(255,255,255,0.1);
                padding: 20px;
                border-radius: 15px;
                backdrop-filter: blur(10px);
            }
            h1 { 
                margin: 0;
                font-size: 32px;
                font-weight: bold;
                text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
            }
            .container {
                max-width: 1200px;
                margin: 0 auto;
            }
            .video-section {
                background: rgba(255,255,255,0.1);
                border-radius: 15px;
                padding: 20px;
                margin-bottom: 20px;
                backdrop-filter: blur(10px);
            }
            .video-container { 
                text-align: center; 
                border: 3px solid rgba(255,255,255,0.3); 
                border-radius: 10px; 
                padding: 10px; 
                background: rgba(0,0,0,0.3);
                width: 100%;
                height: 60vh;
                display: flex;
                align-items: center;
                justify-content: center;
                overflow: hidden;
                position: relative;
            }
            #video { 
                width: 100%; 
                height: 100%; 
                object-fit: contain;
                border-radius: 5px;
            }
            .loading {
                font-size: 18px;
                color: #fff;
                text-align: center;
            }
            .controls { 
                text-align: center; 
                margin: 20px 0;
                display: flex;
                gap: 15px;
                justify-content: center;
                flex-wrap: wrap;
            }
            .btn { 
                padding: 12px 24px; 
                border: none; 
                border-radius: 25px; 
                cursor: pointer; 
                font-size: 16px; 
                font-weight: bold;
                transition: all 0.3s;
                box-shadow: 0 4px 15px rgba(0,0,0,0.2);
            }
            .btn:hover {
                transform: translateY(-2px);
                box-shadow: 0 6px 20px rgba(0,0,0,0.3);
            }
            .btn-success { background: #28a745; color: white; }
            .btn-danger { background: #dc3545; color: white; }
            .btn-primary { background: #007bff; color: white; }
            .btn-warning { background: #ffc107; color: #212529; }
            .input-group {
                display: flex;
                gap: 10px;
                margin: 20px 0;
                justify-content: center;
                flex-wrap: wrap;
            }
            .form-control {
                padding: 12px;
                border: none;
                border-radius: 25px;
                font-size: 16px;
                min-width: 300px;
                background: rgba(255,255,255,0.9);
                color: #333;
            }
            .status { 
                text-align: center; 
                margin: 20px 0; 
                padding: 15px; 
                background: rgba(40, 167, 69, 0.2);
                border: 2px solid #28a745;
                border-radius: 10px; 
                font-weight: bold;
            }
            .status.error {
                background: rgba(220, 53, 69, 0.2);
                border-color: #dc3545;
            }
            .detection-info {
                background: rgba(255,255,255,0.1);
                border-radius: 10px;
                padding: 20px;
                margin: 20px 0;
                backdrop-filter: blur(10px);
            }
            .detection-item {
                background: rgba(255,255,255,0.2);
                margin: 5px 0;
                padding: 10px;
                border-radius: 5px;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
            .stats-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                gap: 15px;
                margin: 20px 0;
            }
            .stat-card {
                background: rgba(255,255,255,0.1);
                padding: 15px;
                border-radius: 10px;
                text-align: center;
                backdrop-filter: blur(10px);
            }
            .stat-number {
                font-size: 24px;
                font-weight: bold;
                color: #ffc107;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🚀 KIRII-VERCEL-YOLO-VIEWER</h1>
                <p>完全統合版 - クラウド対応YOLOモニタリングシステム</p>
            </div>
            
            <div class="video-section">
                <div class="input-group">
                    <input type="text" id="cameraUrl" class="form-control" 
                           placeholder="カメラURL を入力してください (例: http://camera-ip/video.mjpg)"
                           value="">
                    <button onclick="setCameraUrl()" class="btn btn-warning">📷 カメラ設定</button>
                </div>
                
                <div class="video-container">
                    <img id="video" style="display: none;" alt="YOLO Detection Feed">
                    <div id="loading" class="loading">📡 カメラURLを設定してください</div>
                </div>
                
                <div class="controls">
                    <button onclick="startStreaming()" class="btn btn-success" id="startBtn">▶️ 検出開始</button>
                    <button onclick="stopStreaming()" class="btn btn-danger" id="stopBtn">⏹️ 検出停止</button>
                    <button onclick="refreshStream()" class="btn btn-primary">🔄 更新</button>
                </div>
            </div>
            
            <div id="status" class="status">
                ⏸️ 待機中 - カメラURLを設定して検出を開始してください
            </div>
            
            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-number" id="detectionCount">0</div>
                    <div>検出オブジェクト数</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number" id="frameCount">0</div>
                    <div>処理フレーム数</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number" id="streamStatus">停止中</div>
                    <div>ストリーム状態</div>
                </div>
            </div>
            
            <div class="detection-info">
                <h3>🎯 リアルタイム検出結果</h3>
                <div id="detectionList">
                    <div style="color: #ccc; text-align: center;">検出されたオブジェクトはありません</div>
                </div>
            </div>
        </div>
        
        <script>
            let isStreaming = false;
            let updateInterval = null;
            
            function setCameraUrl() {
                const url = document.getElementById('cameraUrl').value.trim();
                if (!url) {
                    alert('カメラURLを入力してください');
                    return;
                }
                
                fetch('/api/set_camera', {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({url: url})
                })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        document.getElementById('status').textContent = '✅ カメラURL設定完了';
                        document.getElementById('status').className = 'status';
                    } else {
                        document.getElementById('status').textContent = '❌ カメラURL設定失敗';
                        document.getElementById('status').className = 'status error';
                    }
                });
            }
            
            function startStreaming() {
                if (!document.getElementById('cameraUrl').value.trim()) {
                    alert('最初にカメラURLを設定してください');
                    return;
                }
                
                isStreaming = true;
                document.getElementById('streamStatus').textContent = '配信中';
                
                fetch('/api/start_stream', {method: 'POST'})
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        document.getElementById('status').textContent = '✅ YOLO検出開始';
                        document.getElementById('status').className = 'status';
                        updateInterval = setInterval(updateFrame, 100);
                    }
                });
            }
            
            function stopStreaming() {
                isStreaming = false;
                document.getElementById('streamStatus').textContent = '停止中';
                
                if (updateInterval) {
                    clearInterval(updateInterval);
                    updateInterval = null;
                }
                
                fetch('/api/stop_stream', {method: 'POST'})
                .then(response => response.json())
                .then(data => {
                    document.getElementById('status').textContent = '⏹️ 検出停止';
                    document.getElementById('video').style.display = 'none';
                    document.getElementById('loading').style.display = 'block';
                    document.getElementById('loading').textContent = '⏸️ 検出停止中';
                });
            }
            
            function refreshStream() {
                if (isStreaming) {
                    updateFrame();
                }
            }
            
            async function updateFrame() {
                if (!isStreaming) return;
                
                try {
                    const response = await fetch('/api/get_frame');
                    const data = await response.json();
                    
                    if (data.success && data.frame) {
                        const video = document.getElementById('video');
                        video.src = 'data:image/jpeg;base64,' + data.frame;
                        video.style.display = 'block';
                        document.getElementById('loading').style.display = 'none';
                        
                        // 統計情報更新
                        document.getElementById('detectionCount').textContent = data.detection_count || 0;
                        document.getElementById('frameCount').textContent = data.frame_count || 0;
                        
                        // 検出結果表示
                        updateDetectionList(data.detections || []);
                        
                        const timestamp = new Date(data.timestamp).toLocaleTimeString();
                        document.getElementById('status').textContent = 
                            `✅ YOLO検出中 - ${timestamp}`;
                        document.getElementById('status').className = 'status';
                        
                    } else {
                        document.getElementById('video').style.display = 'none';
                        document.getElementById('loading').style.display = 'block';
                        document.getElementById('loading').textContent = '❌ フレーム取得失敗';
                        document.getElementById('status').textContent = '❌ 接続エラー';
                        document.getElementById('status').className = 'status error';
                    }
                    
                } catch (error) {
                    console.error('更新エラー:', error);
                    document.getElementById('status').textContent = '❌ ネットワークエラー';
                    document.getElementById('status').className = 'status error';
                }
            }
            
            function updateDetectionList(detections) {
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
        </script>
    </body>
    </html>
    ''')

@app.route('/api/set_camera', methods=['POST'])
def set_camera():
    """カメラURL設定"""
    try:
        data = request.json
        yolo_system.camera_url = data.get('url')
        return jsonify({'success': True})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)})

@app.route('/api/start_stream', methods=['POST'])
def start_stream():
    """ストリーミング開始"""
    try:
        if not yolo_system.camera_url:
            return jsonify({'success': False, 'error': 'Camera URL not set'})
        
        if not yolo_system.is_streaming:
            threading.Thread(target=yolo_system.process_camera_stream, daemon=True).start()
        
        return jsonify({'success': True})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)})

@app.route('/api/stop_stream', methods=['POST'])
def stop_stream():
    """ストリーミング停止"""
    try:
        yolo_system.is_streaming = False
        return jsonify({'success': True})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)})

@app.route('/api/get_frame')
def get_frame():
    """現在のフレームと検出データを取得"""
    try:
        if yolo_system.current_frame:
            return jsonify({
                'success': True,
                'frame': yolo_system.current_frame,
                'detections': yolo_system.detection_data['detections'],
                'detection_count': yolo_system.detection_data['detection_count'],
                'timestamp': yolo_system.detection_data['timestamp'],
                'frame_count': yolo_system.detection_data['frame_count'],
                'status': yolo_system.detection_data['status']
            })
        else:
            return jsonify({'success': False, 'error': 'No frame available'})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)})

if __name__ == '__main__':
    port = int(os.getenv('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=False) 