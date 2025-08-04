import nodemailer from 'nodemailer'
import { createConnection } from 'node-pop3'
import * as imaps from 'imap-simple'

export interface EmailAccount {
  id: string
  name: string
  email: string
  type: 'pop3' | 'imap'
  
  // 受信サーバー設定
  incomingServer: {
    host: string
    port: number
    secure: boolean // SSL/TLS
    auth: {
      user: string
      pass: string
    }
  }
  
  // 送信サーバー設定
  outgoingServer: {
    host: string
    port: number
    secure: boolean // SSL/TLS
    auth: {
      user: string
      pass: string
    }
  }
}

export interface EmailMessage {
  id: string
  messageId: string
  from: {
    name: string
    email: string
  }
  to: Array<{
    name: string
    email: string
  }>
  cc?: Array<{
    name: string
    email: string
  }>
  bcc?: Array<{
    name: string
    email: string
  }>
  subject: string
  textBody?: string
  htmlBody?: string
  date: Date
  read: boolean
  starred: boolean
  attachments: Array<{
    filename: string
    contentType: string
    size: number
    content?: Buffer
  }>
}

export interface SendEmailOptions {
  to: string[]
  cc?: string[]
  bcc?: string[]
  subject: string
  text?: string
  html?: string
  attachments?: Array<{
    filename: string
    content: Buffer
    contentType: string
  }>
}

export class EmailService {
  private account: EmailAccount

  constructor(account: EmailAccount) {
    this.account = account
  }

  // メール送信
  async sendEmail(options: SendEmailOptions): Promise<void> {
    try {
      const transporter = nodemailer.createTransporter({
        host: this.account.outgoingServer.host,
        port: this.account.outgoingServer.port,
        secure: this.account.outgoingServer.secure,
        auth: {
          user: this.account.outgoingServer.auth.user,
          pass: this.account.outgoingServer.auth.pass,
        },
        connectionTimeout: 10000, // 10秒
        greetingTimeout: 5000,    // 5秒
        socketTimeout: 10000,     // 10秒
      })

      // 接続テスト
      await transporter.verify()

      const mailOptions = {
        from: `"${this.account.name}" <${this.account.email}>`,
        to: options.to.join(', '),
        cc: options.cc?.join(', '),
        bcc: options.bcc?.join(', '),
        subject: options.subject,
        text: options.text,
        html: options.html,
        attachments: options.attachments?.map(att => ({
          filename: att.filename,
          content: att.content,
          contentType: att.contentType,
        })),
      }

      const result = await transporter.sendMail(mailOptions)
      console.log('Email sent successfully:', result.messageId)
    } catch (error) {
      console.error('Email send error:', error)
      if (error instanceof Error) {
        throw new Error(`メール送信エラー: ${error.message}`)
      }
      throw new Error('メール送信に失敗しました')
    }
  }

  // メール受信（POP3）
  async fetchEmailsPOP3(maxCount: number = 50): Promise<EmailMessage[]> {
    if (this.account.type !== 'pop3') {
      throw new Error('このアカウントはPOP3に対応していません')
    }

    return new Promise((resolve, reject) => {
      const client = createConnection({
        host: this.account.incomingServer.host,
        port: this.account.incomingServer.port,
        tls: this.account.incomingServer.secure,
        username: this.account.incomingServer.auth.user,
        password: this.account.incomingServer.auth.pass,
      })

      client.on('error', reject)
      
      client.on('connect', async () => {
        try {
          const count = await client.count()
          const emails: EmailMessage[] = []
          
          const limit = Math.min(count, maxCount)
          
          for (let i = 1; i <= limit; i++) {
            const message = await client.retrieve(i)
            const parsedEmail = this.parseEmailMessage(message, i.toString())
            emails.push(parsedEmail)
          }
          
          client.quit()
          resolve(emails)
        } catch (error) {
          client.quit()
          reject(error)
        }
      })
    })
  }

  // メール受信（IMAP）
  async fetchEmailsIMAP(folder: string = 'INBOX', maxCount: number = 50): Promise<EmailMessage[]> {
    if (this.account.type !== 'imap') {
      throw new Error('このアカウントはIMAPに対応していません')
    }

    const config = {
      imap: {
        user: this.account.incomingServer.auth.user,
        password: this.account.incomingServer.auth.pass,
        host: this.account.incomingServer.host,
        port: this.account.incomingServer.port,
        tls: this.account.incomingServer.secure,
        authTimeout: 3000,
      },
    }

    const connection = await imaps.connect(config)
    
    try {
      await connection.openBox(folder)
      
      const searchCriteria = ['ALL']
      const fetchOptions = {
        bodies: 'HEADER.FIELDS (FROM TO CC BCC SUBJECT DATE MESSAGE-ID)',
        markSeen: false,
        struct: true,
      }

      const messages = await connection.search(searchCriteria, fetchOptions)
      const emails: EmailMessage[] = []

      const limit = Math.min(messages.length, maxCount)
      
      for (let i = 0; i < limit; i++) {
        const message = messages[i]
        const parsedEmail = this.parseIMAPMessage(message)
        emails.push(parsedEmail)
      }

      connection.end()
      return emails
    } catch (error) {
      connection.end()
      throw error
    }
  }

  // メール削除
  async deleteEmail(messageId: string): Promise<void> {
    if (this.account.type === 'imap') {
      const config = {
        imap: {
          user: this.account.incomingServer.auth.user,
          password: this.account.incomingServer.auth.pass,
          host: this.account.incomingServer.host,
          port: this.account.incomingServer.port,
          tls: this.account.incomingServer.secure,
        },
      }

      const connection = await imaps.connect(config)
      
      try {
        await connection.openBox('INBOX')
        await connection.addFlags(messageId, '\\Deleted')
        await connection.expunge()
        connection.end()
      } catch (error) {
        connection.end()
        throw error
      }
    } else {
      throw new Error('POP3では削除操作はサポートされていません')
    }
  }

