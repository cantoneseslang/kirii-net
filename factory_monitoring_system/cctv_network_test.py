#!/usr/bin/env python3

import requests
import cv2
import numpy as np
from flask import Flask, render_template_string
import threading
import time

app = Flask(__name__)

class CCTVNetworkTester:
    def __init__(self):
        self.test_results = []
        
    def test_cctv_urls(self):
        """CCTVの各種URLをテスト"""
        # CCTVの設定に基づくURL候補
        test_urls = [
            # 基本MJPEG URL
            "http://192.168.1.10/cgi-bin/guest/Video.cgi?media=MJPEG",
            "http://admin:admin@192.168.1.10/cgi-bin/guest/Video.cgi?media=MJPEG",
            
            # 解像度指定
            "http://192.168.1.10/cgi-bin/guest/Video.cgi?media=MJPEG&resolution=640*480",
            "http://admin:admin@192.168.1.10/cgi-bin/guest/Video.cgi?media=MJPEG&resolution=640*480",
            
            # ポート明示
            "http://192.168.1.10:80/cgi-bin/guest/Video.cgi?media=MJPEG",
            "http://admin:admin@192.168.1.10:80/cgi-bin/guest/Video.cgi?media=MJPEG",
            
            # チャンネル指定 (CH1)
            "http://192.168.1.10/cgi-bin/guest/Video.cgi?media=MJPEG&channel=1",
            "http://admin:admin@192.168.1.10/cgi-bin/guest/Video.cgi?media=MJPEG&channel=1",
            
            # 代替形式
            "http://192.168.1.10/mjpeg",
            "http://192.168.1.10/video.mjpg",
            "http://192.168.1.10/axis-cgi/mjpg/video.cgi",
            
            # ゲートウェイ経由テスト
            "http://192.168.1.1/cgi-bin/guest/Video.cgi?media=MJPEG",
        ]
        
        print("🔍 CCTV接続テスト開始...")
        self.test_results = []
        
        for url in test_urls:
            result = self.test_single_url(url)
            self.test_results.append(result)
            print(f"{'✅' if result['success'] else '❌'} {url[:60]}{'...' if len(url) > 60 else ''}")
            if result['success']:
                print(f"   ✅ 成功: {result['message']}")
            else:
                print(f"   ❌ 失敗: {result['error']}")
            time.sleep(1)
        
        # 成功したURLを表示
        successful_urls = [r for r in self.test_results if r['success']]
        if successful_urls:
            print("\n🎉 接続成功したURL:")
            for result in successful_urls:
                print(f"✅ {result['url']}")
        else:
            print("\n❌ 接続できるURLが見つかりませんでした")
            
        return self.test_results
    
    def test_single_url(self, url):
        """単一URLのテスト"""
        try:
            # 短いタイムアウトでテスト
            response = requests.get(url, timeout=5, stream=True)
            
            if response.status_code == 200:
                # Content-Typeを確認
                content_type = response.headers.get('content-type', '')
                
                if 'image' in content_type.lower() or 'mjpeg' in content_type.lower():
                    return {
                        'url': url,
                        'success': True,
                        'message': f'HTTP {response.status_code}, Content-Type: {content_type}',
                        'content_type': content_type
                    }
                else:
                    return {
                        'url': url,
                        'success': False,
                        'error': f'不正なContent-Type: {content_type}'
                    }
            else:
                return {
                    'url': url,
                    'success': False,
                    'error': f'HTTP {response.status_code}'
                }
                
        except requests.exceptions.ConnectTimeout:
            return {
                'url': url,
                'success': False,
                'error': '接続タイムアウト'
            }
        except requests.exceptions.ConnectionError as e:
            return {
                'url': url,
                'success': False,
                'error': f'接続エラー: {str(e)[:50]}...'
            }
        except Exception as e:
            return {
                'url': url,
                'success': False,
                'error': f'エラー: {str(e)[:50]}...'
            }

# グローバルインスタンス
tester = CCTVNetworkTester()

@app.route('/')
def index():
    return render_template_string('''
    <!DOCTYPE html>
    <html>
    <head>
        <title>CCTV Network Tester</title>
        <meta charset="UTF-8">
        <style>
            body { font-family: Arial, sans-serif; margin: 20px; background: #f0f0f0; }
            .container { max-width: 1200px; margin: 0 auto; background: white; padding: 20px; border-radius: 10px; }
            h1 { color: #333; text-align: center; }
            .btn { padding: 10px 20px; background: #007bff; color: white; border: none; border-radius: 5px; cursor: pointer; margin: 10px; }
            .btn:hover { background: #0056b3; }
            .results { margin-top: 20px; }
            .result-item { padding: 10px; margin: 5px 0; border-radius: 5px; }
            .success { background: #d4edda; border: 1px solid #c3e6cb; }
            .error { background: #f8d7da; border: 1px solid #f5c6cb; }
            .url { font-family: monospace; font-weight: bold; }
            .message { margin-top: 5px; font-size: 14px; }
            .network-info { background: #e7f3ff; padding: 15px; border-radius: 5px; margin-bottom: 20px; }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>🔍 CCTV Network Connection Tester</h1>
            
            <div class="network-info">
                <h3>📋 CCTV設定情報</h3>
                <p><strong>IP:</strong> 192.168.1.10</p>
                <p><strong>ポート:</strong> 80</p>
                <p><strong>ゲートウェイ:</strong> 192.168.1.1</p>
                <p><strong>MAC:</strong> 00:0E:53:2C:29:A4</p>
            </div>
            
            <button class="btn" onclick="startTest()">🚀 接続テスト開始</button>
            <button class="btn" onclick="refreshResults()">🔄 結果更新</button>
            
            <div id="results" class="results">
                <p>「接続テスト開始」ボタンをクリックしてください</p>
            </div>
        </div>
        
        <script>
            function startTest() {
                document.getElementById('results').innerHTML = '<p>🔍 テスト実行中...</p>';
                
                fetch('/test', {method: 'POST'})
                .then(response => response.json())
                .then(data => {
                    displayResults(data.results);
                });
            }
            
            function refreshResults() {
                fetch('/results')
                .then(response => response.json())
                .then(data => {
                    displayResults(data.results);
                });
            }
            
            function displayResults(results) {
                const resultsDiv = document.getElementById('results');
                
                if (!results || results.length === 0) {
                    resultsDiv.innerHTML = '<p>結果がありません</p>';
                    return;
                }
                
                let html = '<h3>📊 テスト結果</h3>';
                let successCount = 0;
                
                results.forEach(result => {
                    const className = result.success ? 'success' : 'error';
                    const icon = result.success ? '✅' : '❌';
                    
                    if (result.success) successCount++;
                    
                    html += `
                        <div class="result-item ${className}">
                            <div class="url">${icon} ${result.url}</div>
                            <div class="message">
                                ${result.success ? result.message : result.error}
                            </div>
                        </div>
                    `;
                });
                
                html = `<p><strong>成功: ${successCount}/${results.length}</strong></p>` + html;
                resultsDiv.innerHTML = html;
            }
        </script>
    </body>
    </html>
    ''')

@app.route('/test', methods=['POST'])
def test():
    """テスト実行"""
    results = tester.test_cctv_urls()
    return {'results': results}

@app.route('/results')
def results():
    """結果取得"""
    return {'results': tester.test_results}

if __name__ == '__main__':
    print("🔍 CCTV Network Tester 起動中...")
    print("🌐 アクセス: http://localhost:5001")
    app.run(host='0.0.0.0', port=5001, debug=True) 