import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { amount, currency, reference, description, customerPhone } = body;

    // PayMe APIの実際の実装はここに追加
    // 現在はモックレスポンスを返す
    const mockPaymentResponse = {
      success: true,
      paymentId: `payme_${Date.now()}`,
      qrCodeUrl: `https://payme.hsbc/${reference}`,
      amount,
      currency,
      reference,
      description,
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    return NextResponse.json(mockPaymentResponse);
  } catch (error) {
    console.error('PayMe決済作成エラー:', error);
    return NextResponse.json(
      { error: '決済作成に失敗しました' },
      { status: 500 }
    );
  }
} 