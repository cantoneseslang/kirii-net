import { NextRequest, NextResponse } from 'next/server'
import { EmailService } from '@/lib/email-service'
import { storage } from '@/lib/storage'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { accountId, to, cc = [], bcc = [], subject, body: emailBody, files = [] } = body

    if (!accountId) {
      return NextResponse.json({ error: 'アカウントIDが必要です' }, { status: 400 })
    }

    if (!to || !Array.isArray(to) || to.length === 0) {
      return NextResponse.json({ error: '宛先が必要です' }, { status: 400 })
    }

    if (!subject || !emailBody) {
      return NextResponse.json({ error: '件名と本文が必要です' }, { status: 400 })
    }

    // アカウント情報を取得
    const account = storage.getAccount(accountId)
    if (!account) {
      return NextResponse.json({ error: 'アカウントが見つかりません' }, { status: 404 })
    }

    const emailService = new EmailService(account)
    
    try {
      // 添付ファイルの処理
      const attachments = files.map((file: any) => ({
        filename: file.name,
        content: Buffer.from(file.data, 'base64'),
        contentType: file.type,
      }))

      await emailService.sendEmail({
        to,
        cc,
        bcc,
        subject,
        text: emailBody,
        html: emailBody.replace(/\n/g, '<br>'), // 簡単なHTML変換
        attachments,
      })

      return NextResponse.json({ 
        message: 'メールが送信されました',
        success: true
      })
    } catch (sendError) {
      console.error('Email send failed:', sendError)
      return NextResponse.json(
        { 
          error: 'メールの送信に失敗しました',
          details: sendError instanceof Error ? sendError.message : '不明なエラー'
        },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Email send error:', error)
    return NextResponse.json(
      { error: 'メールの送信に失敗しました' },
      { status: 500 }
    )
  }
} 