  // 接続テスト
  async testConnection(): Promise<{ incoming: boolean; outgoing: boolean }> {
    const results = { incoming: false, outgoing: false }

    // 送信サーバーテスト
    try {
      const transporter = nodemailer.createTransporter({
        host: this.account.outgoingServer.host,
        port: this.account.outgoingServer.port,
        secure: this.account.outgoingServer.secure,
        auth: {
          user: this.account.outgoingServer.auth.user,
          pass: this.account.outgoingServer.auth.pass,
        },
      })

      await transporter.verify()
      results.outgoing = true
    } catch (error) {
      console.error('SMTP connection failed:', error)
    }

    // 受信サーバーテスト
    try {
      if (this.account.type === 'imap') {
        const config = {
          imap: {
            user: this.account.incomingServer.auth.user,
            password: this.account.incomingServer.auth.pass,
            host: this.account.incomingServer.host,
            port: this.account.incomingServer.port,
            tls: this.account.incomingServer.secure,
            authTimeout: 3000,
          },
        }

        const connection = await imaps.connect(config)
        connection.end()
        results.incoming = true
      } else {
        // POP3テスト
        await new Promise<void>((resolve, reject) => {
          const client = createConnection({
            host: this.account.incomingServer.host,
            port: this.account.incomingServer.port,
            tls: this.account.incomingServer.secure,
            username: this.account.incomingServer.auth.user,
            password: this.account.incomingServer.auth.pass,
          })

          client.on('error', reject)
          client.on('connect', () => {
            client.quit()
            resolve()
          })
        })
        results.incoming = true
      }
    } catch (error) {
      console.error('Incoming server connection failed:', error)
    }

    return results
  }

  // POP3メッセージの解析
  private parseEmailMessage(rawMessage: string, id: string): EmailMessage {
    const lines = rawMessage.split('\n')
    const headers: Record<string, string> = {}
    let bodyStart = 0

    // ヘッダーの解析
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim()
      if (line === '') {
        bodyStart = i + 1
        break
      }
      
      const colonIndex = line.indexOf(':')
      if (colonIndex > 0) {
        const key = line.substring(0, colonIndex).toLowerCase()
        const value = line.substring(colonIndex + 1).trim()
        headers[key] = value
      }
    }

    const body = lines.slice(bodyStart).join('\n')

    return {
      id,
      messageId: headers['message-id'] || id,
      from: this.parseEmailAddress(headers['from'] || ''),
      to: this.parseEmailAddresses(headers['to'] || ''),
      cc: headers['cc'] ? this.parseEmailAddresses(headers['cc']) : undefined,
      subject: headers['subject'] || '(件名なし)',
      textBody: body,
      date: new Date(headers['date'] || Date.now()),
      read: false,
      starred: false,
      attachments: [], // TODO: 添付ファイルの解析を実装
    }
  }

  // IMAPメッセージの解析
  private parseIMAPMessage(message: any): EmailMessage {
    const headers = message.parts[0].body
    
    return {
      id: message.attributes.uid.toString(),
      messageId: headers['message-id']?.[0] || message.attributes.uid.toString(),
      from: this.parseEmailAddress(headers['from']?.[0] || ''),
      to: this.parseEmailAddresses(headers['to']?.[0] || ''),
      cc: headers['cc'] ? this.parseEmailAddresses(headers['cc'][0]) : undefined,
      subject: headers['subject']?.[0] || '(件名なし)',
      textBody: '', // TODO: 本文の取得を実装
      date: new Date(headers['date']?.[0] || Date.now()),
      read: !message.attributes.flags.includes('\\Seen'),
      starred: message.attributes.flags.includes('\\Flagged'),
      attachments: [], // TODO: 添付ファイルの解析を実装
    }
  }

  // メールアドレスの解析
  private parseEmailAddress(addressString: string): { name: string; email: string } {
    const match = addressString.match(/^(.+?)\s*<(.+)>$/)
    if (match) {
      return {
        name: match[1].replace(/"/g, '').trim(),
        email: match[2].trim(),
      }
    }
    
    return {
      name: addressString.trim(),
      email: addressString.trim(),
    }
  }

  // 複数メールアドレスの解析
  private parseEmailAddresses(addressString: string): Array<{ name: string; email: string }> {
    return addressString
      .split(',')
      .map(addr => this.parseEmailAddress(addr.trim()))
      .filter(addr => addr.email)
  }
}

// よく使用されるメールプロバイダーの設定テンプレート
export const EMAIL_PROVIDERS = {
  gmail: {
    name: 'Gmail',
    incoming: {
      imap: { host: 'imap.gmail.com', port: 993, secure: true },
      pop3: { host: 'pop.gmail.com', port: 995, secure: true },
    },
    outgoing: { host: 'smtp.gmail.com', port: 587, secure: false },
  },
  outlook: {
    name: 'Outlook/Hotmail',
    incoming: {
      imap: { host: 'outlook.office365.com', port: 993, secure: true },
      pop3: { host: 'outlook.office365.com', port: 995, secure: true },
    },
    outgoing: { host: 'smtp-mail.outlook.com', port: 587, secure: false },
  },
  yahoo: {
    name: 'Yahoo Mail',
    incoming: {
      imap: { host: 'imap.mail.yahoo.com', port: 993, secure: true },
      pop3: { host: 'pop.mail.yahoo.com', port: 995, secure: true },
    },
    outgoing: { host: 'smtp.mail.yahoo.com', port: 587, secure: false },
  },
} as const