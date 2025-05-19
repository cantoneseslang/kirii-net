import { NextRequest, NextResponse } from 'next/server';

// Dify API credentials - 正しい値に更新
const DIFY_API_KEY = "app-yXT2ARodfzwNJnLEMb3zVILQ"; // 元々のAPIキー
const APP_ID = "JZ7hOWH3CbN26zBo"; // アプリケーションID（以前のワークフローID）
const API_BASE_URL = "https://api.dify.ai";

// 正しいDify APIエンドポイント - v1/chat-messagesエンドポイントを使用
const DIFY_ENDPOINT = `${API_BASE_URL}/v1/chat-messages`;

// ファイルID→テキスト変換用のメモリキャッシュ
interface WebhookData {
  markdown: string;
  raw: any;
  fileId: string;
  timestamp: number;
}
const webhookCache = new Map<string, WebhookData>();

// デバッグ出力強化
console.log('Extract API Route loaded');
console.log(`DIFY_ENDPOINT: ${DIFY_ENDPOINT}`);
console.log(`APP_ID: ${APP_ID}`);

export async function POST(request: NextRequest) {
  console.log("Extract API Route: Received POST request");
  
  try {
    // リクエストの詳細をログ出力
    const contentType = request.headers.get('content-type');
    console.log(`Request content-type: ${contentType}`);
    
    // Parse the JSON request body
    const requestData = await request.json();
    const { fileObject, query, pages } = requestData;
    
    console.log("Request data received:", JSON.stringify({
      fileObjectKeys: fileObject ? Object.keys(fileObject) : 'none',
      query: query || 'none',
      hasPages: pages ? 'yes' : 'no'
    }));
    
    if (!fileObject) {
      console.error("Error: File object is missing in the request");
      return NextResponse.json({ error: "File object is required" }, { status: 400 });
    }
    
    console.log(`API Route: Processing extract request for file: ${fileObject.filename || fileObject.name || 'unknown'}`);
    console.log(`File ID: ${fileObject.id}`);
    console.log(`API Query: ${query}`);
    
    // Generate a unique user ID for this request
    const userId = `user_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    console.log(`Generated user ID: ${userId}`);
    
    // Difyのチャットメッセージ形式でリクエストを作成
    const requestBody = {
      inputs: {},
      query: query || "Please extract all numerical values and item names required for calculation from this file",
      response_mode: "blocking",
      user: userId,
      files: [fileObject.id]  // ファイルIDを配列として渡す
    };
    
    console.log(`Request body to Dify: ${JSON.stringify(requestBody, null, 2)}`);
    
    // Send request to Dify API chat-messages endpoint
    console.log(`Sending request to Dify API: ${DIFY_ENDPOINT}`);
    const response = await fetch(DIFY_ENDPOINT, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${DIFY_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });
    
    // レスポンスステータスを詳細にログ
    console.log(`Dify API response status: ${response.status} ${response.statusText}`);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Dify API extraction failed with status: ${response.status}`);
      console.error(`Error response: ${errorText}`);
      return NextResponse.json({ 
        error: `Dify API extraction failed with status: ${response.status}` 
      }, { status: response.status });
    }
    
    // Return the Dify API response
    const data = await response.json();
    console.log("API Route: Extraction successful");
    console.log("API Response structure:", Object.keys(data));
    
    // Difyレスポンスから抽出テキストを取得
    let extractedText = "";
    
    // 様々なレスポンス形式に対応
    if (data.answer && typeof data.answer === 'string') {
      extractedText = data.answer;
      console.log("Found direct answer field");
    } else if (data.text && typeof data.text === 'string') {
      extractedText = data.text;
      console.log("Found text field");
    } else if (data.message && typeof data.message === 'string') {
      extractedText = data.message;
      console.log("Found message field");
    } else if (data.content && typeof data.content === 'string') {
      extractedText = data.content;
      console.log("Found content field");
    } else if (data.response && typeof data.response === 'string') {
      extractedText = data.response;
      console.log("Found response field");
    } else if (data.assistant_response && typeof data.assistant_response === 'string') {
      extractedText = data.assistant_response;
      console.log("Found assistant_response field");
    } else {
      // 構造を解析できない場合はJSONを文字列化
      extractedText = JSON.stringify(data, null, 2);
      console.log("No recognized text fields found, stringifying entire response");
    }
    
    // 最終的な抽出テキストをログ出力
    if (extractedText) {
      console.log("Final extracted text sample:", extractedText.substring(0, 200) + "...");
      console.log("Total extracted text length:", extractedText.length);
    } else {
      console.log("Warning: No text was extracted from the response");
      extractedText = JSON.stringify(data, null, 2); // フォールバック
    }
    
    // 元のレスポンス全体も含めて返す
    console.log("Sending successful response back to client");
    return NextResponse.json({
      answer: extractedText,
      originalResponse: data
    });
    
  } catch (error) {
    console.error("API Route Error in extract:", error);
    return NextResponse.json({ 
      error: `Internal server error: ${error instanceof Error ? error.message : String(error)}` 
    }, { status: 500 });
  }
}
