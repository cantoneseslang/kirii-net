import { NextRequest, NextResponse } from 'next/server';

// Dify API credentials - 正しい値に更新
const DIFY_API_KEY = "app-yXT2ARodfzwNJnLEMb3zVILQ"; // 元々のAPIキー
const WORKFLOW_ID = "JZ7hOWH3CbN26zBo"; // ワークフローID
const API_BASE_URL = "https://api.dify.ai";
const DIFY_ENDPOINT = `${API_BASE_URL}/v1/files/upload`;

// 詳細ログ出力
console.log(`API credentials initialized:`);
console.log(`API_BASE_URL: ${API_BASE_URL}`);
console.log(`DIFY_ENDPOINT: ${DIFY_ENDPOINT}`);
console.log(`WORKFLOW_ID: ${WORKFLOW_ID}`);

export async function POST(request: NextRequest) {
  try {
    // Get the form data from the request
    const formData = await request.formData();
    
    console.log("API Route: Received file upload request");
    
    // ファイルがフォームデータに含まれていることを確認
    const file = formData.get('file');
    if (!file) {
      console.error("No file found in form data");
      return NextResponse.json({ error: "No file was provided" }, { status: 400 });
    }
    
    console.log(`File received: ${(file as File).name}, size: ${(file as File).size} bytes, type: ${(file as File).type}`);
    
    // 一意のファイルIDとユーザーIDを作成
    const userId = 'user_' + Date.now();
    const fileId = 'file_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
    console.log(`Generated fileId: ${fileId}, userId: ${userId}`);
    
    // DifyのAPIに必要なユーザーIDを追加
    const newFormData = new FormData();
    newFormData.append('file', file);
    newFormData.append('user', userId);
    
    // Forward the request to Dify API
    console.log(`Sending file to Dify API: ${DIFY_ENDPOINT}`);
    const response = await fetch(DIFY_ENDPOINT, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${DIFY_API_KEY}`
        // Content-Typeヘッダーは自動的に設定される
      },
      body: newFormData
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Dify API file upload failed with status: ${response.status}`);
      console.error(`Error response: ${errorText}`);
      return NextResponse.json({ 
        error: `Dify API file upload failed with status: ${response.status}` 
      }, { status: response.status });
    }
    
    // Dify APIからのレスポンスを取得
    const data = await response.json();
    console.log("Dify API response:", JSON.stringify(data, null, 2));
    
    // データにファイルIDが含まれていない場合、生成したIDを使用
    if (!data.id) {
      console.log(`Dify API didn't return a file ID, using generated ID: ${fileId}`);
      data.id = fileId;
    }
    
    // ファイルIDをwebhookエンドポイントに手動登録（自前のサーバーメモリストレージに格納）
    try {
      // Webhookエンドポイントにファイルの存在を事前登録（オプショナル）
      const webhookPreRegisterResponse = await fetch('/api/dify/webhook', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-file-id': data.id // カスタムヘッダーでファイルIDを送信
        },
        body: JSON.stringify({
          fileId: data.id,
          status: 'uploaded',
          timestamp: new Date().toISOString()
        })
      });
      
      if (webhookPreRegisterResponse.ok) {
        console.log(`Pre-registered file ${data.id} with webhook endpoint`);
      } else {
        console.warn(`Failed to pre-register with webhook, but continuing: ${webhookPreRegisterResponse.status}`);
      }
    } catch (webhookError) {
      console.error("Webhook pre-registration error (non-critical):", webhookError);
      // ここでのエラーは無視して続行
    }
    
    // Return the modified Dify API response
    console.log("API Route: File upload successful, returning file ID:", data.id);
    return NextResponse.json(data);
    
  } catch (error) {
    console.error("API Route Error in upload:", error);
    return NextResponse.json({ 
      error: `Internal server error: ${error instanceof Error ? error.message : String(error)}` 
    }, { status: 500 });
  }
}

// Required for Next.js App Router when using formData
export const config = {
  api: {
    bodyParser: false,
  },
};
