import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'

export interface Email {
  id: string
  threadId: string
  from_name: string
  from_email: string
  to_emails: string[]
  cc_emails: string[]
  subject: string
  body: string
  html_body?: string
  message_id: string
  thread_id: string
  folder: string
  read: boolean
  starred: boolean
  important: boolean
  labels: string[]
  attachments: Array<{
    filename: string
    mimeType: string
    size: number
    attachmentId?: string
  }>
  created_at: string
  updated_at: string
}

export interface SendEmailData {
  to: string[]
  cc?: string[]
  bcc?: string[]
  subject: string
  body: string
  attachments?: Array<{
    filename: string
    mimeType: string
    size: number
    data: string
  }>
}

export function useEmails() {
  const [emails, setEmails] = useState<Email[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // メール一覧を取得
  const fetchEmails = useCallback(async (query: string = '', maxResults: number = 50) => {
    setLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams({
        maxResults: maxResults.toString(),
      })

      // クエリがある場合は追加
      if (query) {
        params.append('q', query)
      }

      const response = await fetch(`/api/emails?${params}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'メールの取得に失敗しました')
      }

      // APIレスポンス形式を古い形式に変換
      const convertedEmails = data.emails.map((email: any) => ({
        id: email.id,
        threadId: email.id, // 簡易的にIDを使用
        from_name: email.from.name,
        from_email: email.from.email,
        to_emails: email.to.map((t: any) => t.email),
        cc_emails: email.cc?.map((c: any) => c.email) || [],
        subject: email.subject,
        body: email.textBody || '',
        html_body: email.htmlBody,
        message_id: email.messageId,
        thread_id: email.id,
        folder: 'inbox',
        read: email.read,
        starred: email.starred,
        important: email.labels?.includes('important') || false,
        labels: email.labels || [],
        attachments: email.attachments || [],
        created_at: email.date,
        updated_at: email.date,
      }))

      setEmails(convertedEmails)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'エラーが発生しました')
    } finally {
      setLoading(false)
    }
  }, [])

  // メール送信
  const sendEmail = useCallback(async (emailData: SendEmailData) => {
    if (!session) {
      throw new Error('認証が必要です')
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/emails/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(emailData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'メールの送信に失敗しました')
      }

      // 送信後、メール一覧を再取得
      await fetchEmails()

      return data
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'エラーが発生しました'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [session, fetchEmails])

  // メールの操作（スター、既読、アーカイブ）
  const updateEmail = useCallback(async (emailId: string, action: string, value?: boolean) => {
    if (!session) {
      throw new Error('認証が必要です')
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/emails/${emailId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action, value }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'メールの更新に失敗しました')
      }

      // ローカル状態を更新
      setEmails(prevEmails => 
        prevEmails.map(email => {
          if (email.id === emailId) {
            const updatedEmail = { ...email }
            switch (action) {
              case 'star':
                updatedEmail.starred = value!
                break
              case 'read':
                updatedEmail.read = value!
                break
              case 'archive':
                updatedEmail.folder = 'archive'
                break
            }
            return updatedEmail
          }
          return email
        })
      )

      return data
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'エラーが発生しました'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [session])

  // メール削除
  const deleteEmail = useCallback(async (emailId: string) => {
    if (!session) {
      throw new Error('認証が必要です')
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/emails/${emailId}`, {
        method: 'DELETE',
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'メールの削除に失敗しました')
      }

      // ローカル状態からメールを削除
      setEmails(prevEmails => prevEmails.filter(email => email.id !== emailId))

      return data
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'エラーが発生しました'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [session])

  // スター切り替え
  const toggleStar = useCallback(async (emailId: string, starred: boolean) => {
    return updateEmail(emailId, 'star', !starred)
  }, [updateEmail])

  // 既読/未読切り替え
  const toggleRead = useCallback(async (emailId: string, read: boolean) => {
    return updateEmail(emailId, 'read', !read)
  }, [updateEmail])

  // アーカイブ
  const archiveEmail = useCallback(async (emailId: string) => {
    return updateEmail(emailId, 'archive')
  }, [updateEmail])

  // 添付ファイルダウンロード
  const downloadAttachment = useCallback(async (messageId: string, attachmentId: string, filename: string) => {
    if (!session) {
      throw new Error('認証が必要です')
    }

    try {
      const response = await fetch(`/api/emails/attachments/${messageId}/${attachmentId}`)

      if (!response.ok) {
        throw new Error('添付ファイルのダウンロードに失敗しました')
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'エラーが発生しました'
      setError(errorMessage)
      throw new Error(errorMessage)
    }
  }, [session])

  // 初回読み込み
  useEffect(() => {
    if (session) {
      fetchEmails()
    }
  }, [session, fetchEmails])

  return {
    emails,
    loading,
    error,
    fetchEmails,
    sendEmail,
    updateEmail,
    deleteEmail,
    toggleStar,
    toggleRead,
    archiveEmail,
    downloadAttachment,
  }
} 