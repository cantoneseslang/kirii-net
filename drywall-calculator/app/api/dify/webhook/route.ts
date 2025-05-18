import { NextRequest, NextResponse } from 'next/server';

let lastWebhookData: any = null; // メモリ保存（本番はDB推奨）

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    console.log("Dify Webhook 受信データ:", data);
    lastWebhookData = data; // データを保存
    return NextResponse.json({ status: "ok" });
  } catch (error) {
    console.error("Webhook受信エラー:", error);
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }
}

// Webhookで受信した最新データを取得するGETエンドポイント
export async function GET() {
  return NextResponse.json(lastWebhookData || {});
} 