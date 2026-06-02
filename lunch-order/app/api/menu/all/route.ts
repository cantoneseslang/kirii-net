import { NextResponse } from 'next/server'
import { DRINKS } from '../../../../data/menu-schedule'
import { getEffectiveMenus } from '@/lib/menu-source'

export async function GET() {
  try {
    const menus = await getEffectiveMenus()
    
    // メニューをそのまま使用
    const allMenus = menus
    
    const response = {
      success: true,
      data: {
        allMenus: allMenus,
        drinks: DRINKS,
        allDrinks: [
          ...DRINKS.hot,
          ...DRINKS.cold,
          ...DRINKS.other
        ]
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