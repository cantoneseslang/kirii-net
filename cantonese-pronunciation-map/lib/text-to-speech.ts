// このファイルはサーバーサイドでのみ実行されます
// 音声ファイルの生成に使用します

import fs from "fs"
import path from "path"
import { promisify } from "util"
import type { NextApiRequest, NextApiResponse } from "next"

const writeFileAsync = promisify(fs.writeFile)
const mkdirAsync = promisify(fs.mkdir)

// Google Cloud Text-to-Speech APIを使用して音声ファイルを生成する関数
export async function generateAudioFile(text: string, outputFileName: string): Promise<string> {
  try {
    const apiKey = process.env.GOOGLE_API_KEY

    if (!apiKey) {
      throw new Error("Google API Key is not defined in environment variables")
    }

    // Google Cloud Text-to-Speech APIのエンドポイント
    const url = `https://texttospeech.googleapis.com/v1/text:synthesize?key=${apiKey}`

    // リクエストボディ
    const requestBody = {
      input: {
        text,
      },
      voice: {
        languageCode: "yue-Hant-HK", // 広東語（香港）
        name: "yue-Hant-HK-Standard-A", // 広東語の音声モデル
        ssmlGender: "NEUTRAL",
      },
      audioConfig: {
        audioEncoding: "MP3",
      },
    }

    // APIリクエスト
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(`API request failed: ${JSON.stringify(errorData)}`)
    }

    const data = await response.json()

    // Base64エンコードされた音声データをデコード
    const audioContent = Buffer.from(data.audioContent, "base64")

    // 出力ディレクトリの確認と作成
    const outputDir = path.join(process.cwd(), "public/audio")
    if (!fs.existsSync(outputDir)) {
      await mkdirAsync(outputDir, { recursive: true })
    }

    // 音声ファイルの保存
    const outputPath = path.join(outputDir, outputFileName)
    await writeFileAsync(outputPath, audioContent)

    return `/audio/${outputFileName}`
  } catch (error) {
    console.error("Error generating audio file:", error)
    throw error
  }
}

// APIルートハンドラー（開発時のみ使用）
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" })
  }

  try {
    const { text, fileName } = req.body

    if (!text || !fileName) {
      return res.status(400).json({ error: "Text and fileName are required" })
    }

    const audioPath = await generateAudioFile(text, fileName)
    return res.status(200).json({ success: true, audioPath })
  } catch (error) {
    console.error("API handler error:", error)
    return res.status(500).json({ error: "Failed to generate audio file" })
  }
}
