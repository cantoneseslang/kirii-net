function loadJyutpingData() {
  var fileId = '197nUgJXzsRDHl0PG8HjhNjNPaoml4R7V';
  var file = DriveApp.getFileById(fileId);
  var content = file.getBlob().getDataAsString();
  
  var rows = Utilities.parseCsv(content, '\t');
  var jyutpingDict = {};
  rows.forEach(function(row) {
    if (row.length >= 3) {
      var char = row[0];
      var jyutping = row[2];
      if (!(char in jyutpingDict)) {
        jyutpingDict[char] = [];
      }
      jyutpingDict[char].push(jyutping);
    }
  });
  return jyutpingDict;
}

function loadJyutpingToKatakanaDict() {
  var fileId = '1Btyr8dx-ECVfQQtt8nK2HbTMSX9Wt-mD';
  var file = DriveApp.getFileById(fileId);
  var content = file.getBlob().getDataAsString();
  return JSON.parse(content);
}

function findAllJyutpingsAndKatakanaForPhrase(phrase) {
  var jyutpingDict = loadJyutpingData();
  var katakanaDict = loadJyutpingToKatakanaDict();

  var resultForPhrase = [];
  var skipCharacters = new Set([' ', '，', '。', '「', '」', '＜', '＞', '（', '）', '-', '@', '[', ']','|','｜', '?',  '!','/', '、']);
  
  for (var i = 0; i < phrase.length; i++) {
    var char = phrase[i];
    if (skipCharacters.has(char)) {
      resultForPhrase.push([char, [char], [char]]);
    } else {
      var jyutpings = jyutpingDict[char] || ["Not found"];
      var katakanas = [];
      jyutpings.forEach(function(jyutping) {
        var jyutpingBase = jyutping.replace(/\d+$/, '');
        var tone = jyutping.match(/\d+$/);
        var katakana = katakanaDict[jyutpingBase] || "Not found";
        if (katakana !== "Not found") {
          katakanas.push(katakana + (tone ? tone[0] : ''));
        } else {
          katakanas.push("Not found");
        }
      });
      resultForPhrase.push([char, jyutpings, katakanas]);
    }
  }
  return resultForPhrase;
}

function translateJapaneseToCantonese(phrase) {
  var apiKey = PropertiesService.getScriptProperties().getProperty('OPENAI_API_KEY');
  var url = 'https://api.openai.com/v1/chat/completions';
  
  var payload = {
    model: "gpt-4o",
    messages: [
      {"role": "system", "content": "You are a translator that translates Japanese to Cantonese. Provide a natural and conversational Cantonese translation. Use spoken Cantonese (口語), and avoid formal or written expressions. Provide only the translated text without any additional symbols, punctuation marks, or quotation marks."},
      {"role": "user", "content": `Translate the following Japanese text to conversational Cantonese: ${phrase}`}
    ]
  };
  
  var options = {
    method: 'post',
    contentType: 'application/json',
    headers: {
      'Authorization': 'Bearer ' + apiKey
    },
    payload: JSON.stringify(payload)
  };

  try {
    var response = UrlFetchApp.fetch(url, options);
    var jsonResponse = JSON.parse(response.getContentText());
    var translatedText = jsonResponse.choices[0].message.content;
    
    // 不要な記号を削除
    var skipCharacters = new Set([' ', '，', '。', '「', '」', '＜', '＞', '（', '）', '-', '@', '[', ']', '|', '｜', '?', '!', '/', '、', '！', '？', '：', '；', '：', '；', '・', '…', '『', '』', '《', '》', '〈', '〉', '【', '】', '〔', '〕', '＝', '＋', '－', '＊', '／', '＼', '～', '．', '，']);
    translatedText = translatedText.split('').filter(char => !skipCharacters.has(char)).join('');
    
    return translatedText.trim();
  } catch (error) {
    Logger.log('Translation error: ' + error);
    return 'Translation error occurred';
  }
}

