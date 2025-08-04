import { google } from 'googleapis'
import { OAuth2Client } from 'google-auth-library'

export interface GmailMessage {
  id: string
  threadId: string
  labelIds: string[]
  snippet: string
  payload: {
    headers: Array<{ name: string; value: string }>
    body?: { data?: string; size: number }
    parts?: Array<{
      mimeType: string
      filename?: string
      body?: { data?: string; attachmentId?: string; size: number }
      headers?: Array<{ name: string; value: string }>
    }>
  }
  internalDate: string
}

export interface GmailAttachment {
  filename: string
  mimeType: string
  size: number
  data: string
}

export interface FileUploadResult {
  name: string
  size: number
  type: string
  url: string
  isLargeFile: boolean
  path: string
}

// ファイルサイズ制限
const LARGE_FILE_THRESHOLD = 15 * 1024 * 1024 // 15MB
const MAX_ATTACHMENT_SIZE = 25 * 1024 * 1024 // 25MB

export class GmailService {
  private oauth2Client: OAuth2Client
  private gmail: any

  constructor(accessToken: string, refreshToken: string) {
    this.oauth2Client = new OAuth2Client(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      'http://localhost:3000/api/auth/callback/google'
    )

    this.oauth2Client.setCredentials({
      access_token: accessToken,
      refresh_token: refreshToken,
    })

    this.gmail = google.gmail({ version: 'v1', auth: this.oauth2Client })
  }

  // メール一覧取得
  async getEmails(query: string = '', maxResults: number = 50) {
    try {
      // メッセージIDのリストを取得
      const response = await this.gmail.users.messages.list({
        userId: 'me',
        q: query,
        maxResults,
      })

      if (!response.data.messages) {
        return []
      }

      // 各メッセージの詳細を取得
      const messages = await Promise.all(
        response.data.messages.map(async (message: { id: string }) => {
          const messageDetail = await this.gmail.users.messages.get({
            userId: 'me',
            id: message.id,
            format: 'full',
          })
          return messageDetail.data
        })
      )

      return messages.map(this.formatMessage)
    } catch (error) {
      console.error('Gmail API Error:', error)
      throw new Error('メールの取得に失敗しました')
    }
  }

