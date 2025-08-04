import { NextRequest, NextResponse } from 'next/server'
import { EmailAccount } from '@/lib/email-service'
import { storage } from '@/lib/storage'

export async function GET() {
  try {
    const accounts = storage.getAccounts()
    return NextResponse.json({ accounts })
  } catch (error) {
    console.error('Get accounts error:', error)
    return NextResponse.json(
      { error: 'アカウントの取得に失敗しました' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const account: EmailAccount = await request.json()
    
    // バリデーション
    if (!account.name || !account.email || !account.incomingServer?.host || !account.outgoingServer?.host) {
      return NextResponse.json(
        { error: '必須項目が不足しています' },
        { status: 400 }
      )
    }

    // 重複チェック
    const existingAccounts = storage.getAccounts()
    const existingAccount = existingAccounts.find(a => a.email === account.email)
    if (existingAccount) {
      return NextResponse.json(
        { error: 'このメールアドレスは既に登録されています' },
        { status: 409 }
      )
    }

    storage.addAccount(account)
    
    return NextResponse.json({ 
      message: 'アカウントが追加されました',
      account 
    })
  } catch (error) {
    console.error('Add account error:', error)
    return NextResponse.json(
      { error: 'アカウントの追加に失敗しました' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const account: EmailAccount = await request.json()
    
    const existingAccount = storage.getAccount(account.id)
    if (!existingAccount) {
      return NextResponse.json(
        { error: 'アカウントが見つかりません' },
        { status: 404 }
      )
    }

    storage.addAccount(account) // addAccountは既存アカウントの場合は更新する
    
    return NextResponse.json({ 
      message: 'アカウントが更新されました',
      account 
    })
  } catch (error) {
    console.error('Update account error:', error)
    return NextResponse.json(
      { error: 'アカウントの更新に失敗しました' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const accountId = searchParams.get('id')
    
    if (!accountId) {
      return NextResponse.json(
        { error: 'アカウントIDが必要です' },
        { status: 400 }
      )
    }

    const success = storage.removeAccount(accountId)
    if (!success) {
      return NextResponse.json(
        { error: 'アカウントが見つかりません' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({ 
      message: 'アカウントが削除されました' 
    })
  } catch (error) {
    console.error('Delete account error:', error)
    return NextResponse.json(
      { error: 'アカウントの削除に失敗しました' },
      { status: 500 }
    )
  }
}