function doGet() {
  return HtmlService.createHtmlOutputFromFile('Page');
}

function processPhrase(phrase) {
  var results = findAllJyutpingsAndKatakanaForPhrase(phrase);
  var formattedResult = formatResults(results);
  return formattedResult;
}

function formatResults(results) {
  var jyutpings = [];
  var katakanas = [];

  results.forEach(function(result) {
    var formattedJyutpings = result[1].map((jyutping, index) => index === 0 ? jyutping : `(${jyutping})`).join(", ");
    jyutpings.push(formattedJyutpings);

    var formattedKatakanas = result[2].map((katakana, index) => index === 0 ? katakana : `(${katakana})`).join(", ");
    katakanas.push(formattedKatakanas);
  });

  var output = "検索文字：" + results.map(result => result[0]).join("") + "<br>" +
               "<span class='highlighted'>粤ピン：" + jyutpings.join("・") + "</span><br>" +
               "<span class='highlighted'>スラング式カタカナ：" + katakanas.join("・") + "</span><br>";
  return output;
}

function translatePhrase(phrase) {
  const apiKey = PropertiesService.getScriptProperties().getProperty('API_KEY');
  const url = `https://translation.googleapis.com/language/translate/v2?key=${apiKey}`;
  
  const response = UrlFetchApp.fetch(url, {
    method: "post",
    contentType: "application/json",
    payload: JSON.stringify({
      q: phrase,
      source: "zh",
      target: "ja",
      format: "text"
    })
  });
  
  const json = JSON.parse(response.getContentText());
  return json.data.translations[0].translatedText;
}

function textToSpeech(text, languageCode = 'yue-Hant-HK') {
  const apiKey = PropertiesService.getScriptProperties().getProperty('API_KEY');
  const url = `https://texttospeech.googleapis.com/v1/text:synthesize?key=${apiKey}`;
  const payload = {
    input: { text: text },
    voice: { languageCode: languageCode, ssmlGender: 'NEUTRAL' },
    audioConfig: { audioEncoding: 'MP3' }
  };

  const response = UrlFetchApp.fetch(url, {
    method: 'post',
    contentType: 'application/json',
    payload: JSON.stringify(payload)
  });

  const json = JSON.parse(response.getContentText());
  const audioContent = json.audioContent;
  return Utilities.base64Decode(audioContent);
}

function saveAudioToDrive(audioBytes, fileName) {
  const blob = Utilities.newBlob(audioBytes, 'audio/mpeg', fileName);
  const file = DriveApp.createFile(blob);
  file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
  return file.getUrl();
}

function processTextToSpeech(text) {
  const audioBytes = textToSpeech(text);
  const base64Audio = Utilities.base64Encode(audioBytes);
  return base64Audio;
}

