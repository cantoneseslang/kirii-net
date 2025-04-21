// このスクリプトは開発環境で実行して、すべての音声ファイルを一括生成するためのものです
// 使用方法: npx ts-node scripts/generate-audio-files.ts

import fs from "fs"
import path from "path"
import { generateAudioFile } from "../lib/text-to-speech"
import cantoneseData from "../data/cantoneseData.json"

async function generateAllAudioFiles() {
  console.log("音声ファイル生成を開始します...")

  // 出力ディレクトリの確認と作成
  const outputDir = path.join(process.cwd(), "public/audio")
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true })
    console.log(`ディレクトリを作成しました: ${outputDir}`)
  }

  // 各データに対して音声ファイルを生成
  for (const item of cantoneseData) {
    try {
      const fileName = `${item.id}.mp3`
      const filePath = path.join(outputDir, fileName)

      // ファイルが既に存在する場合はスキップ
      if (fs.existsSync(filePath)) {
        console.log(`ファイルは既に存在します: ${fileName}`)
        continue
      }

      console.log(`生成中: ${item.kanji} (${item.jyutping}) -> ${fileName}`)
      // 重要: 必ず漢字（繁体字）を使用して音声を生成
      await generateAudioFile(item.kanji, fileName)
      console.log(`生成完了: ${fileName}`)

      // APIレート制限を避けるための遅延
      await new Promise((resolve) => setTimeout(resolve, 500))
    } catch (error) {
      console.error(`エラー (${item.id}): `, error)
    }
  }

  console.log("すべての音声ファイル生成が完了しました！")
}

// スクリプト実行
generateAllAudioFiles().catch((error) => {
  console.error("スクリプト実行エラー:", error)
  process.exit(1)
})
