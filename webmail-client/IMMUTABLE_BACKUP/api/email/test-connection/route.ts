import { NextRequest, NextResponse } from 'next/server'
import { EmailService, EmailAccount } from '@/lib/email-service'

export async function POST(request: NextRequest) {
  try {
    const accountData: Partial<EmailAccount> = await request.json()
    
    // 必須項目チェック
    if (!accountData.incomingServer?.host || !accountData.outgoingServer?.host) {
      return NextResponse.json(
        { error: 'サーバー情報が不足しています' },
        { status: 400 }
      )
    }

    // テスト用の完全なアカウントオブジェクトを作成
    const testAccount: EmailAccount = {
      id: 'test',
      name: accountData.name || 'Test Account',
      email: accountData.email || 'test@example.com',
      type: accountData.type || 'imap',
      incomingServer: {
        host: accountData.incomingServer.host,
        port: accountData.incomingServer.port || (accountData.type === 'pop3' ? 995 : 993),
        secure: accountData.incomingServer.secure ?? true,
        auth: {
          user: accountData.incomingServer.auth?.user || '',
          pass: accountData.incomingServer.auth?.pass || '',
        },
      },
      outgoingServer: {
        host: accountData.outgoingServer.host,
        port: accountData.outgoingServer.port || 587,
        secure: accountData.outgoingServer.secure ?? false,
        auth: {
          user: accountData.outgoingServer.auth?.user || '',
          pass: accountData.outgoingServer.auth?.pass || '',
        },
      },
    }

    const emailService = new EmailService(testAccount)
    const result = await emailService.testConnection()
    
    return NextResponse.json(result)
  } catch (error) {
    console.error('Connection test error:', error)
    return NextResponse.json(
      { error: '接続テストに失敗しました' },
      { status: 500 }
    )
  }
}