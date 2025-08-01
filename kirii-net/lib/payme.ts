export class PayMeService {
  private apiKey: string;
  private secretKey: string;

  constructor() {
    this.apiKey = process.env.PAYME_API_KEY!;
    this.secretKey = process.env.PAYME_SECRET_KEY!;
  }

  async createPayment(data: {
    amount: number;
    currency: string;
    reference: string;
    description: string;
    customerPhone?: string;
  }) {
    try {
      const response = await fetch('/api/payme/create-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      });

      return await response.json();
    } catch (error) {
      console.error('PayMe決済作成エラー:', error);
      throw error;
    }
  }

  async checkPaymentStatus(paymentId: string) {
    try {
      const response = await fetch(`/api/payme/payment-status/${paymentId}`);
      return await response.json();
    } catch (error) {
      console.error('PayMe決済状況確認エラー:', error);
      throw error;
    }
  }
} 