function processPhrase(phrase) {
  var results = findAllJyutpingsAndKatakanaForPhrase(phrase);

  var jyutpingArray = [];
  var jyutpingMultiArray = [];
  var katakanaArray = [];
  var katakanaMultiArray = [];

  for (var i = 0; i < results.length; i++) {
    var result = results[i];
    var character = result[0];
    var jyutpings = result[1];
    var katakanas = result[2];

    jyutpingArray.push(jyutpings[0]);
    jyutpingMultiArray.push(jyutpings.length > 1 ? jyutpings.slice(1).join("・") : "無し");
    katakanaArray.push(katakanas[0]);
    katakanaMultiArray.push(katakanas.length > 1 ? katakanas.slice(1).join("・") : "無し");
  }

  var jyutpingResult = "<span class='highlighted'>" + jyutpingArray.join("・") + "</span>";
  var jyutpingMultiResult = jyutpingMultiArray.join("・");
  var katakanaResult = "<span class='highlighted'>" + katakanaArray.join("・") + "</span>";
  var katakanaMultiResult = katakanaMultiArray.join("・");

  var translationGoogle = translatePhrase(phrase);
  var base64Audio = processTextToSpeech(phrase);

//ここに結果の太文字設定が存在しているので変更する時はここを変える
var formattedResult = "<div id='result'>";
formattedResult += "<p>検索文字：" + phrase + "</p>";

// 「粤ピン」とその結果全体に強調を適用
formattedResult += "<p><span style='font-weight: bold; text-decoration: underline;'>粤ピン： " + jyutpingResult + "</span></p>";

// 「スラング式カタカナ」とその結果全体に強調を適用
formattedResult += "<p><span style='font-weight: bold; text-decoration: underline;'>スラング式カタカナ： " + katakanaResult + "</span></p>";

// 他の部分（強調なし）
formattedResult += "<p>多音時粤ピン： " + jyutpingMultiResult + "</p>";
formattedResult += "<p>多音時カタカナ： " + katakanaMultiResult + "</p>";

// Google翻訳など他の情報
formattedResult += "</div><div id='additionalInfo'>";
formattedResult += "<p>Google 翻訳： " + translationGoogle + "</p>";
formattedResult += "</div>";

// 音声再生部分の生成
formattedResult += "<div id='audioPlayer' style='width: 100%; margin: 15px 0;'>";
formattedResult += "広東語音声: <br>";
formattedResult += "<div style='display: flex; flex-direction: column; gap: 10px; margin-top: 10px;'>";

// 各プレーヤーにユニークなIDを付与する
const uniqueId = Math.random().toString(36).substr(2, 9); // ユニークなID生成
formattedResult += `<audio id='audio-${uniqueId}' controls controlsList='nodownload nofullscreen noremoteplayback' style='width: 100%; height: 100px;'><source src='data:audio/mp3;base64,${base64Audio}' type='audio/mp3'></audio>`;

// カスタムの再生速度コントロール
formattedResult += "<div style='display: flex; align-items: center; gap: 10px; margin-top: 5px;'>";
formattedResult += `<label for='playbackSpeed-${uniqueId}' style='font-size: 24px;'>カスタム再生速度: </label>`;
formattedResult += `<select id='playbackSpeed-${uniqueId}' style='padding: 24px; font-size: 24px; border-radius: 8px; border: 1px solid #ccc; width: auto;'>`;
formattedResult += "<option value='0.5'>0.5x</option>";
formattedResult += "<option value='0.75'>0.75x</option>";
formattedResult += "<option value='1' selected>1x</option>";
formattedResult += "<option value='1.25'>1.25x</option>";
formattedResult += "<option value='1.5'>1.5x</option>";
formattedResult += "<option value='2'>2x</option>";
formattedResult += "</select>";
formattedResult += "</div>";

// スクリプト部分（audio と select の関連付けを明確に）
formattedResult += "<script>";
formattedResult += "window.addEventListener('load', function() {";
formattedResult += `  const speedSelect = document.getElementById('playbackSpeed-${uniqueId}');`;
formattedResult += `  const audio = document.getElementById('audio-${uniqueId}');`;
formattedResult += "  if (speedSelect && audio) {";
formattedResult += "    // セレクトボックスの変更時に再生速度を変更するイベントリスナーを設定";
formattedResult += "    speedSelect.addEventListener('change', function() {";
formattedResult += "      audio.playbackRate = parseFloat(this.value);";
formattedResult += "    });";
formattedResult += "    // 音声が再生されるたびに選択された速度を適用するためのイベントリスナー";
formattedResult += "    audio.addEventListener('play', function() {";
formattedResult += "      audio.playbackRate = parseFloat(speedSelect.value);";
formattedResult += "    });";
formattedResult += "  }";
formattedResult += "});";
formattedResult += "</script>";

// 最後にreturn
return formattedResult;
}

function translateAndProcessPhrase(phrase) {
  var translatedPhrase = translateJapaneseToCantonese(phrase);
  var processedResult = processPhrase(translatedPhrase);
  
  return {
    translatedPhrase: translatedPhrase,
    processedResult: processedResult
  };
}