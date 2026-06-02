import { NextResponse } from 'next/server'
import { DRINKS } from '../../../data/menu-schedule'
import { getEffectiveMenus } from '@/lib/menu-source'

/**
 * CRITICAL MENU UPDATE GUARD (DO NOT CHANGE LIGHTLY)
 *
 * Priority: Highest
 * - Weekday/date must be calculated in Hong Kong timezone.
 * - Wrong timezone can cause wrong weekday menu and "menu not updated" incidents.
 */
const HK_TIMEZONE = 'Asia/Hong_Kong'

function getHkDateAndWeekday(): { date: string; weekday: string } {
  const now = new Date()
  const date = new Intl.DateTimeFormat('en-CA', {
    timeZone: HK_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(now)
  const weekday = now.toLocaleDateString('zh-HK', { weekday: 'long', timeZone: HK_TIMEZONE })
  return { date, weekday }
}

export async function GET() {
  try {
    // 今日の曜日を取得
    const { date: hkDate, weekday: today } = getHkDateAndWeekday()
    
    // 現在のメニューを取得
    // ⚠️ 重要: data/menu-schedule.ts の CURRENT_MENU のみを参照
    // ファイルが見つからない場合、またはメニューが空の場合はエラーが投げられる
    const menus = await getEffectiveMenus()
    
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
        date: hkDate,
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