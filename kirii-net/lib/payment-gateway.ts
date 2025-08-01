import { PayMeService } from './payme';

export class PaymentGateway {
  private paymeService: PayMeService;

  constructor() {
    this.paymeService = new PayMeService();
  }

  async processPayment(method: 'stripe' | 'payme', orderData: any) {
    switch (method) {
      case 'stripe':
        // 既存のStripe決済処理
        return await this.processStripePayment(orderData);
      
      case 'payme':
        return await this.paymeService.createPayment({
          amount: orderData.totalAmount,
          currency: 'HKD',
          reference: orderData.orderId,
          description: `KIRII商品配送 - ${orderData.orderId}`,
          customerPhone: orderData.customerPhone
        });
      
      default:
        throw new Error('不支援的付款方式');
    }
  }

  private async processStripePayment(orderData: any) {
    // 既存のStripe決済処理をここに実装
    // 現在のcheckout/route.tsの処理を移行
    return { success: true, method: 'stripe' };
  }
} 