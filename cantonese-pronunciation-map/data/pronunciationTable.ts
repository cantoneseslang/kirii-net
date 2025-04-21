import type { PronunciationTable } from "@/types/pronunciation-table"

// 子音グループごとの色
export const consonantColors: { [key: string]: string } = {
  b: "rgba(232, 245, 233, 0.8)", // 緑系
  p: "rgba(232, 245, 233, 0.8)",
  m: "rgba(232, 245, 233, 0.8)",
  f: "rgba(232, 245, 233, 0.8)",
  d: "rgba(248, 224, 224, 0.8)", // 赤系
  t: "rgba(248, 224, 224, 0.8)",
  n: "rgba(248, 224, 224, 0.8)",
  l: "rgba(248, 224, 224, 0.8)",
  g: "rgba(255, 248, 225, 0.8)", // 黄系
  k: "rgba(255, 248, 225, 0.8)",
  h: "rgba(255, 248, 225, 0.8)",
  z: "rgba(227, 242, 253, 0.8)", // 青系
  c: "rgba(227, 242, 253, 0.8)",
  s: "rgba(227, 242, 253, 0.8)",
  j: "rgba(224, 247, 250, 0.8)", // 水色系
  w: "rgba(224, 247, 250, 0.8)",
}

// 子音グループの定義を追加
export const consonantGroups = {
  labial: {
    consonants: ["b", "p", "m"],
    features: {
      b: "無気音",
      p: "有気音",
      m: "鼻音"
    },
    groupName: "両唇音",
    articulationTypes: {
      "b,p": "破裂音",
      "m": "鼻音"
    }
  },
  labiodental: {
    consonants: ["f"],
    features: {
      f: "摩擦音"
    },
    groupName: "唇歯音",
    articulationTypes: {
      "f": "摩擦音"
    }
  },
  alveolar: {
    consonants: ["d", "t", "n", "l"],
    features: {
      d: "無気音",
      t: "有気音",
      n: "鼻音",
      l: "側面接近音"
    }
  },
  velar: {
    consonants: ["g", "gw", "k", "kw", "ng", "h"],
    features: {
      g: "無気音",
      gw: "無気音+唇音化",
      k: "有気音",
      kw: "有気音+唇音化",
      ng: "鼻音",
      h: "摩擦音"
    }
  },
  sibilant: {
    consonants: ["z", "c", "s"],
    features: {
      z: "無気音",
      c: "有気音",
      s: "摩擦音"
    }
  },
  semivowel: {
    consonants: ["j", "w"],
    features: {
      j: "硬口蓋接近音",
      w: "唇軟口蓋接近音"
    }
  }
}

// 子音の特徴を定義
export const consonantFeatures = {
  unaspirated: ["b", "d", "g", "gw", "z"],
  aspirated: ["p", "t", "k", "kw", "c"],
  nasal: ["m", "n", "ng"],
  fricative: ["f", "h", "s"],
  lateral: ["l"],
  semivowel: ["j", "w"]
}

