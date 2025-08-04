import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { GmailService } from '@/lib/gmail'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(
  request: NextRequest,
  { params }: { params: { messageId: string; attachmentId: string } }
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
    const attachmentData = await gmailService.downloadAttachment(
      params.messageId,
      params.attachmentId
    )

    // Base64データをバイナリに変換
    const buffer = Buffer.from(attachmentData, 'base64')

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/octet-stream',
        'Content-Disposition': 'attachment',
      },
    })
  } catch (error) {
    console.error('Attachment download error:', error)
    return NextResponse.json(
      { error: '添付ファイルのダウンロードに失敗しました' },
      { status: 500 }
    )
  }
} 