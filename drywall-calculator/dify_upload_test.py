import requests

# 設定（必要に応じて書き換えてください）
DIFY_API_KEY = "app-yXT2ARodfzwNJnLEMb3zVILQ"  # ←あなたのAPIキー
DIFY_UPLOAD_URL = "https://api.dify.ai/v1/files/upload"
PDF_PATH = "sample.pdf"  # テスト用PDFファイルのパス

def upload_pdf():
    with open(PDF_PATH, "rb") as f:
        files = {"file": (PDF_PATH, f, "application/pdf")}
        data = {"user": "test_user"}
        headers = {"Authorization": f"Bearer {DIFY_API_KEY}"}
        response = requests.post(DIFY_UPLOAD_URL, files=files, data=data, headers=headers)
        print("Upload response:", response.status_code, response.text)
        return response.json()

if __name__ == "__main__":
    result = upload_pdf()
    print("Uploaded file info:", result)
    # resultの中のidやfileIdを控えておく 