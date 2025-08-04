'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, CheckCircle, XCircle, Mail, Server, Shield } from 'lucide-react'
import { EmailAccount, EMAIL_PROVIDERS } from '@/lib/email-service'

interface EmailAccountSetupProps {
  onAccountSaved: (account: EmailAccount) => void
  onCancel: () => void
  existingAccount?: EmailAccount
}

export function EmailAccountSetup({ onAccountSaved, onCancel, existingAccount }: EmailAccountSetupProps) {
  const [formData, setFormData] = useState<Partial<EmailAccount>>({
    name: existingAccount?.name || '',
    email: existingAccount?.email || '',
    type: existingAccount?.type || 'imap',
    incomingServer: {
      host: existingAccount?.incomingServer.host || '',
      port: existingAccount?.incomingServer.port || 993,
      secure: existingAccount?.incomingServer.secure ?? true,
      auth: {
        user: existingAccount?.incomingServer.auth.user || '',
        pass: existingAccount?.incomingServer.auth.pass || '',
      },
    },
    outgoingServer: {
      host: existingAccount?.outgoingServer.host || '',
      port: existingAccount?.outgoingServer.port || 587,
      secure: existingAccount?.outgoingServer.secure ?? false,
      auth: {
        user: existingAccount?.outgoingServer.auth.user || '',
        pass: existingAccount?.outgoingServer.auth.pass || '',
      },
    },
  })

  const [selectedProvider, setSelectedProvider] = useState<string>('')
  const [isTestingConnection, setIsTestingConnection] = useState(false)
  const [connectionTest, setConnectionTest] = useState<{
    incoming: boolean | null
    outgoing: boolean | null
  }>({ incoming: null, outgoing: null })
  const [isSaving, setIsSaving] = useState(false)

  // プロバイダー選択時の自動設定
  const handleProviderSelect = (providerId: string) => {
    setSelectedProvider(providerId)
    
    if (providerId && EMAIL_PROVIDERS[providerId as keyof typeof EMAIL_PROVIDERS]) {
      const provider = EMAIL_PROVIDERS[providerId as keyof typeof EMAIL_PROVIDERS]
      const protocolSettings = formData.type === 'imap' ? provider.incoming.imap : provider.incoming.pop3
      
      setFormData(prev => ({
        ...prev,
        incomingServer: {
          ...prev.incomingServer!,
          host: protocolSettings.host,
          port: protocolSettings.port,
          secure: protocolSettings.secure,
        },
        outgoingServer: {
          ...prev.outgoingServer!,
          host: provider.outgoing.host,
          port: provider.outgoing.port,
          secure: provider.outgoing.secure,
        },
      }))
    }
  }

  // フォーム更新
  const updateFormData = (path: string, value: any) => {
    setFormData(prev => {
      const newData = { ...prev }
      const keys = path.split('.')
      let current: any = newData
      
      for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) current[keys[i]] = {}
        current = current[keys[i]]
      }
      
      current[keys[keys.length - 1]] = value
      return newData
    })
  }

  // 接続テスト
  const testConnection = async () => {
    if (!formData.email || !formData.incomingServer?.host || !formData.outgoingServer?.host) {
      alert('必要な情報を入力してください')
      return
    }

    setIsTestingConnection(true)
    setConnectionTest({ incoming: null, outgoing: null })

    try {
      const response = await fetch('/api/email/test-connection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const result = await response.json()
      
      if (response.ok) {
        setConnectionTest(result)
      } else {
        alert(`接続テストに失敗しました: ${result.error}`)
      }
    } catch (error) {
      alert('接続テスト中にエラーが発生しました')
      console.error('Connection test error:', error)
    } finally {
      setIsTestingConnection(false)
    }
  }

  // アカウント保存
  const saveAccount = async () => {
    if (!formData.name || !formData.email || !formData.incomingServer?.host || !formData.outgoingServer?.host) {
      alert('すべての必須項目を入力してください')
      return
    }

    setIsSaving(true)

    try {
      const account: EmailAccount = {
        id: existingAccount?.id || `account_${Date.now()}`,
        ...formData as Required<typeof formData>,
      }

      const response = await fetch('/api/email/accounts', {
        method: existingAccount ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(account),
      })

      if (response.ok) {
        onAccountSaved(account)
      } else {
        const error = await response.json()
        alert(`アカウントの保存に失敗しました: ${error.error}`)
      }
    } catch (error) {
      alert('アカウント保存中にエラーが発生しました')
      console.error('Save account error:', error)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            {existingAccount ? 'メールアカウントを編集' : 'メールアカウントを追加'}
          </CardTitle>
          <CardDescription>
            POP3またはIMAPに対応したメールアカウントを設定できます
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* 基本情報 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">アカウント名 *</Label>
              <Input
                id="name"
                placeholder="例: 会社用メール"
                value={formData.name || ''}
                onChange={(e) => updateFormData('name', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">メールアドレス *</Label>
              <Input
                id="email"
                type="email"
                placeholder="your-email@example.com"
                value={formData.email || ''}
                onChange={(e) => updateFormData('email', e.target.value)}
              />
            </div>
          </div>

          {/* プロバイダー選択 */}
          <div className="space-y-2">
            <Label>メールプロバイダー（自動設定）</Label>
            <Select value={selectedProvider} onValueChange={handleProviderSelect}>
              <SelectTrigger>
                <SelectValue placeholder="プロバイダーを選択（オプション）" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">カスタム設定</SelectItem>
                {Object.entries(EMAIL_PROVIDERS).map(([key, provider]) => (
                  <SelectItem key={key} value={key}>
                    {provider.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* プロトコル選択 */}
          <div className="space-y-2">
            <Label>受信プロトコル</Label>
            <Select 
              value={formData.type || 'imap'} 
              onValueChange={(value: 'imap' | 'pop3') => {
                updateFormData('type', value)
                // プロトコル変更時にプロバイダー設定を再適用
                if (selectedProvider) {
                  handleProviderSelect(selectedProvider)
                }
              }}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="imap">IMAP（推奨）</SelectItem>
                <SelectItem value="pop3">POP3</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Tabs defaultValue="incoming" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="incoming" className="flex items-center gap-2">
                <Server className="h-4 w-4" />
                受信サーバー
              </TabsTrigger>
              <TabsTrigger value="outgoing" className="flex items-center gap-2">
                <Server className="h-4 w-4" />
                送信サーバー
              </TabsTrigger>
            </TabsList>

            {/* 受信サーバー設定 */}
            <TabsContent value="incoming" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="incoming-host">サーバー *</Label>
                  <Input
                    id="incoming-host"
                    placeholder="mail.example.com"
                    value={formData.incomingServer?.host || ''}
                    onChange={(e) => updateFormData('incomingServer.host', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="incoming-port">ポート *</Label>
                  <Input
                    id="incoming-port"
                    type="number"
                    value={formData.incomingServer?.port || ''}
                    onChange={(e) => updateFormData('incomingServer.port', parseInt(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="incoming-secure" className="flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    SSL/TLS
                  </Label>
                  <Switch
                    id="incoming-secure"
                    checked={formData.incomingServer?.secure || false}
                    onCheckedChange={(checked) => updateFormData('incomingServer.secure', checked)}
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="incoming-user">ユーザー名 *</Label>
                  <Input
                    id="incoming-user"
                    value={formData.incomingServer?.auth.user || ''}
                    onChange={(e) => updateFormData('incomingServer.auth.user', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="incoming-pass">パスワード *</Label>
                  <Input
                    id="incoming-pass"
                    type="password"
                    value={formData.incomingServer?.auth.pass || ''}
                    onChange={(e) => updateFormData('incomingServer.auth.pass', e.target.value)}
                  />
                </div>
              </div>
            </TabsContent>

            {/* 送信サーバー設定 */}
            <TabsContent value="outgoing" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="outgoing-host">サーバー *</Label>
                  <Input
                    id="outgoing-host"
                    placeholder="smtp.example.com"
                    value={formData.outgoingServer?.host || ''}
                    onChange={(e) => updateFormData('outgoingServer.host', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="outgoing-port">ポート *</Label>
                  <Input
                    id="outgoing-port"
                    type="number"
                    value={formData.outgoingServer?.port || ''}
                    onChange={(e) => updateFormData('outgoingServer.port', parseInt(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="outgoing-secure" className="flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    SSL/TLS
                  </Label>
                  <Switch
                    id="outgoing-secure"
                    checked={formData.outgoingServer?.secure || false}
                    onCheckedChange={(checked) => updateFormData('outgoingServer.secure', checked)}
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="outgoing-user">ユーザー名 *</Label>
                  <Input
                    id="outgoing-user"
                    value={formData.outgoingServer?.auth.user || ''}
                    onChange={(e) => updateFormData('outgoingServer.auth.user', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="outgoing-pass">パスワード *</Label>
                  <Input
                    id="outgoing-pass"
                    type="password"
                    value={formData.outgoingServer?.auth.pass || ''}
                    onChange={(e) => updateFormData('outgoingServer.auth.pass', e.target.value)}
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>

          {/* 接続テスト結果 */}
          {(connectionTest.incoming !== null || connectionTest.outgoing !== null) && (
            <Alert>
              <AlertDescription>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    {connectionTest.incoming === true ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : connectionTest.incoming === false ? (
                      <XCircle className="h-4 w-4 text-red-500" />
                    ) : null}
                    <span>受信サーバー: {
                      connectionTest.incoming === true ? '接続成功' :
                      connectionTest.incoming === false ? '接続失敗' : 'テスト中...'
                    }</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {connectionTest.outgoing === true ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : connectionTest.outgoing === false ? (
                      <XCircle className="h-4 w-4 text-red-500" />
                    ) : null}
                    <span>送信サーバー: {
                      connectionTest.outgoing === true ? '接続成功' :
                      connectionTest.outgoing === false ? '接続失敗' : 'テスト中...'
                    }</span>
                  </div>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* アクションボタン */}
          <div className="flex justify-between pt-4">
            <Button variant="outline" onClick={onCancel}>
              キャンセル
            </Button>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={testConnection}
                disabled={isTestingConnection}
              >
                {isTestingConnection ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    テスト中...
                  </>
                ) : (
                  '接続テスト'
                )}
              </Button>
              <Button
                onClick={saveAccount}
                disabled={isSaving}
              >
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    保存中...
                  </>
                ) : (
                  '保存'
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}