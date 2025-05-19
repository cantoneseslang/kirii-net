import { NextRequest, NextResponse } from 'next/server';

// ファイルIDごとに解析完了フラグを保存（本番はDB推奨）
const completedFiles = new Set<string>();
let lastWebhookData: any = null;

// 詳細なデバッグ出力を追加
console.log('Webhook API Route loaded');

export async function POST(request: NextRequest) {
  console.log("Dify Webhook: POST request received");
  
  try {
    // リクエストヘッダーを確認
    console.log("Request headers:", Object.fromEntries(request.headers.entries()));
    
    const contentType = request.headers.get('content-type');
    console.log(`Request content-type: ${contentType}`);
    
    const data = await request.json();
    console.log("Dify Webhook 受信データ:", JSON.stringify(data, null, 2));
    
    // 新しいDify APIのレスポンス構造に対応
    let markdown = '';
    let fileId = data.fileId || data.file_id || data.id;
    
    // Difyの新しいレスポンス形式の処理
    if (data.json && Array.isArray(data.json) && data.json.length > 0) {
      const docResult = data.json[0];
      console.log("JSON配列形式を検出。最初の要素のキー:", Object.keys(docResult));
      
      // ページオブジェクトの型を定義
      interface PageObject {
        markdown?: string;
        dimensions?: any;
        images?: any[];
        index?: number;
      }
      
      // pages配列からmarkdownを連結
      if (docResult.pages && Array.isArray(docResult.pages)) {
        console.log(`${docResult.pages.length}ページを検出`);
        
        markdown = docResult.pages
          .filter((page: PageObject) => page && typeof page.markdown === 'string')
          .map((page: PageObject) => page.markdown || '')
          .join('\n\n');
        
        console.log("ページから抽出されたmarkdown (サンプル):", markdown.substring(0, 200) + "...");
        console.log("抽出されたmarkdownの合計長:", markdown.length);
      } else {
        console.log("pages配列が見つかりません");
      }
      
      // usage_infoからファイルサイズなどの情報を取得
      if (docResult.usage_info) {
        console.log("ファイル処理情報:", docResult.usage_info);
      }
      
      // document_annotationが存在する場合はそこからIDを取得
      if (docResult.document_annotation && docResult.document_annotation.id) {
        fileId = docResult.document_annotation.id;
        console.log("document_annotationからfileId取得:", fileId);
      }
    } else {
      // 従来の形式に対応
      console.log("従来の形式のレスポンスを処理");
      markdown = data.markdown || data.content || '';
      console.log("従来形式から抽出されたmarkdown長:", markdown.length);
    }
    
    // 正規表現で必要な情報を抽出
    const jobMatch = markdown.match(/Job\s*[:：]\s*(.+)/i);
    const dateMatch = markdown.match(/Date\s*[:：]\s*([\d\/-]+)/i);
    const sectionMatch = markdown.match(/Section Properties\s*[:：]?\s*([\s\S]*?)(?:\n\S|$)/i);
    
    // 必要に応じて他の項目も追加可能
    const job = jobMatch ? jobMatch[1].trim() : null;
    const date = dateMatch ? dateMatch[1].trim() : null;
    const sectionProperties = sectionMatch ? sectionMatch[1].trim() : null;
    
    console.log("抽出情報:", {
      fileId,
      job,
      date,
      "sectionPropertiesの有無": sectionProperties ? 'あり' : 'なし'
    });
    
    // file-upload-parserから送信されたリクエストにfileIdがある場合
    const requestFileId = request.headers.get('x-file-id');
    if (requestFileId) {
      fileId = requestFileId;
      console.log("ヘッダーから取得したfileId:", fileId);
    }
    
    if (fileId) {
      completedFiles.add(fileId);
      console.log(`ファイルID: ${fileId} の処理を完了としてマーク`);
    } else {
      console.log("警告: fileIdが見つかりませんでした");
      // fileIdがなくても処理を続行 - エラーにはしない
      // POSTリクエストボディに直接file_idを設定（テスト用）
      const randomId = `gen_${Date.now()}`;
      completedFiles.add(randomId);
      fileId = randomId;
      console.log(`生成されたファイルID: ${fileId}`);
    }
    
    // 抽出結果をlastWebhookDataに保存
    lastWebhookData = {
      fileId,
      markdown,
      job,
      date,
      sectionProperties,
      raw: data,
      timestamp: Date.now()
    };
    
    console.log("Webhook処理成功");
    return NextResponse.json({ 
      status: "ok",
      message: "Webhook data processed successfully",
      fileId
    });
  } catch (error) {
    console.error("Webhook受信エラー:", error);
    return NextResponse.json({ 
      error: "Invalid payload",
      message: error instanceof Error ? error.message : "Unknown error" 
    }, { status: 400 });
  }
}

// GET: ?fileId=xxx で完了状態を返す
export async function GET(request: NextRequest) {
  console.log("Dify Webhook: GET request received");
  
  const { searchParams } = new URL(request.url);
  const fileId = searchParams.get("fileId");
  
  if (fileId) {
    console.log(`指定されたfileId: ${fileId} の完了状態をチェック`);
    const isCompleted = completedFiles.has(fileId);
    console.log(`ファイルの完了状態: ${isCompleted ? "完了" : "未完了"}`);
    
    return NextResponse.json({ 
      completed: isCompleted,
      fileId,
      // 最後のデータが同じfileIdのものであれば、それも返す
      ...(lastWebhookData && lastWebhookData.fileId === fileId ? { data: lastWebhookData } : {})
    });
  }
  
  // fileId指定なしの場合は最新データを返す（従来通り）
  console.log("fileId指定なし - 最新データを返します");
  if (lastWebhookData) {
    console.log(`最新データのfileId: ${lastWebhookData.fileId}, タイムスタンプ: ${new Date(lastWebhookData.timestamp).toISOString()}`);
  } else {
    console.log("最新データはまだありません");
  }
  
  return NextResponse.json(lastWebhookData || { 
    status: "no_data", 
    message: "No webhook data has been received yet" 
  });
}
