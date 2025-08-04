import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { GmailService } from '@/lib/gmail'
import { supabaseAdmin } from '@/lib/supabase'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession()
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 })
    }

    const { action, value } = await request.json()
    
    if (!action) {
      return NextResponse.json({ error: 'アクションが必要です' }, { status: 400 })
    }

    // Supabaseからユーザーのトークンを取得
    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'データベース接続エラー' }, { status: 500 })
    }

    const { data: user, error } = await supabaseAdmin
      .from('users')
      .select('access_token, refresh_token')
      .eq('email', session.user.email)
      .single()

    if (error || !user?.access_token) {
      return NextResponse.json({ error: 'ユーザートークンが見つかりません' }, { status: 404 })
    }

    const gmailService = new GmailService(user.access_token, user.refresh_token)
    let result

    switch (action) {
      case 'star':
        result = await gmailService.toggleStar(params.id, value)
        break
      case 'read':
        result = await gmailService.markAsRead(params.id, value)
        break
      case 'archive':
        result = await gmailService.archiveEmail(params.id)
        break
      default:
        return NextResponse.json({ error: '無効なアクションです' }, { status: 400 })
    }

    return NextResponse.json({ 
      message: 'メールが更新されました',
      result 
    })
  } catch (error) {
    console.error('Email update error:', error)
    return NextResponse.json(
      { error: 'メールの更新に失敗しました' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession()
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 })
    }

    // Supabaseからユーザーのトークンを取得
    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'データベース接続エラー' }, { status: 500 })
    }

    const { data: user, error } = await supabaseAdmin
      .from('users')
      .select('access_token, refresh_token')
      .eq('email', session.user.email)
      .single()

    if (error || !user?.access_token) {
      return NextResponse.json({ error: 'ユーザートークンが見つかりません' }, { status: 404 })
    }

    const gmailService = new GmailService(user.access_token, user.refresh_token)
    const result = await gmailService.deleteEmail(params.id)

    return NextResponse.json({ 
      message: 'メールが削除されました',
      result 
    })
  } catch (error) {
    console.error('Email delete error:', error)
    return NextResponse.json(
      { error: 'メールの削除に失敗しました' },
      { status: 500 }
    )
  }
} 