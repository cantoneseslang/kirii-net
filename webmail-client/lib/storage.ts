import { EmailAccount } from './email-service'

// メモリ内ストレージ（本来はデータベースを使用）
class MemoryStorage {
  private accounts: EmailAccount[] = []

  // アカウント管理
  getAccounts(): EmailAccount[] {
    return [...this.accounts]
  }

  getAccount(id: string): EmailAccount | undefined {
    return this.accounts.find(account => account.id === id)
  }

  addAccount(account: EmailAccount): void {
    try {
      // バリデーション
      if (!account.id || !account.email || !account.name) {
        throw new Error('必須項目が不足しています')
      }

      const existingIndex = this.accounts.findIndex(a => a.id === account.id)
      if (existingIndex >= 0) {
        this.accounts[existingIndex] = account
        console.log(`Account updated: ${account.email}`)
      } else {
        this.accounts.push(account)
        console.log(`Account added: ${account.email}`)
      }
    } catch (error) {
      console.error('Add account error:', error)
      throw error
    }
  }

  removeAccount(id: string): boolean {
    const index = this.accounts.findIndex(account => account.id === id)
    if (index >= 0) {
      this.accounts.splice(index, 1)
      return true
    }
    return false
  }

  // デモ用のサンプルアカウントを追加
  initializeSampleAccounts(): void {
    if (this.accounts.length === 0) {
      // サンプルアカウント（実際の認証情報は含まない）
      const sampleAccount: EmailAccount = {
        id: 'demo-account',
        name: 'デモアカウント',
        email: 'demo@example.com',
        type: 'imap',
        incomingServer: {
          host: 'imap.example.com',
          port: 993,
          secure: true,
          auth: {
            user: 'demo@example.com',
            pass: 'password'
          }
        },
        outgoingServer: {
          host: 'smtp.example.com',
          port: 587,
          secure: false,
          auth: {
            user: 'demo@example.com',
            pass: 'password'
          }
        }
      }
      
      this.accounts.push(sampleAccount)
    }
  }
}

// シングルトンインスタンス
export const storage = new MemoryStorage()

// 初期化
storage.initializeSampleAccounts()