import { NextRequest, NextResponse } from 'next/server';

// ファイルIDごとに解析完了フラグを保存（本番はDB推奨）
const completedFiles = new Set<string>();
let lastWebhookData: any = null;

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    console.log("Dify Webhook 受信データ:", JSON.stringify(data, null, 2));
    
    // 新しいDify APIのレスポンス構造に対応
    let markdown = '';
    let fileId = data.fileId || data.file_id || data.id;
    
    // Difyの新しいレスポンス形式の処理
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
        markdown = docResult.pages.map((page: PageObject) => page.markdown || '').join('\n\n');
        console.log("ページから抽出されたmarkdown:", markdown.substring(0, 200) + "...");
      }
      
      // usage_infoからファイルサイズなどの情報を取得
      if (docResult.usage_info) {
        console.log("ファイル処理情報:", docResult.usage_info);
      }
      
      // document_annotationが存在する場合はそこからIDを取得
      if (docResult.document_annotation && docResult.document_annotation.id) {
        fileId = docResult.document_annotation.id;
      }
    } else {
      // 従来の形式に対応
      markdown = data.markdown || data.content || '';
    }
    
    // 正規表現で必要な情報を抽出
    const jobMatch = markdown.match(/Job\s*[:：]\s*(.+)/i);
    const dateMatch = markdown.match(/Date\s*[:：]\s*([\d\/-]+)/i);
    const sectionMatch = markdown.match(/Section Properties\s*[:：]?\s*([\s\S]*?)(?:\n\S|$)/i);
    
    // 必要に応じて他の項目も追加可能
    const job = jobMatch ? jobMatch[1].trim() : null;
    const date = dateMatch ? dateMatch[1].trim() : null;
    const sectionProperties = sectionMatch ? sectionMatch[1].trim() : null;
    
    console.log("fileId:", fileId);
    console.log("抽出されたjob:", job);
    console.log("抽出されたdate:", date);
    
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
      raw: data
    };
    return NextResponse.json({ status: "ok" });
  } catch (error) {
    console.error("Webhook受信エラー:", error);
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }
}

// GET: ?fileId=xxx で完了状態を返す
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const fileId = searchParams.get("fileId");
  if (fileId) {
    return NextResponse.json({ completed: completedFiles.has(fileId) });
  }
  // fileId指定なしの場合は最新データを返す（従来通り）
  return NextResponse.json(lastWebhookData || {});
}
