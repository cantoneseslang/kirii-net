import { NextRequest, NextResponse } from 'next/server';

// Dify API credentials - 正しい値に更新
const DIFY_API_KEY = "app-yXT2ARodfzwNJnLEMb3zVILQ"; // 元々のAPIキー
const WORKFLOW_ID = "JZ7hOWH3CbN26zBo"; // ワークフローID
const API_BASE_URL = "https://api.dify.ai";
// ワークフローAPIエンドポイント
const DIFY_ENDPOINT = `${API_BASE_URL}/v1/workflows/${WORKFLOW_ID}/run`;

export async function POST(request: NextRequest) {
  try {
    // Parse the JSON request body
    const requestData = await request.json();
    const { fileObject, query, pages } = requestData;
    
    if (!fileObject) {
      return NextResponse.json({ error: "File object is required" }, { status: 400 });
    }
    
    console.log(`API Route: Processing extract request for file: ${fileObject.filename}`);
    console.log(`API Query: ${query}`);
    
    // Generate a unique user ID for this request
    const userId = `user_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    console.log(`Generated user ID: ${userId}`);
    
    // DifyのワークフローUIと同じ形式でリクエストを作成
    const requestBody = {
      inputs: {
        file_path: fileObject, // ファイル情報オブジェクトをそのまま渡す
        ...(pages ? { pages } : {}),
        sys_query: query || "Please extract all numerical values and item names required for calculation from this file"
      },
      response_mode: "blocking",
      user: userId
    };
    
    console.log(`Request body to Dify: ${JSON.stringify(requestBody)}`);
    
    // Forward the request to Dify API chat-messages endpoint
    console.log(`Sending request to Dify API: ${DIFY_ENDPOINT}`);
    const response = await fetch(DIFY_ENDPOINT, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${DIFY_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });
    
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
    console.log("API Response:", data);
    
    // Difyワークフローのレスポンスを処理
    let extractedText = "";
    
    // ワークフローAPIの応答形式を処理
    if (data.outputs && data.outputs.answer) {
      extractedText = data.outputs.answer;
    } else if (data.answer) {
      extractedText = data.answer;
    } else if (data.response) {
      extractedText = data.response;
    } else if (data.output) {
      extractedText = data.output;
    } else if (data.result) {
      extractedText = data.result;
    } else if (data.text) {
      extractedText = data.text;
    } else {
      // 構造を解析できない場合はJSON文字列を返す
      extractedText = JSON.stringify(data, null, 2);
    }
    
    console.log("Extracted text:", extractedText.substring(0, 200) + "...");
    
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
