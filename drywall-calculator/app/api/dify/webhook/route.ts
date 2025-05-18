import { NextRequest, NextResponse } from 'next/server';

// ファイルIDごとに解析完了フラグを保存（本番はDB推奨）
const completedFiles = new Set<string>();
let lastWebhookData: any = null;

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    console.log("Dify Webhook 受信データ:", data);
    lastWebhookData = data;
    // fileId（または適切なID）で完了フラグを保存
    const fileId = data.fileId || data.file_id || data.id;
    if (fileId) {
      completedFiles.add(fileId);
    }
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