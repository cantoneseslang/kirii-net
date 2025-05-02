import { NextResponse } from "next/server"

// Stripeのインポートを動的に行う
// これによりビルド時のエラーを回避
const getStripe = async () => {
  try {
    const Stripe = (await import("stripe")).default
    const apiKey = process.env.STRIPE_SECRET_KEY

    if (!apiKey) {
      throw new Error("STRIPE_SECRET_KEY is not set")
    }

    return new Stripe(apiKey, {
      apiVersion: "2023-10-16",
    })
  } catch (error) {
    console.error("Failed to initialize Stripe:", error)
    return null
  }
}

export async function POST(req: Request) {
  try {
    // リクエスト処理時にStripeを初期化
    const stripe = await getStripe()

    // Stripeが初期化されていない場合はエラーレスポンスを返す
    if (!stripe) {
      return NextResponse.json(
        { error: "Stripe is not configured. Please set the STRIPE_SECRET_KEY environment variable." },
        { status: 500 },
      )
    }

    const body = await req.json()
    const { items, customerInfo } = body

    // 從訂單項目創建Stripe的line_items
    const lineItems = items.map((item: any) => ({
      price_data: {
        currency: "hkd",
        product_data: {
          name: item.title,
          description: item.description || "",
        },
        unit_amount: item.price, // 港幣，無小數點
      },
      quantity: item.quantity,
    }))

    // 創建Stripe結帳會話
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/checkout/cancel`,
      customer_email: customerInfo?.email,
      shipping_address_collection: {
        allowed_countries: ["HK"],
      },
      shipping_options: [
        {
          shipping_rate_data: {
            type: "fixed_amount",
            fixed_amount: {
              amount: 0, // 免運費
              currency: "hkd",
            },
            display_name: "標準配送",
            delivery_estimate: {
              minimum: {
                unit: "business_day",
                value: 3,
              },
              maximum: {
                unit: "business_day",
                value: 5,
              },
            },
          },
        },
      ],
      metadata: {
        // 保存訂單信息的元數據
        orderId: `order-${Date.now()}`,
      },
    })

    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.error("Checkout error:", error)
    return NextResponse.json({ error: "結帳過程中發生錯誤。" }, { status: 500 })
  }
}
