import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { paymentId: string } }
) {
  try {
    const { paymentId } = params;

    // PayMe APIの実際の実装はここに追加
    // 現在はモックレスポンスを返す
    const mockStatusResponse = {
      success: true,
      paymentId,
      status: 'completed', // 'pending', 'completed', 'failed'
      amount: 1000,
      currency: 'HKD',
      completedAt: new Date().toISOString()
    };

    return NextResponse.json(mockStatusResponse);
  } catch (error) {
    console.error('PayMe決済状況確認エラー:', error);
    return NextResponse.json(
      { error: '決済状況確認に失敗しました' },
      { status: 500 }
    );
  }
} 