// 簡略化した発音表データ（実際にはもっと多くのデータが必要です）
export const pronunciationTable: PronunciationTable = {
  initialConsonants: ["b", "p", "m", "f", "d", "t", "n", "l", "g", "gw", "k", "kw", "ng", "h", "z", "c", "s", "j", "w"],
  finals: [
    "aa", "aai", "aau", "aam", "aan", "aang", "aap", "aat", "aak",
    "a", "ai", "au", "am", "an", "ang", "ap", "at", "ak",
    "e", "ei", "eu", "em", "en", "eng", "ep", "et", "ek",
    "ei", "ing", "ik",
    "o", "oi", "on", "ong", "ot", "ok",
    "ou", "ung", "uk",
    "oe", "oeng", "oet", "oek",
    "eoi", "eon", "eot",
    "i", "iu", "im", "in", "ip", "it",
    "u", "ui", "um", "un", "ut",
    "yu", "yun", "yut", "母音なし"
  ],
  cells: {
    aa: {
      b: { jyutping: "baa", kanji: "巴", katakana: "バー", color: consonantColors.b },
      p: { jyutping: "paa", kanji: "趴", katakana: "パー", color: consonantColors.p },
      m: { jyutping: "maa", kanji: "媽", katakana: "マー", color: consonantColors.m },
      f: { jyutping: "faa", kanji: "花", katakana: "ファー", color: consonantColors.f },
      d: { jyutping: "daa", kanji: "打", katakana: "ダー", color: consonantColors.d },
      t: { jyutping: "taa", kanji: "他", katakana: "ター", color: consonantColors.t },
      n: { jyutping: "naa", kanji: "拿", katakana: "ナー", color: consonantColors.n },
      l: { jyutping: "laa", kanji: "啦", katakana: "ラー", color: consonantColors.l },
      g: { jyutping: "gaa", kanji: "加", katakana: "ガー", color: consonantColors.g },
      k: { jyutping: "kaa", kanji: "卡", katakana: "カー", color: consonantColors.k },
      h: { jyutping: "haa", kanji: "哈", katakana: "ハー", color: consonantColors.h },
      z: { jyutping: "zaa", kanji: "渣", katakana: "ザー", color: consonantColors.z },
      c: { jyutping: "caa", kanji: "叉", katakana: "チャー", color: consonantColors.c },
      s: { jyutping: "saa", kanji: "沙", katakana: "サー", color: consonantColors.s },
      j: { jyutping: "jaa", kanji: "也", katakana: "ヤー", color: consonantColors.j },
      w: { jyutping: "waa", kanji: "華", katakana: "ワー", color: consonantColors.w }
    },
    aai: {
      b: { jyutping: "baai", kanji: "擺", katakana: "バーイ", color: consonantColors.b },
      p: { jyutping: "paai", kanji: "排", katakana: "パーイ", color: consonantColors.p },
      m: { jyutping: "maai", kanji: "買", katakana: "マーイ", color: consonantColors.m },
      f: { jyutping: "faai", kanji: "快", katakana: "ファーイ", color: consonantColors.f },
      d: { jyutping: "daai", kanji: "帶", katakana: "ダーイ", color: consonantColors.d },
      t: { jyutping: "taai", kanji: "太", katakana: "ターイ", color: consonantColors.t },
      n: { jyutping: "naai", kanji: "奶", katakana: "ナーイ", color: consonantColors.n },
      l: { jyutping: "laai", kanji: "賴", katakana: "ラーイ", color: consonantColors.l },
      g: { jyutping: "gaai", kanji: "街", katakana: "ガーイ", color: consonantColors.g },
      k: { jyutping: "kaai", kanji: "開", katakana: "カーイ", color: consonantColors.k },
      h: { jyutping: "haai", kanji: "鞋", katakana: "ハーイ", color: consonantColors.h },
      z: { jyutping: "zaai", kanji: "仔", katakana: "ザーイ", color: consonantColors.z },
      c: { jyutping: "caai", kanji: "猜", katakana: "チャーイ", color: consonantColors.c },
      s: { jyutping: "saai", kanji: "晒", katakana: "サーイ", color: consonantColors.s },
      w: { jyutping: "waai", kanji: "歪", katakana: "ワーイ", color: consonantColors.w }
    },
    aau: {
      b: { jyutping: "baau", kanji: "包", katakana: "バーウ", color: consonantColors.b },
      p: { jyutping: "paau", kanji: "拋", katakana: "パーウ", color: consonantColors.p },
      m: { jyutping: "maau", kanji: "貓", katakana: "マーウ", color: consonantColors.m },
      f: { jyutping: "faau", kanji: "泡", katakana: "ファーウ", color: consonantColors.f },
      d: { jyutping: "daau", kanji: "倒", katakana: "ダーウ", color: consonantColors.d },
      t: { jyutping: "taau", kanji: "套", katakana: "ターウ", color: consonantColors.t },
      n: { jyutping: "naau", kanji: "鬧", katakana: "ナーウ", color: consonantColors.n },
      l: { jyutping: "laau", kanji: "撈", katakana: "ラーウ", color: consonantColors.l },
      g: { jyutping: "gaau", kanji: "教", katakana: "ガーウ", color: consonantColors.g },
      k: { jyutping: "kaau", kanji: "考", katakana: "カーウ", color: consonantColors.k },
      h: { jyutping: "haau", kanji: "口", katakana: "ハーウ", color: consonantColors.h },
      z: { jyutping: "zaau", kanji: "走", katakana: "ザーウ", color: consonantColors.z },
      c: { jyutping: "caau", kanji: "抄", katakana: "チャーウ", color: consonantColors.c },
      s: { jyutping: "saau", kanji: "掃", katakana: "サーウ", color: consonantColors.s }
    },
    aam: {
      b: { jyutping: "baam", kanji: "斑", katakana: "バーム", color: consonantColors.b },
      p: { jyutping: "paam", kanji: "拍", katakana: "パーム", color: consonantColors.p },
      m: { jyutping: "maam", kanji: "媽", katakana: "マーム", color: consonantColors.m },
      f: { jyutping: "faam", kanji: "凡", katakana: "ファーム", color: consonantColors.f },
      d: { jyutping: "daam", kanji: "擔", katakana: "ダーム", color: consonantColors.d },
      t: { jyutping: "taam", kanji: "談", katakana: "ターム", color: consonantColors.t },
      n: { jyutping: "naam", kanji: "男", katakana: "ナーム", color: consonantColors.n },
      l: { jyutping: "laam", kanji: "藍", katakana: "ラーム", color: consonantColors.l },
      g: { jyutping: "gaam", kanji: "監", katakana: "ガーム", color: consonantColors.g },
      k: { jyutping: "kaam", kanji: "堪", katakana: "カーム", color: consonantColors.k },
      h: { jyutping: "haam", kanji: "含", katakana: "ハーム", color: consonantColors.h },
      z: { jyutping: "zaam", kanji: "斬", katakana: "ザーム", color: consonantColors.z },
      c: { jyutping: "caam", kanji: "參", katakana: "チャーム", color: consonantColors.c },
      s: { jyutping: "saam", kanji: "三", katakana: "サーム", color: consonantColors.s }
    },
    aan: {
      b: { jyutping: "baan", kanji: "班", katakana: "バーン", color: consonantColors.b },
      p: { jyutping: "paan", kanji: "判", katakana: "パーン", color: consonantColors.p },
      m: { jyutping: "maan", kanji: "萬", katakana: "マーン", color: consonantColors.m },
      f: { jyutping: "faan", kanji: "反", katakana: "ファーン", color: consonantColors.f },
      d: { jyutping: "daan", kanji: "單", katakana: "ダーン", color: consonantColors.d },
      t: { jyutping: "taan", kanji: "灘", katakana: "ターン", color: consonantColors.t },
      n: { jyutping: "naan", kanji: "難", katakana: "ナーン", color: consonantColors.n },
      l: { jyutping: "laan", kanji: "爛", katakana: "ラーン", color: consonantColors.l },
      g: { jyutping: "gaan", kanji: "間", katakana: "ガーン", color: consonantColors.g },
      k: { jyutping: "kaan", kanji: "看", katakana: "カーン", color: consonantColors.k },
      h: { jyutping: "haan", kanji: "限", katakana: "ハーン", color: consonantColors.h },
      z: { jyutping: "zaan", kanji: "讚", katakana: "ザーン", color: consonantColors.z },
      c: { jyutping: "caan", kanji: "餐", katakana: "チャーン", color: consonantColors.c },
      s: { jyutping: "saan", kanji: "山", katakana: "サーン", color: consonantColors.s }
    },
    aang: {
      b: { jyutping: "baang", kanji: "崩", katakana: "バーン(グ)", color: consonantColors.b },
      p: { jyutping: "paang", kanji: "碰", katakana: "パーン(グ)", color: consonantColors.p },
      m: { jyutping: "maang", kanji: "盲", katakana: "マーン(グ)", color: consonantColors.m },
      f: { jyutping: "faang", kanji: "方", katakana: "ファーン(グ)", color: consonantColors.f },
      d: { jyutping: "daang", kanji: "登", katakana: "ダーン(グ)", color: consonantColors.d },
      t: { jyutping: "taang", kanji: "湯", katakana: "ターン(グ)", color: consonantColors.t },
      n: { jyutping: "naang", kanji: "能", katakana: "ナーン(グ)", color: consonantColors.n },
      l: { jyutping: "laang", kanji: "冷", katakana: "ラーン(グ)", color: consonantColors.l },
      g: { jyutping: "gaang", kanji: "耕", katakana: "ガーン(グ)", color: consonantColors.g },
      k: { jyutping: "kaang", kanji: "坑", katakana: "カーン(グ)", color: consonantColors.k },
      h: { jyutping: "haang", kanji: "行", katakana: "ハーン(グ)", color: consonantColors.h },
      z: { jyutping: "zaang", kanji: "爭", katakana: "ザーン(グ)", color: consonantColors.z },
      c: { jyutping: "caang", kanji: "撐", katakana: "チャーン(グ)", color: consonantColors.c },
      s: { jyutping: "saang", kanji: "生", katakana: "サーン(グ)", color: consonantColors.s }
    },
    aap: {
      b: { jyutping: "baap", kanji: "泊", katakana: "バーッ(プ)", color: consonantColors.b },
      p: { jyutping: "paap", kanji: "拍", katakana: "パーッ(プ)", color: consonantColors.p },
      m: { jyutping: "maap", kanji: "麥", katakana: "マーッ(プ)", color: consonantColors.m },
      d: { jyutping: "daap", kanji: "答", katakana: "ダーッ(プ)", color: consonantColors.d },
      t: { jyutping: "taap", kanji: "塔", katakana: "ターッ(プ)", color: consonantColors.t },
      n: { jyutping: "naap", kanji: "納", katakana: "ナーッ(プ)", color: consonantColors.n },
      l: { jyutping: "laap", kanji: "立", katakana: "ラーッ(プ)", color: consonantColors.l },
      g: { jyutping: "gaap", kanji: "及", katakana: "ガーッ(プ)", color: consonantColors.g },
      k: { jyutping: "kaap", kanji: "急", katakana: "カーッ(プ)", color: consonantColors.k },
      h: { jyutping: "haap", kanji: "合", katakana: "ハーッ(プ)", color: consonantColors.h },
      z: { jyutping: "zaap", kanji: "汁", katakana: "ザーッ(プ)", color: consonantColors.z },
      c: { jyutping: "caap", kanji: "集", katakana: "チャーッ(プ)", color: consonantColors.c },
      s: { jyutping: "saap", kanji: "十", katakana: "サーッ(プ)", color: consonantColors.s }
    },
    aat: {
      b: { jyutping: "baat", kanji: "八", katakana: "バーッ(トゥ)", color: consonantColors.b },
      p: { jyutping: "paat", kanji: "撥", katakana: "パーッ(トゥ)", color: consonantColors.p },
      m: { jyutping: "maat", kanji: "末", katakana: "マーッ(トゥ)", color: consonantColors.m },
      f: { jyutping: "faat", kanji: "發", katakana: "ファーッ(トゥ)", color: consonantColors.f },
      d: { jyutping: "daat", kanji: "達", katakana: "ダーッ(トゥ)", color: consonantColors.d },
      t: { jyutping: "taat", kanji: "脫", katakana: "ターッ(トゥ)", color: consonantColors.t },
      n: { jyutping: "naat", kanji: "捺", katakana: "ナーッ(トゥ)", color: consonantColors.n },
      l: { jyutping: "laat", kanji: "辣", katakana: "ラーッ(トゥ)", color: consonantColors.l },
      g: { jyutping: "gaat", kanji: "割", katakana: "ガーッ(トゥ)", color: consonantColors.g },
      k: { jyutping: "kaat", kanji: "渴", katakana: "カーッ(トゥ)", color: consonantColors.k },
      h: { jyutping: "haat", kanji: "轄", katakana: "ハーッ(トゥ)", color: consonantColors.h },
      z: { jyutping: "zaat", kanji: "質", katakana: "ザーッ(トゥ)", color: consonantColors.z },
      c: { jyutping: "caat", kanji: "察", katakana: "チャーッ(トゥ)", color: consonantColors.c },
      s: { jyutping: "saat", kanji: "殺", katakana: "サーッ(トゥ)", color: consonantColors.s }
    },
    aak: {
      b: { jyutping: "baak", kanji: "百", katakana: "バーッ(ク)", color: consonantColors.b },
      p: { jyutping: "paak", kanji: "拍", katakana: "パーッ(ク)", color: consonantColors.p },
      m: { jyutping: "maak", kanji: "麥", katakana: "マーッ(ク)", color: consonantColors.m },
      n: { jyutping: "naak", kanji: "諾", katakana: "ナーッ(ク)", color: consonantColors.n },
      l: { jyutping: "laak", kanji: "落", katakana: "ラーッ(ク)", color: consonantColors.l },
      g: { jyutping: "gaak", kanji: "隔", katakana: "ガーッ(ク)", color: consonantColors.g },
      k: { jyutping: "kaak", kanji: "客", katakana: "カーッ(ク)", color: consonantColors.k },
      h: { jyutping: "haak", kanji: "嚇", katakana: "ハーッ(ク)", color: consonantColors.h },
      z: { jyutping: "zaak", kanji: "責", katakana: "ザーッ(ク)", color: consonantColors.z },
      c: { jyutping: "caak", kanji: "策", katakana: "チャーッ(ク)", color: consonantColors.c },
      s: { jyutping: "saak", kanji: "索", katakana: "サーッ(ク)", color: consonantColors.s }
    }
  },
}

