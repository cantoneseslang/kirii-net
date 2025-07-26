#!/usr/bin/env python3
"""
低解像度カメラ・遠距離対応QRコード生成
- 超大マス（低解像度カメラ・遠距離対応）
- GoogleシートURL+セル指定
- 読み取り後に直接該当行に飛ぶ
- 複数ユーザー同時対応
"""

import qrcode
from qrcode.constants import ERROR_CORRECT_L
from PIL import Image, ImageDraw, ImageFont

class LowResolutionQRGenerator:
    def __init__(self):
        # GoogleシートのベースURL
        self.google_sheet_id = "1u_fsEVAumMySLx8fZdMP5M4jgHiGG6ncPjFEXSXHQ1M"
        
        # 製品情報と対応行
        self.products = {
            '1': {
                'code': 'BD-060',
                'name': '泰山普通石膏板',
                'quantity': 100,
                'row': 2  # Googleシートの行番号
            },
            '2': {
                'code': 'US0503206MM2440', 
                'name': 'Stud 50mmx32mm',
                'quantity': 200,
                'row': 3
            },
            '3': {
                'code': 'AC-258',
                'name': 'KIRII Corner Bead',
                'quantity': 50,
                'row': 4
            },
            '4': {
                'code': 'AC-261',
                'name': '黃岩綿- 60g',
                'quantity': 10,
                'row': 5
            }
        }
    
    def generate_sheet_url_with_cell(self, row_number):
        """GoogleシートURL+該当行セル指定生成"""
        # 該当行のA列セルに直接飛ぶURL
        return f"https://docs.google.com/spreadsheets/d/{self.google_sheet_id}/edit#gid=0&range=A{row_number}"
    
    def generate_low_res_qr(self, product_id):
        """低解像度カメラ・遠距離対応QRコード生成（直接セル飛び）"""
        
        if product_id not in self.products:
            return None
        
        product = self.products[product_id]
        product_code = product['code']
        row_number = product['row']
        
        # GoogleシートURL+該当行セル指定
        sheet_url = self.generate_sheet_url_with_cell(row_number)
        
        # 超大マス設定（低解像度カメラ・遠距離対応）
        qr = qrcode.QRCode(
            version=2,  # URLのため大きめ
            error_correction=ERROR_CORRECT_L,  # 最低エラー訂正
            box_size=65,  # 超大マス（遠距離読み取り対応）
            border=12,    # 超大余白
        )
        
        qr.add_data(sheet_url)
        qr.make(fit=True)
        
        # QRコード画像生成
        qr_img = qr.make_image(fill_color="black", back_color="white")
        qr_img = qr_img.resize((1500, 1500))  # 超大サイズ
        
        # 品名付きキャンバス作成
        canvas_width = 1500
        canvas_height = 1800
        canvas = Image.new('RGB', (canvas_width, canvas_height), 'white')
        
        # QRコードを上部に配置
        canvas.paste(qr_img, (0, 0))
        
        # 品名描画
        draw = ImageDraw.Draw(canvas)
        
        try:
            font_huge = ImageFont.truetype("/System/Library/Fonts/Arial.ttf", 85)
            font_large = ImageFont.truetype("/System/Library/Fonts/Arial.ttf", 65)
            font_medium = ImageFont.truetype("/System/Library/Fonts/Arial.ttf", 50)
        except:
            font_huge = ImageFont.load_default()
            font_large = ImageFont.load_default()
            font_medium = ImageFont.load_default()
        
        # QRコードID（超特大・赤）
        text_y = 1540
        draw.text((750, text_y), f"QR{product_id}", font=font_huge, fill='red', anchor='mm')
        
        # 製品コード（超特大・青）
        text_y = 1630
        draw.text((750, text_y), f"{product_code}", font=font_huge, fill='blue', anchor='mm')
        
        # 製品名
        product_name = product['name']
        text_y = 1710
        draw.text((750, text_y), product_name, font=font_medium, fill='black', anchor='mm')
        
        # 数量表示
        text_y = 1770
        draw.text((750, text_y), f"数量: {product['quantity']}個", 
                 font=font_large, fill='green', anchor='mm')
        
        # ファイル保存
        filename = f"direct_qr_{product_id}_{product_code}.png"
        canvas.save(filename, dpi=(300, 300))
        
        print(f"✅ 直接飛びQRコード生成: {filename}")
        print(f"   QRコードID: {product_id}")
        print(f"   製品コード: {product_code}")
        print(f"   GoogleシートURL: {sheet_url}")
        print(f"   製品名: {product['name']}")
        print(f"   数量: {product['quantity']}個")
        print(f"   マスサイズ: 65px (超大)")
        print(f"   画像サイズ: 1500x1800px")
        
        return filename
    
    def generate_all_low_res_qr(self):
        """全製品の低解像度対応QRコード生成"""
        print("🔲 直接飛び：低解像度カメラ・遠距離対応QRコード生成")
        print("=" * 80)
        
        qr_files = []
        for product_id in self.products.keys():
            filename = self.generate_low_res_qr(product_id)
            if filename:
                qr_files.append(filename)
                print()
        
        print("=" * 80)
        print(f"✅ 全{len(qr_files)}個の直接飛びQRコード生成完了")
        
        # 使用方法ガイド作成
        self.create_usage_guide()
        
        return qr_files
    
    def create_usage_guide(self):
        """使用方法ガイド作成"""
        guide_content = f"""
🔲 直接飛び：低解像度カメラ・遠距離対応QRコード使用方法
========================================

📱 携帯での使用方法:
1. QRコードを携帯カメラで読み取り（遠距離・低解像度対応）
2. 自動的にGoogleシートが開く
3. 該当製品の行（A列）に自動で飛ぶ
4. 製品情報を即座に確認

🎯 QRコード仕様（低解像度・遠距離対応）:
- マスサイズ: 65px（超大・遠距離読み取り対応）
- 余白: 12（超大余白）
- Version 2（URL用）
- エラー訂正レベル L
- 画像サイズ: 1500x1800px

💡 直接飛び機能:
- QRコード1 → Googleシート2行目（BD-060）に直接飛ぶ
- QRコード2 → Googleシート3行目（US0503206MM2440）に直接飛ぶ  
- QRコード3 → Googleシート4行目（AC-258）に直接飛ぶ
- QRコード4 → Googleシート5行目（AC-261）に直接飛ぶ

📋 製品情報:
- QRコード1: BD-060 - 泰山普通石膏板 (100個)
- QRコード2: US0503206MM2440 - Stud 50mmx32mm (200個)
- QRコード3: AC-258 - KIRII Corner Bead (50個)
- QRコード4: AC-261 - 黃岩綿- 60g (10個)

📱 印刷推奨:
- サイズ: 37.5cm x 45cm (超大型)
- 解像度: 300dpi以上
- 用紙: 白色厚紙
- ラミネート推奨

🔧 低解像度カメラ・遠距離対応:
- 超大マス（65px）で確実読み取り
- GoogleシートURL（約120文字）
- 高コントラスト設計
- 超大型印刷推奨

👥 複数ユーザー対応:
- 同時アクセス可能
- 各QRコードが独立した行に飛ぶ
- リアルタイム情報表示

🔍 動作フロー:
1. QRコード読み取り → 自動でGoogleシート開く
2. 該当製品行に自動で移動
3. 製品コード・製品名・数量を即座確認
4. 手動入力不要

🎯 真のフィルター機能:
- 読み取り即座にGoogleシート表示
- 該当製品行に自動フォーカス
- 製品情報を即座に確認可能
- 複数社員が同時に異なる製品確認
========================================
        """
        
        with open('direct_qr_guide.txt', 'w', encoding='utf-8') as f:
            f.write(guide_content)
        
        print("📋 使用方法ガイド: direct_qr_guide.txt")

# メイン実行
if __name__ == '__main__':
    print("🔲 直接飛び：低解像度カメラ・遠距離対応QRコード生成システム")
    print("=" * 80)
    
    qr_gen = LowResolutionQRGenerator()
    
    # 低解像度対応QRコード生成
    qr_files = qr_gen.generate_all_low_res_qr()
    
    print("\n🎯 完了！")
    print("📱 生成されたファイル:")
    for filename in qr_files:
        print(f"✅ {filename}")
    print("✅ direct_qr_guide.txt")
    
    print(f"\n📋 次のステップ:")
    print("1. QRコードを37.5cm x 45cmで印刷（超大型）")
    print("2. 工場に設置")
    print("3. 低解像度カメラで遠距離読み取りテスト")
    print("4. 自動Googleシート飛び確認")