  // 大きなファイルをクラウドストレージにアップロード
  async uploadLargeFile(file: File): Promise<FileUploadResult> {
    const formData = new FormData()
    formData.append('file', file)

    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'ファイルのアップロードに失敗しました')
    }

    const result = await response.json()
    return result.file
  }

  // ファイルサイズに基づいて添付ファイルを処理
  async processAttachments(files: File[]): Promise<{ attachments: GmailAttachment[], cloudLinks: string[] }> {
    const attachments: GmailAttachment[] = []
    const cloudLinks: string[] = []

    for (const file of files) {
      if (file.size > LARGE_FILE_THRESHOLD) {
        // 大きなファイルはクラウドストレージにアップロード
        try {
          const uploadResult = await this.uploadLargeFile(file)
          cloudLinks.push(`📎 ${file.name} (${this.formatFileSize(file.size)}): ${uploadResult.url}`)
        } catch (error) {
          console.error('Large file upload failed:', error)
          cloudLinks.push(`❌ ${file.name}: アップロードに失敗しました`)
        }
      } else if (file.size <= MAX_ATTACHMENT_SIZE) {
        // 小さなファイルは通常の添付ファイルとして処理
        const base64Data = await this.fileToBase64(file)
        attachments.push({
          filename: file.name,
          mimeType: file.type,
          size: file.size,
          data: base64Data
        })
      } else {
        // 制限を超えるファイルはエラー
        throw new Error(`${file.name} は添付ファイルのサイズ制限（${this.formatFileSize(MAX_ATTACHMENT_SIZE)}）を超えています`)
      }
    }

    return { attachments, cloudLinks }
  }

  // ファイルをBase64に変換
  private async fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => {
        const result = reader.result as string
        // Base64データからプレフィックスを除去
        const base64 = result.split(',')[1]
        resolve(base64)
      }
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
  }

  // ファイルサイズを人間が読みやすい形式に変換
  private formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  // メール送信（大きなファイル対応）
  async sendEmail(to: string[], cc: string[] = [], bcc: string[] = [], subject: string, body: string, files: File[] = []) {
    try {
      // 添付ファイルを処理
      const { attachments, cloudLinks } = await this.processAttachments(files)
      
      // クラウドリンクがある場合は本文に追加
      let finalBody = body
      if (cloudLinks.length > 0) {
        finalBody += '\n\n--- 大きなファイルのリンク ---\n'
        finalBody += cloudLinks.join('\n')
        finalBody += '\n\n※ 大きなファイルはクラウドストレージに保存されています。リンクからダウンロードしてください。'
      }

      const boundary = 'boundary_' + Math.random().toString(36).substr(2, 9)
      let email = [
        'Content-Type: multipart/mixed; boundary="' + boundary + '"',
        'MIME-Version: 1.0',
        'To: ' + to.join(', '),
        cc.length > 0 ? 'Cc: ' + cc.join(', ') : '',
        bcc.length > 0 ? 'Bcc: ' + bcc.join(', ') : '',
        'Subject: ' + subject,
        '',
        '--' + boundary,
        'Content-Type: text/html; charset="UTF-8"',
        'MIME-Version: 1.0',
        'Content-Transfer-Encoding: 7bit',
        '',
        finalBody,
        ''
      ].filter(line => line !== '').join('\n')

      // 添付ファイルを追加
      for (const attachment of attachments) {
        email += [
          '--' + boundary,
          'Content-Type: ' + attachment.mimeType + '; name="' + attachment.filename + '"',
          'MIME-Version: 1.0',
          'Content-Transfer-Encoding: base64',
          'Content-Disposition: attachment; filename="' + attachment.filename + '"',
          '',
          attachment.data,
          ''
        ].join('\n')
      }

      email += '--' + boundary + '--'

      const encodedEmail = Buffer.from(email).toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '')

      const response = await this.gmail.users.messages.send({
        userId: 'me',
        requestBody: {
          raw: encodedEmail,
        },
      })

      return response.data
    } catch (error) {
      console.error('Gmail Send Error:', error)
      throw new Error('メールの送信に失敗しました')
    }
  }

  // 従来のメール送信メソッド（後方互換性のため）
  async sendEmailWithAttachments(to: string[], cc: string[] = [], bcc: string[] = [], subject: string, body: string, attachments: GmailAttachment[] = []) {
    try {
      const boundary = 'boundary_' + Math.random().toString(36).substr(2, 9)
      let email = [
        'Content-Type: multipart/mixed; boundary="' + boundary + '"',
        'MIME-Version: 1.0',
        'To: ' + to.join(', '),
        cc.length > 0 ? 'Cc: ' + cc.join(', ') : '',
        bcc.length > 0 ? 'Bcc: ' + bcc.join(', ') : '',
        'Subject: ' + subject,
        '',
        '--' + boundary,
        'Content-Type: text/html; charset="UTF-8"',
        'MIME-Version: 1.0',
        'Content-Transfer-Encoding: 7bit',
        '',
        body,
        ''
      ].filter(line => line !== '').join('\n')

      // 添付ファイルを追加
      for (const attachment of attachments) {
        email += [
          '--' + boundary,
          'Content-Type: ' + attachment.mimeType + '; name="' + attachment.filename + '"',
          'MIME-Version: 1.0',
          'Content-Transfer-Encoding: base64',
          'Content-Disposition: attachment; filename="' + attachment.filename + '"',
          '',
          attachment.data,
          ''
        ].join('\n')
      }

      email += '--' + boundary + '--'

      const encodedEmail = Buffer.from(email).toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '')

      const response = await this.gmail.users.messages.send({
        userId: 'me',
        requestBody: {
          raw: encodedEmail,
        },
      })

      return response.data
    } catch (error) {
      console.error('Gmail Send Error:', error)
      throw new Error('メールの送信に失敗しました')
    }
  }

  // 添付ファイルダウンロード
  async downloadAttachment(messageId: string, attachmentId: string) {
    try {
      const response = await this.gmail.users.messages.attachments.get({
        userId: 'me',
        messageId,
        id: attachmentId,
      })

      return response.data.data
    } catch (error) {
      console.error('Gmail Attachment Error:', error)
      throw new Error('添付ファイルの取得に失敗しました')
    }
  }

  // メールにスターを付ける/外す
  async toggleStar(messageId: string, starred: boolean) {
    try {
      const response = await this.gmail.users.messages.modify({
        userId: 'me',
        id: messageId,
        requestBody: {
          addLabelIds: starred ? [] : ['STARRED'],
          removeLabelIds: starred ? ['STARRED'] : [],
        },
      })
      return response.data
    } catch (error) {
      console.error('Gmail Star Error:', error)
      throw new Error('スターの更新に失敗しました')
    }
  }

  // メールを既読/未読にする
  async markAsRead(messageId: string, read: boolean) {
    try {
      const response = await this.gmail.users.messages.modify({
        userId: 'me',
        id: messageId,
        requestBody: {
          addLabelIds: read ? [] : ['UNREAD'],
          removeLabelIds: read ? ['UNREAD'] : [],
        },
      })
      return response.data
    } catch (error) {
      console.error('Gmail Read Error:', error)
      throw new Error('既読状態の更新に失敗しました')
    }
  }

  // メールをアーカイブする
  async archiveEmail(messageId: string) {
    try {
      const response = await this.gmail.users.messages.modify({
        userId: 'me',
        id: messageId,
        requestBody: {
          removeLabelIds: ['INBOX'],
        },
      })
      return response.data
    } catch (error) {
      console.error('Gmail Archive Error:', error)
      throw new Error('メールのアーカイブに失敗しました')
    }
  }

  // メールを削除する
  async deleteEmail(messageId: string) {
    try {
      const response = await this.gmail.users.messages.delete({
        userId: 'me',
        id: messageId,
      })
      return response.data
    } catch (error) {
      console.error('Gmail Delete Error:', error)
      throw new Error('メールの削除に失敗しました')
    }
  }

  // メッセージをフォーマット
  private formatMessage(message: GmailMessage) {
    const headers = message.payload.headers
    const getHeader = (name: string) => headers.find(h => h.name.toLowerCase() === name.toLowerCase())?.value || ''

    let body = ''
    let attachments: Array<{
      filename: string
      mimeType: string
      size: number
      attachmentId?: string
    }> = []

    const extractBody = (payload: any): void => {
      if (payload.body?.data) {
        body = Buffer.from(payload.body.data, 'base64').toString('utf-8')
      } else if (payload.parts) {
        for (const part of payload.parts) {
          if (part.mimeType === 'text/plain' || part.mimeType === 'text/html') {
            if (part.body?.data) {
              body = Buffer.from(part.body.data, 'base64').toString('utf-8')
            }
          } else if (part.filename) {
            attachments.push({
              filename: part.filename,
              mimeType: part.mimeType,
              size: part.body?.size || 0,
              attachmentId: part.body?.attachmentId
            })
          }
        }
      }
    }

    const extractAttachments = (payload: any): void => {
      if (payload.parts) {
        for (const part of payload.parts) {
          if (part.filename) {
            attachments.push({
              filename: part.filename,
              mimeType: part.mimeType,
              size: part.body?.size || 0,
              attachmentId: part.body?.attachmentId
            })
          }
          if (part.parts) {
            extractAttachments(part)
          }
        }
      }
    }

    extractBody(message.payload)
    extractAttachments(message.payload)

    return {
      id: message.id,
      threadId: message.threadId,
      from_name: getHeader('from').split('<')[0].trim(),
      from_email: getHeader('from').match(/<(.+)>/) ? getHeader('from').match(/<(.+)>/)[1] : getHeader('from'),
      to_emails: getHeader('to').split(',').map(email => email.trim()),
      cc_emails: getHeader('cc') ? getHeader('cc').split(',').map(email => email.trim()) : [],
      subject: getHeader('subject'),
      body: body,
      message_id: message.id,
      thread_id: message.threadId,
      folder: 'inbox',
      read: !message.labelIds.includes('UNREAD'),
      starred: message.labelIds.includes('STARRED'),
      important: message.labelIds.includes('IMPORTANT'),
      labels: message.labelIds.filter(id => !['INBOX', 'UNREAD', 'STARRED', 'IMPORTANT'].includes(id)),
      attachments,
      created_at: new Date(parseInt(message.internalDate)).toISOString(),
      updated_at: new Date(parseInt(message.internalDate)).toISOString()
    }
  }
} 