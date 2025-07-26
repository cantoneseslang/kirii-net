#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
YouTubeライブストリーム監視システム
海岸の人数カウント用 - YOLO11による人検出
"""

import cv2
import numpy as np
import time
import json
import os
from datetime import datetime, timedelta
from collections import defaultdict, deque
from typing import Dict, List, Tuple, Optional
import logging
import threading
import yt_dlp
import requests

from factory_monitor import FactoryMonitor
from object_counter import AdvancedObjectCounter, CountingZone, DetectedObject


class YouTubeStreamMonitor:
    """YouTubeライブストリーム監視クラス"""
    
    def __init__(self, youtube_url: str):
        """
        初期化
        
        Args:
            youtube_url: YouTubeライブストリームURL
        """
        self.logger = logging.getLogger(__name__)
        self.youtube_url = youtube_url
        
        # 監視システム初期化
        self.monitor = FactoryMonitor()
        self.counter = AdvancedObjectCounter()
        
        # ストリーム設定
        self.cap = None
        self.is_streaming = False
        self.stream_url = None
        
        # 人数カウント専用設定
        self.person_counts = deque(maxlen=1000)
        self.current_person_count = 0
        self.max_person_count = 0
        self.total_detections = 0
        
        # 海岸監視用ゾーン設定
        self.setup_beach_zones()
        
        self.logger.info(f"YouTubeストリーム監視システム初期化: {youtube_url}")
    
    def setup_beach_zones(self):
        """海岸監視用ゾーン設定"""
        # 海岸エリア全体をカウント対象に
        beach_zone = CountingZone(
            name="海岸エリア",
            polygon=[(50, 50), (1200, 50), (1200, 650), (50, 650)],
            target_classes={'person'}
        )
        self.counter.add_counting_zone(beach_zone)
        
        # 特定エリア（例：砂浜中央部）
        central_beach_zone = CountingZone(
            name="砂浜中央",
            polygon=[(300, 200), (900, 200), (900, 500), (300, 500)],
            target_classes={'person'}
        )
        self.counter.add_counting_zone(central_beach_zone)
        
        self.logger.info("海岸監視用ゾーンを設定しました")
    
    def get_youtube_stream_url(self) -> Optional[str]:
        """YouTubeライブストリームの実際のURLを取得"""
        try:
            ydl_opts = {
                'format': 'best[height<=720]',  # 720p以下で最高品質
                'quiet': True,
                'no_warnings': True,
            }
            
            with yt_dlp.YoutubeDL(ydl_opts) as ydl:
                info = ydl.extract_info(self.youtube_url, download=False)
                
                if 'url' in info:
                    self.stream_url = info['url']
                    self.logger.info("YouTubeストリームURL取得成功")
                    return self.stream_url
                else:
                    self.logger.error("ストリームURL取得失敗")
                    return None
                    
        except Exception as e:
            self.logger.error(f"YouTube URL取得エラー: {e}")
            return None
    
    def connect_to_stream(self) -> bool:
        """YouTubeストリームに接続"""
        try:
            # ストリームURL取得
            if not self.get_youtube_stream_url():
                return False
            
            # OpenCV VideoCapture で接続
            self.cap = cv2.VideoCapture(self.stream_url)
            
            # 接続テスト
            if self.cap.isOpened():
                ret, frame = self.cap.read()
                if ret and frame is not None:
                    self.logger.info("YouTubeストリーム接続成功")
                    return True
            
            self.logger.error("YouTubeストリーム接続失敗")
            return False
            
        except Exception as e:
            self.logger.error(f"ストリーム接続エラー: {e}")
            return False
    
    def disconnect_stream(self):
        """ストリーム切断"""
        try:
            self.is_streaming = False
            
            if self.cap is not None:
                self.cap.release()
                self.cap = None
            
            cv2.destroyAllWindows()
            self.logger.info("ストリーム切断完了")
            
        except Exception as e:
            self.logger.error(f"ストリーム切断エラー: {e}")
    
    def detect_people_in_frame(self, frame: np.ndarray) -> Tuple[int, np.ndarray, List[DetectedObject]]:
        """
        フレーム内の人検出
        
        Args:
            frame: 入力フレーム
            
        Returns:
            Tuple[int, np.ndarray, List[DetectedObject]]: (人数, 描画済みフレーム, 検出オブジェクト)
        """
        try:
            # YOLO11で検出実行
            results = self.monitor.model(
                frame,
                conf=0.3,  # 人検出用に信頼度を下げる
                iou=0.45,
                classes=[0],  # person クラスのみ
                verbose=False
            )
            
            detected_objects = []
            annotated_frame = frame.copy()
            person_count = 0
            
            if results and len(results) > 0:
                result = results[0]
                
                if result.boxes is not None and len(result.boxes) > 0:
                    boxes = result.boxes.xyxy.cpu().numpy()
                    confidences = result.boxes.conf.cpu().numpy()
                    
                    for i, (box, conf) in enumerate(zip(boxes, confidences)):
                        if conf >= 0.3:  # 人検出の信頼度閾値
                            x1, y1, x2, y2 = box.astype(int)
                            
                            # 検出オブジェクト作成
                            detected_obj = DetectedObject(
                                class_name='person',
                                confidence=conf,
                                bbox=(x1, y1, x2, y2),
                                center=((x1 + x2) // 2, (y1 + y2) // 2),
                                area=(x2 - x1) * (y2 - y1),
                                timestamp=datetime.now()
                            )
                            detected_objects.append(detected_obj)
                            person_count += 1
                            
                            # バウンディングボックス描画
                            cv2.rectangle(annotated_frame, (x1, y1), (x2, y2), (0, 255, 0), 2)
                            
                            # 信頼度表示
                            label = f"Person: {conf:.2f}"
                            label_size = cv2.getTextSize(label, cv2.FONT_HERSHEY_SIMPLEX, 0.6, 2)[0]
                            cv2.rectangle(
                                annotated_frame,
                                (x1, y1 - label_size[1] - 10),
                                (x1 + label_size[0], y1),
                                (0, 255, 0),
                                -1
                            )
                            cv2.putText(
                                annotated_frame,
                                label,
                                (x1, y1 - 5),
                                cv2.FONT_HERSHEY_SIMPLEX,
                                0.6,
                                (255, 255, 255),
                                2
                            )
            
            return person_count, annotated_frame, detected_objects
            
        except Exception as e:
            self.logger.error(f"人検出エラー: {e}")
            return 0, frame, []
    
    def draw_beach_info(self, frame: np.ndarray, person_count: int) -> np.ndarray:
        """海岸情報描画"""
        try:
            # 情報パネル背景
            cv2.rectangle(frame, (10, 10), (600, 150), (0, 0, 0), -1)
            cv2.rectangle(frame, (10, 10), (600, 150), (255, 255, 255), 2)
            
            # タイトル
            cv2.putText(
                frame,
                "Beach People Counter - YOLO11",
                (20, 35),
                cv2.FONT_HERSHEY_SIMPLEX,
                0.8,
                (255, 255, 255),
                2
            )
            
            # 現在時刻
            current_time = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            cv2.putText(
                frame,
                f"Time: {current_time}",
                (20, 60),
                cv2.FONT_HERSHEY_SIMPLEX,
                0.5,
                (200, 200, 200),
                1
            )
            
            # 人数情報
            cv2.putText(
                frame,
                f"Current People: {person_count}",
                (20, 90),
                cv2.FONT_HERSHEY_SIMPLEX,
                0.7,
                (0, 255, 0),
                2
            )
            
            cv2.putText(
                frame,
                f"Max Today: {self.max_person_count}",
                (250, 90),
                cv2.FONT_HERSHEY_SIMPLEX,
                0.7,
                (255, 0, 0),
                2
            )
            
            cv2.putText(
                frame,
                f"Total Detections: {self.total_detections}",
                (20, 120),
                cv2.FONT_HERSHEY_SIMPLEX,
                0.6,
                (255, 255, 0),
                2
            )
            
            # YouTube URL情報
            cv2.putText(
                frame,
                "Source: YouTube Live Stream",
                (250, 120),
                cv2.FONT_HERSHEY_SIMPLEX,
                0.5,
                (150, 150, 150),
                1
            )
            
            return frame
            
        except Exception as e:
            self.logger.error(f"情報描画エラー: {e}")
            return frame
    
    def update_statistics(self, person_count: int):
        """統計情報更新"""
        # 現在の人数更新
        self.current_person_count = person_count
        
        # 最大人数更新
        if person_count > self.max_person_count:
            self.max_person_count = person_count
        
        # 総検出数更新
        self.total_detections += person_count
        
        # 履歴追加
        timestamp = datetime.now()
        self.person_counts.append({
            'timestamp': timestamp.isoformat(),
            'count': person_count,
            'max_today': self.max_person_count
        })
    
    def save_statistics(self):
        """統計データ保存"""
        try:
            stats_data = {
                'last_updated': datetime.now().isoformat(),
                'youtube_url': self.youtube_url,
                'current_count': self.current_person_count,
                'max_count_today': self.max_person_count,
                'total_detections': self.total_detections,
                'recent_counts': list(self.person_counts)[-100:]  # 最新100件
            }
            
            with open('beach_statistics.json', 'w', encoding='utf-8') as f:
                json.dump(stats_data, f, ensure_ascii=False, indent=2)
            
            self.logger.info("統計データ保存完了")
            
        except Exception as e:
            self.logger.error(f"統計データ保存エラー: {e}")
    
    def get_hourly_statistics(self) -> Dict:
        """時間別統計取得"""
        try:
            now = datetime.now()
            hourly_stats = defaultdict(list)
            
            # 過去24時間のデータを時間別に分類
            for entry in self.person_counts:
                timestamp = datetime.fromisoformat(entry['timestamp'])
                if (now - timestamp).total_seconds() <= 86400:  # 24時間以内
                    hour_key = timestamp.strftime("%H:00")
                    hourly_stats[hour_key].append(entry['count'])
            
            # 時間別平均・最大値計算
            result = {}
            for hour, counts in hourly_stats.items():
                result[hour] = {
                    'average': sum(counts) / len(counts),
                    'max': max(counts),
                    'min': min(counts),
                    'samples': len(counts)
                }
            
            return result
            
        except Exception as e:
            self.logger.error(f"時間別統計計算エラー: {e}")
            return {}
    
    def run_monitoring(self, display: bool = True, save_interval: int = 300):
        """
        監視実行
        
        Args:
            display: 画面表示フラグ
            save_interval: 統計保存間隔（秒）
        """
        print(f"🏖️ 海岸人数監視開始")
        print(f"📺 YouTube Live: {self.youtube_url}")
        print("'q'キーで終了、's'キーでスクリーンショット保存")
        
        # ストリーム接続
        if not self.connect_to_stream():
            print("❌ YouTubeストリーム接続失敗")
            return
        
        self.is_streaming = True
        last_save_time = time.time()
        frame_count = 0
        
        try:
            while self.is_streaming:
                # フレーム取得
                ret, frame = self.cap.read()
                
                if not ret or frame is None:
                    print("⚠️ フレーム取得失敗 - 再接続試行")
                    
                    # 再接続試行
                    self.disconnect_stream()
                    time.sleep(5)
                    
                    if not self.connect_to_stream():
                        print("❌ 再接続失敗")
                        break
                    continue
                
                frame_count += 1
                
                # 人検出実行（5フレームに1回）
                if frame_count % 5 == 0:
                    person_count, annotated_frame, detected_objects = self.detect_people_in_frame(frame)
                    
                    # カウントゾーン描画
                    zone_frame = self.counter.draw_counting_zones(annotated_frame)
                    
                    # 海岸情報描画
                    final_frame = self.draw_beach_info(zone_frame, person_count)
                    
                    # 統計更新
                    self.update_statistics(person_count)
                    
                    # コンソール出力
                    if person_count > 0:
                        print(f"🏖️ 海岸の人数: {person_count}人 (最大: {self.max_person_count}人)")
                else:
                    final_frame = self.draw_beach_info(frame, self.current_person_count)
                
                # 画面表示
                if display:
                    # ウィンドウサイズ調整
                    display_frame = cv2.resize(final_frame, (1200, 800))
                    cv2.imshow('Beach People Counter - YouTube Live', display_frame)
                    
                    # キー入力処理
                    key = cv2.waitKey(1) & 0xFF
                    if key == ord('q'):
                        break
                    elif key == ord('s'):
                        # スクリーンショット保存
                        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
                        filename = f"beach_screenshot_{timestamp}.jpg"
                        cv2.imwrite(filename, final_frame)
                        print(f"📸 スクリーンショット保存: {filename}")
                
                # 定期統計保存
                current_time = time.time()
                if current_time - last_save_time >= save_interval:
                    self.save_statistics()
                    last_save_time = current_time
                
                # フレームレート制御
                time.sleep(0.1)  # 10 FPS
                
        except KeyboardInterrupt:
            print("\n⏹️ ユーザーによる監視停止")
        except Exception as e:
            print(f"❌ 監視エラー: {e}")
        finally:
            # 最終統計保存
            self.save_statistics()
            
            # クリーンアップ
            self.disconnect_stream()
            
            # 最終統計表示
            print("\n📊 監視結果サマリー:")
            print(f"   最大人数: {self.max_person_count}人")
            print(f"   総検出数: {self.total_detections}")
            print(f"   監視時間: {len(self.person_counts)}分")


def main():
    """メイン関数"""
    print("=== YouTubeライブストリーム海岸監視システム ===")
    print("YOLO11による人数カウント")
    print()
    
    # YouTubeライブストリームURL
    youtube_url = "https://www.youtube.com/live/_Upz1dlQgpg?si=vPvgjPtX32p6zXo2"
    
    try:
        # 監視システム初期化
        monitor = YouTubeStreamMonitor(youtube_url)
        
        print("📋 システム設定:")
        print(f"   YouTube URL: {youtube_url}")
        print(f"   検出対象: 人 (person)")
        print(f"   使用モデル: YOLO11")
        print()
        
        # 監視開始確認
        start_monitoring = input("監視を開始しますか？ (y/n): ").strip().lower()
        
        if start_monitoring.startswith('y'):
            # 監視実行
            monitor.run_monitoring(display=True, save_interval=300)
        else:
            print("監視をキャンセルしました")
            
        # 統計表示
        if len(monitor.person_counts) > 0:
            print("\n📈 時間別統計:")
            hourly_stats = monitor.get_hourly_statistics()
            for hour, stats in sorted(hourly_stats.items()):
                print(f"   {hour}: 平均 {stats['average']:.1f}人, 最大 {stats['max']}人")
    
    except Exception as e:
        print(f"❌ システムエラー: {e}")
        print("requirements.txtの依存関係を確認してください:")
        print("pip install yt-dlp")


if __name__ == "__main__":
    main() 