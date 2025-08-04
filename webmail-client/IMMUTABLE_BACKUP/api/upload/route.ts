import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { supabaseAdmin } from '@/lib/supabase'

// ファイルサイズ制限（20MB）
const MAX_FILE_SIZE = 20 * 1024 * 1024 // 20MB
const LARGE_FILE_THRESHOLD = 15 * 1024 * 1024 // 15MB

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession()
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 })
    }

    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'ストレージサービスが利用できません' }, { status: 500 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return NextResponse.json({ error: 'ファイルが必要です' }, { status: 400 })
    }

    // ファイルサイズチェック
    const fileSize = file.size
    const isLargeFile = fileSize > LARGE_FILE_THRESHOLD

    if (fileSize > MAX_FILE_SIZE) {
      return NextResponse.json({ 
        error: 'ファイルサイズが大きすぎます',
        maxSize: MAX_FILE_SIZE,
        currentSize: fileSize
      }, { status: 400 })
    }

    // ファイル名を安全にする
    const safeFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
    const timestamp = Date.now()
    const fileName = `${timestamp}_${safeFileName}`
    
    // ユーザー固有のフォルダパス
    const userFolder = `uploads/${session.user.email.replace('@', '_at_')}`
    const filePath = `${userFolder}/${fileName}`

    // ファイルをバッファに変換
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Supabase Storageにアップロード
    const { data, error } = await supabaseAdmin.storage
      .from('email-attachments')
      .upload(filePath, buffer, {
        contentType: file.type,
        upsert: false
      })

    if (error) {
      console.error('Upload error:', error)
      return NextResponse.json({ error: 'ファイルのアップロードに失敗しました' }, { status: 500 })
    }

    // 共有リンクを生成
    const { data: urlData } = supabaseAdmin.storage
      .from('email-attachments')
      .getPublicUrl(filePath)

    // ファイル情報をデータベースに保存
    const { error: dbError } = await supabaseAdmin
      .from('file_uploads')
      .insert({
        user_email: session.user.email,
        file_name: file.name,
        file_path: filePath,
        file_size: fileSize,
        mime_type: file.type,
        public_url: urlData.publicUrl,
        is_large_file: isLargeFile,
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30日後
      })

    if (dbError) {
      console.error('Database error:', dbError)
      // データベースエラーがあってもファイルはアップロード済みなので続行
    }

    return NextResponse.json({
      success: true,
      file: {
        name: file.name,
        size: fileSize,
        type: file.type,
        url: urlData.publicUrl,
        isLargeFile,
        path: filePath
      },
      message: isLargeFile 
        ? '大きなファイルがクラウドストレージにアップロードされました。リンクがメールに含まれます。'
        : 'ファイルがアップロードされました'
    })

  } catch (error) {
    console.error('Upload API error:', error)
    return NextResponse.json(
      { error: 'ファイルのアップロードに失敗しました' },
      { status: 500 }
    )
  }
} 