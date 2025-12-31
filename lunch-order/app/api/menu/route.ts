import { NextResponse } from 'next/server'
import { getCurrentMenu, DRINKS } from '../../../data/menu-schedule'

export async function GET() {
  try {
    // 今日の曜日を取得
    const today = new Date().toLocaleDateString("zh-HK", { weekday: "long" })
    
    // 現在のメニューを取得
    // ⚠️ 重要: data/menu-schedule.ts の CURRENT_MENU のみを参照
    // ファイルが見つからない場合、またはメニューが空の場合はエラーが投げられる
    const { menus } = getCurrentMenu()
    
    // 今日のメニューが存在しない場合はエラー
    const todayMenu = menus[today as keyof typeof menus]
    if (!todayMenu || todayMenu.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: `❌ CRITICAL ERROR: Menu data for ${today} is not found in data/menu-schedule.ts. ` +
                 "The file data/menu-schedule.ts must exist and contain valid menu data. " +
                 "Do not use any fallback or default menu data."
        },
        {
          status: 500,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          },
        }
      )
    }
    
    // 全ての飲み物をフラット化
    const allDrinks = [
      ...DRINKS.hot,
      ...DRINKS.cold,
      ...DRINKS.other
    ]
    
    const response = {
      success: true,
      data: {
        date: new Date().toISOString().split('T')[0], // YYYY-MM-DD形式
        weekday: today,
        dishes: todayMenu,
        drinks: allDrinks,
        drinksByCategory: DRINKS
      }
    }
    
    return NextResponse.json(response, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    })
  } catch (error) {
    const errorMessage = error instanceof Error 
      ? error.message 
      : "❌ CRITICAL ERROR: Failed to load menu data from data/menu-schedule.ts. " +
        "The file data/menu-schedule.ts must exist and contain valid menu data. " +
        "Do not use any fallback or default menu data."
    
    console.error("Menu API Error:", errorMessage, error)
    
    return NextResponse.json(
      { 
        success: false, 
        error: errorMessage
      },
      { 
        status: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
      }
    )
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  })
} 