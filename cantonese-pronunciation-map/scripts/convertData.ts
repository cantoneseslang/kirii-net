import fs from 'fs';
import path from 'path';

// 色の定義を読み込み
const consonantColors = {
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
};

// JSONデータを読み込み
const rawData = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/cantoneseData.json'), 'utf8'));

// cells オブジェクトを作成
const cells = {};

// データを変換
rawData.forEach(item => {
  const { jyutping, kanji, katakana } = item;
  
  // 子音と母音を分離
  let initial = '';
  let final = jyutping;
  
  // 子音を特定
  const initialConsonants = ["b", "p", "m", "f", "d", "t", "n", "l", "g", "gw", "k", "kw", "ng", "h", "z", "c", "s", "j", "w"];
  for (const consonant of initialConsonants) {
    if (jyutping.startsWith(consonant)) {
      initial = consonant;
      final = jyutping.substring(consonant.length);
      break;
    }
  }

  // cells オブジェクトに追加
  if (!cells[final]) {
    cells[final] = {};
  }
  
  if (initial) {
    cells[final][initial] = {
      jyutping,
      kanji,
      katakana,
      color: consonantColors[initial] || "#2f9e9a"
    };
  }
});

// 結果を出力
const output = `// このファイルは自動生成されました
export const cells = ${JSON.stringify(cells, null, 2)};`;

fs.writeFileSync(path.join(__dirname, '../data/generatedCells.ts'), output);

console.log('変換が完了しました。'); 