import { NextRequest, NextResponse } from 'next/server';

// Dify API credentials - 正しい値に更新
const DIFY_API_KEY = "app-yXT2ARodfzwNJnLEMb3zVILQ"; // 元々のAPIキー
const WORKFLOW_ID = "JZ7hOWH3CbN26zBo"; // ワークフローID
const API_BASE_URL = "https://api.dify.ai";
// ワークフローAPIエンドポイント
const DIFY_ENDPOINT = `${API_BASE_URL}/v1/workflows/${WORKFLOW_ID}/run`;

// ファイルID→テキスト変換用のメモリキャッシュ
interface WebhookData {
  markdown: string;
  raw: any;
  fileId: string;
  timestamp: number;
}
const webhookCache = new Map<string, WebhookData>();

export async function POST(request: NextRequest) {
  try {
    // Parse the JSON request body
    const requestData = await request.json();
    const { fileObject, query, pages } = requestData;
    
    if (!fileObject) {
      return NextResponse.json({ error: "File object is required" }, { status: 400 });
    }
    
    console.log(`API Route: Processing extract request for file: ${fileObject.filename || fileObject.name || 'unknown'}`);
    console.log(`File ID: ${fileObject.id}`);
    console.log(`API Query: ${query}`);
    
    // まずwebhookから得られたデータがあるか確認（Dify APIスキップのためのショートカット）
    if (fileObject.id) {
      try {
        // webhook APIから直接データを取得
        const webhookResponse = await fetch(`/api/dify/webhook?fileId=${fileObject.id}`);
        if (webhookResponse.ok) {
          const webhookData = await webhookResponse.json();
          console.log("Retrieved data from webhook cache:", Object.keys(webhookData));
          
          // webhookがすでに該当ファイルのデータを持っている場合
          if (webhookData.markdown && webhookData.fileId === fileObject.id) {
            console.log("Using data from webhook cache instead of calling Dify API");
            return NextResponse.json({
              answer: webhookData.markdown,
              originalResponse: webhookData.raw || webhookData
            });
          } else {
            console.log("Webhook data doesn't contain necessary information, proceeding to API call");
          }
        } else {
          console.log(`Webhook API returned status ${webhookResponse.status}, proceeding to API call`);
        }
      } catch (webhookError) {
        console.error("Error fetching from webhook endpoint:", webhookError);
        // エラーを無視して続行
      }
    }
    
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
    
    console.log(`Request body to Dify: ${JSON.stringify(requestBody, null, 2)}`);
    
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
    console.log("API Response structure:", Object.keys(data));
    
    // Difyワークフローのレスポンスを処理
    let extractedText = "";
    
    // 新しいレスポンス形式の処理（webhookと同じ形式）
    if (data.json && Array.isArray(data.json) && data.json.length > 0) {
      const docResult = data.json[0];
      
      // ページオブジェクトの型を定義
      interface PageObject {
        markdown?: string;
        dimensions?: any;
        images?: any[];
        index?: number;
      }
      
      // pages配列からmarkdownを連結
      if (docResult.pages && Array.isArray(docResult.pages)) {
        extractedText = docResult.pages.map((page: PageObject) => page.markdown || '').join('\n\n');
        console.log("ページから抽出されたmarkdown:", extractedText.substring(0, 200) + "...");
      }
    } else {
      // 従来のワークフローAPIの応答形式を処理
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
    }
    
    console.log("Final extracted text:", extractedText.substring(0, 200) + "...");
    
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