// 発音表から特定の発音の情報を取得する関数
export function getPronunciationInfo(jyutping: string) {
  // 声調を除去
  const baseJyutping = jyutping.replace(/[1-6]$/, "")

  // 母音と子音を分離（簡易的な実装）
  let initial = ""
  let final = ""

  // 子音を特定
  for (const consonant of pronunciationTable.initialConsonants) {
    if (baseJyutping.startsWith(consonant)) {
      initial = consonant
      final = baseJyutping.substring(consonant.length)
      break
    }
  }

  // 母音がない場合（例：ng）
  if (!initial) {
    final = baseJyutping
  }

  // 発音表から情報を取得
  try {
    if (pronunciationTable.cells[final] && pronunciationTable.cells[final][initial]) {
      return {
        ...pronunciationTable.cells[final][initial],
        initial,
        final,
        color: consonantColors[initial] || "#2f9e9a",
      }
    }
  } catch (e) {
    console.error("発音情報の取得に失敗しました:", e)
  }

  // 情報が見つからない場合
  return {
    jyutping: baseJyutping,
    initial,
    final,
    color: initial ? consonantColors[initial] : "#2f9e9a",
  }
}

// 発音表の行または列の見出しを取得する関数
export function getTableHeaders() {
  return {
    initialConsonants: pronunciationTable.initialConsonants,
    finals: pronunciationTable.finals,
  }
}
