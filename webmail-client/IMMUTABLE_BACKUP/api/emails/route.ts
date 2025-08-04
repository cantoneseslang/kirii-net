import { NextRequest, NextResponse } from 'next/server'
import { EmailService } from '@/lib/email-service'
import { storage } from '@/lib/storage'

export async function GET(request: NextRequest) {
  try {
    // クエリパラメータを取得
    const { searchParams } = new URL(request.url)
    const accountId = searchParams.get('accountId')
    const maxResults = parseInt(searchParams.get('maxResults') || '50')

    // アカウントIDが指定されていない場合は、最初のアカウントを使用
    let account = null
    if (accountId) {
      account = storage.getAccount(accountId)
    } else {
      const accounts = storage.getAccounts()
      account = accounts[0] // 最初のアカウントを使用
    }

    if (!account) {
      return NextResponse.json({ error: 'アカウントが見つかりません' }, { status: 404 })
    }

    // 実際のメールサーバーからメールを取得
    const emailService = new EmailService(account)
    
    try {
      let emails
      
      if (account.type === 'imap') {
        emails = await emailService.fetchEmailsIMAP('INBOX', maxResults)
      } else if (account.type === 'pop3') {
        emails = await emailService.fetchEmailsPOP3(maxResults)
      } else {
        return NextResponse.json({ error: 'サポートされていないアカウントタイプです' }, { status: 400 })
      }
      
      return NextResponse.json({ emails })
    } catch (emailError) {
      console.error('Email fetch from server failed:', emailError)
      
      // メールサーバー接続に失敗した場合、デモデータを返す
      const sampleEmails = [
        {
          id: '1',
          messageId: '<sample1@example.com>',
          from: { name: 'サンプル送信者', email: 'sample@example.com' },
          to: [{ name: 'あなた', email: account.email }],
          subject: 'メールサーバー接続エラー - デモモード',
          textBody: 'メールサーバーに接続できませんでした。アカウント設定を確認してください。これはデモメールです。',
          htmlBody: '<p>メールサーバーに接続できませんでした。アカウント設定を確認してください。これはデモメールです。</p>',
          date: new Date(),
          read: false,
          starred: false,
          attachments: []
        }
      ]
      
      return NextResponse.json({ 
        emails: sampleEmails,
        warning: 'メールサーバーに接続できませんでした。デモデータを表示しています。'
      })
    }
  } catch (error) {
    console.error('Email fetch error:', error)
    return NextResponse.json(
      { error: 'メールの取得に失敗しました' },
      { status: 500 }
    )
  }
} 