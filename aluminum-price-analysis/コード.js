function updateAluminumPriceSheet() {
  try {
    // 直近の営業日を取得（土曜日と日曜日を除く）
    const today = new Date();
    let mostRecentBusinessDay = new Date(today);

    const dayOfWeek = today.getDay();
    if (dayOfWeek === 0) { // 日曜日
      mostRecentBusinessDay.setDate(today.getDate() - 2); // 金曜日に戻す
    } else if (dayOfWeek === 6) { // 土曜日
      mostRecentBusinessDay.setDate(today.getDate() - 1); // 金曜日に戻す
    }

    // 最新の記事を見つける関数（変更なし）
    function findLatestArticle(baseUrl, marketType) {
      try {
        const response = UrlFetchApp.fetch(baseUrl);
        const html = response.getContentText();
        Logger.log(`${baseUrl} からHTMLを取得しました`);
        const $ = Cheerio.load(html);

        let marketPattern = marketType === "changjiang" ? "长江有色铝板价格行情" : "南海有色（灵通）铝锭价格";
        Logger.log(`検索市場パターン: ${marketPattern}`);

        const foundLinks = [];
        $('a').each(function() {
          const linkText = $(this).text().trim();
          const href = $(this).attr('href');

          if (href && linkText) {
            const isDateRangeArticle = linkText.includes('～') || linkText.includes('-') || linkText.includes('至');
            if (!isDateRangeArticle &&
                ((marketType === "changjiang" && linkText.includes("长江") && linkText.includes("铝板价格")) ||
                 (marketType === "nanhai" && linkText.includes("南海") && linkText.includes("铝锭价格")))) {
              let fullUrl = href.startsWith('/') ? `https://market.cnal.com${href}` : 
                           href.startsWith('http') ? href : `${baseUrl}/${href}`;
              const dateMatch = fullUrl.match(/\/(\d{4})\/(\d{2})-(\d{2})\//);
              if (dateMatch) {
                const urlYear = parseInt(dateMatch[1]);
                const urlMonth = parseInt(dateMatch[2]);
                const urlDay = parseInt(dateMatch[3]);
                const urlDate = new Date(urlYear, urlMonth - 1, urlDay);
                const chineseDateFormat = `${urlMonth}月${urlDay}日`;
                foundLinks.push({ text: linkText, url: fullUrl, date: urlDate, chineseDate: chineseDateFormat });
                Logger.log(`単日記事リンク: ${linkText} (${fullUrl})`);
              }
            }
          }
        });

        foundLinks.sort((a, b) => b.date - a.date);
        return foundLinks.length > 0 ? { url: foundLinks[0].url, title: foundLinks[0].text } : { url: baseUrl, title: "" };
      } catch (error) {
        Logger.log(`記事検索エラー: ${error.toString()}`);
        return null;
      }
    }

    // 価格データを抽出する関数（変更なし）
    function extractPriceData(url, marketType) {
      try {
        const response = UrlFetchApp.fetch(url);
        const html = response.getContentText();
        Logger.log(`HTMLコンテンツが正常に取得されました： ${url}`);
        const $ = Cheerio.load(html);

        const title = $('h1.tit').text().trim() || $('.tit').text().trim();
        Logger.log(`抽出されたタイトル: ${title}`);
        const dateTime = $('li.time').text().trim() || $('.time').text().trim();
        Logger.log(`抽出された日時: ${dateTime}`);
        let extractedDate = "";
        const dateMatch = title.match(/(\d+)月(\d+)日/);
        if (dateMatch) {
          const year = new Date().getFullYear();
          extractedDate = `${year}/${parseInt(dateMatch[1])}/${parseInt(dateMatch[2])}`;
          Logger.log(`タイトルから抽出された日付: ${extractedDate}`);
        }

        if (marketType === "changjiang") {
          let changjiangPrice = "";
          // テーブル内の価格を探す - HTMLテーブルの構造を詳細に解析
          const tables = $('table');
          Logger.log(`ページ内のテーブル数: ${tables.length}`);
          
          tables.each(function(tableIndex) {
            // テーブル全体の内容を確認
            const tableHtml = $(this).html();
            const tableText = $(this).text().trim();
            Logger.log(`テーブル${tableIndex + 1}のヘッダー: ${tableText.slice(0, 100)}`);
            
            // より詳細なテーブル構造のデバッグ情報
            const rows = $(this).find('tr');
            Logger.log(`テーブル${tableIndex + 1}の行数: ${rows.length}`);
            
            // 行ごとに詳細をログ出力
            rows.each(function(rowIndex) {
              const rowText = $(this).text().trim();
              const rowCells = $(this).find('th, td').map((_, el) => $(el).text().trim()).get();
              Logger.log(`行${rowIndex + 1}のテキスト: ${rowText.slice(0, 100)}`);
              Logger.log(`行${rowIndex + 1}のセル: [${rowCells.join('], [')}]`);
              
              // 「铝」が含まれる行かつ数字を含む行を特定（アルミニウムデータ行）
              if (rowText.includes('铝') && /\d{5}/.test(rowText)) {
                // 行のセルから直接日均价を取得する
                if (rowCells.length >= 3 && /^\d{5,6}$/.test(rowCells[2])) {
                  changjiangPrice = rowCells[2];
                  Logger.log(`アルミニウム行のセルから直接日均价を取得しました: ${changjiangPrice}`);
                  return false; // 内側のループを終了
                } else {
                  Logger.log(`アルミニウム行のセル構造: ${JSON.stringify(rowCells)}`);
                }
              }
            });
            
            // 上記で取得できなかった場合のバックアップ方法
            if (!changjiangPrice) {
              // テーブルから「铝」行を再検索し、別の方法で抽出
              rows.each(function(rowIndex) {
                const row = $(this);
                const rowText = row.text().trim();
                
                if (rowText.includes('铝') && /20\d{3}/.test(rowText)) {
                  // 行のテキストをセルに分割して直接取得を試みる
                  const cells = row.find('td');
                  Logger.log(`铝行のセル数: ${cells.length}`);
                  
                  // セルが正しく取得できていれば、日均价の位置（通常は3番目）から取得
                  cells.each(function(cellIndex) {
                    const cellText = $(this).text().trim();
                    Logger.log(`セル${cellIndex + 1}の内容: ${cellText}`);
                    
                    // 5桁の数字パターンにマッチし、価格範囲（20890-20930）ではないものを探す
                    if (/^20\d{3}$/.test(cellText) && !cellText.includes('-')) {
                      changjiangPrice = cellText;
                      Logger.log(`セルから日均价を直接取得しました: ${changjiangPrice}`);
                      return false;
                    }
                  });
                  
                  if (changjiangPrice) return false;
                }
              });
            }
            
            // ヘッダーと日均价の関係から抽出する方法
            if (!changjiangPrice && tableText.includes('日均价')) {
              // ヘッダー行を特定
              const headerRow = rows.find((_, el) => $(el).text().includes('日均价')).first();
              if (headerRow.length > 0) {
                Logger.log(`日均价を含むヘッダー行を見つけました`);
                
                // ヘッダーセルの位置を特定
                const headerCells = headerRow.find('th, td');
                let riJunJiaIndex = -1;
                
                headerCells.each(function(i) {
                  if ($(this).text().includes('日均价')) {
                    riJunJiaIndex = i;
                    Logger.log(`日均价カラムのインデックス: ${i}`);
                    return false;
                  }
                });
                
                // 「铝」を含む行を検索
                if (riJunJiaIndex !== -1) {
                  rows.each(function() {
                    const rowText = $(this).text();
                    if (rowText.includes('铝') && /20\d{3}/.test(rowText)) {
                      const cells = $(this).find('td');
                      if (cells.length > riJunJiaIndex) {
                        const cellValue = cells.eq(riJunJiaIndex).text().trim();
                        if (/^20\d{3}$/.test(cellValue)) {
                          changjiangPrice = cellValue;
                          Logger.log(`日均价カラムから直接値を取得しました: ${changjiangPrice}`);
                          return false;
                        }
                      }
                    }
                  });
                }
              }
            }
            
            // さらにバックアップの方法として、テーブルセルのHTMLソースを検査
            if (!changjiangPrice) {
              $('td').each(function() {
                const cellText = $(this).text().trim();
                // 20910のような5桁の数字で、価格範囲ではないものを探す
                if (/^20\d{3}$/.test(cellText) && !cellText.includes('-')) {
                  // 前後のセルをチェックしてアルミニウム行かどうか確認
                  const parentRow = $(this).parent('tr');
                  if (parentRow.text().includes('铝')) {
                    changjiangPrice = cellText;
                    Logger.log(`テーブルセルから直接20910形式の値を見つけました: ${changjiangPrice}`);
                    return false;
                  }
                }
              });
            }
          });

          // テーブルで見つからない場合、記事のテキスト内で特定のパターンを探す
          if (!changjiangPrice) {
            Logger.log(`テーブル検索で価格が見つからなかったため、コンテンツ全体を検索します`);
            const articleText = $('.article').text() || $('body').text();
            
            // パターン: 金属类别、价格区间、日均价パターンの抽出
            const tablePatternInText = articleText.match(/金属类别.*?价格区间.*?日均价.*?铝.*?(\d{5,6})-(\d{5,6}).*?(\d{5,6})/s);
            if (tablePatternInText && tablePatternInText[3]) {
              changjiangPrice = tablePatternInText[3];
              Logger.log(`コンテンツからテーブルパターンで日均价を抽出しました: ${changjiangPrice}`);
            } else {
              // パターン: "铝" + 価格範囲 + 日均价
              const aluminumPattern = articleText.match(/铝.*?(\d{5,6})-(\d{5,6}).*?(\d{5,6})/);
              if (aluminumPattern && aluminumPattern[3]) {
                changjiangPrice = aluminumPattern[3];
                Logger.log(`コンテンツからアルミニウムパターンで日均价を抽出しました: ${changjiangPrice}`);
              } else {
                // パターン: 直接"日均价"の後の数字を探す
                const riJunJiaMatch = articleText.match(/日均价[:：]?\s*(\d{5,6})/);
                if (riJunJiaMatch) {
                  changjiangPrice = riJunJiaMatch[1];
                  Logger.log(`コンテンツから「日均价」直接パターンで長江価格を見つけました: ${changjiangPrice}`);
                } else {
                  // パターン: "价格区间" と "日均价" の間の数値パターンを探す
                  const rangeAverageMatch = articleText.match(/价格区间[^]*?(\d{5,6})-(\d{5,6})[^]*?日均价[^]*?(\d{5,6})/);
                  if (rangeAverageMatch && rangeAverageMatch[3]) {
                    changjiangPrice = rangeAverageMatch[3];
                    Logger.log(`コンテンツから「价格区间-日均价」パターンで長江価格を見つけました: ${changjiangPrice}`);
                  } else {
                    // パターン: 特定のキーワードの近くにある数字を探す
                    const specificPattern = articleText.match(/长江.*?铝.*?价格.*?(\d{5,6})/);
                    if (specificPattern) {
                      changjiangPrice = specificPattern[1];
                      Logger.log(`コンテンツから特定パターンで長江価格を見つけました: ${changjiangPrice}`);
                    } else {
                      // 最終手段: 本文内の数字をより詳細に検索
                      const priceMatchesDetailed = articleText.match(/\b2\d{4}\b/g); // 2万台の数字を探す
                      if (priceMatchesDetailed && priceMatchesDetailed.length > 1) {
                        // 20890と20930の次の数字が20910の可能性が高い
                        changjiangPrice = priceMatchesDetailed[2] || priceMatchesDetailed[0];
                        Logger.log(`コンテンツから数字パターン詳細検索で長江価格を見つけました: ${changjiangPrice}`);
                      } else {
                        // 従来の方法
                        const priceMatches = articleText.match(/\b\d{5,6}\b/g);
                        changjiangPrice = priceMatches ? priceMatches[0] : "";
                        Logger.log(`コンテンツから長江価格を見つけました: ${changjiangPrice}`);
                      }
                    }
                  }
                }
              }
            }
          }
          
          return { title, dateTime, extractedDate, price: changjiangPrice };
        } else if (marketType === "nanhai") {
          let nanhaiPrice = "";
          let foundRow = "";
          
          // まず特定のパターンを持つ行を探す
          $('tr').each(function() {
            const rowText = $(this).text().trim();
            if ((rowText.includes("佛山") || rowText.includes("南海")) && 
                (rowText.includes("A00") || rowText.includes("铝锭") || rowText.includes("铝"))) {
              foundRow = rowText;
              Logger.log(`関連する行が見つかりました: ${rowText}`);
              
              // まず "21000-21100" のような範囲の後の価格を探す (修正されたパターン)
              const rangeMatch = rowText.match(/(\d{5})-(\d{5})(?:.*?)(\d{5})/);
              if (rangeMatch && rangeMatch[3]) {
                nanhaiPrice = rangeMatch[3];
                Logger.log(`南海価格値を正確に見つけました: ${nanhaiPrice}`);
                return false;
              }
              
              // 次に、A00価格が言及されている行から数値を抽出
              const a00Match = rowText.match(/A00.*?(\d{5,6})/i);
              if (a00Match) {
                nanhaiPrice = a00Match[1];
                Logger.log(`A00パターンから南海価格を見つけました: ${nanhaiPrice}`);
                return false;
              }
              
              // その行に含まれるすべての5-6桁の数字を探す
              const priceMatches = rowText.match(/\b\d{5,6}\b/g);
              if (priceMatches && priceMatches.length > 0) {
                // 最後の5-6桁の数字を価格として使用（多くの場合、最終価格が最後に表示される）
                nanhaiPrice = priceMatches[priceMatches.length - 1];
                Logger.log(`行から南海価格を見つけました: ${nanhaiPrice}`);
                return false;
              }
            }
          });
          
          // テーブル検索で見つからない場合、記事のテキスト内で特定のパターンを探す
          if (!nanhaiPrice) {
            Logger.log(`行検索で価格が見つからなかったため、コンテンツ全体を検索します`);
            const articleText = $('.article').text() || $('body').text();
            
            // 「南海」や「佛山」に近い5-6桁の数字を探す
            const specificPattern = articleText.match(/(?:南海|佛山).*?[A00|铝锭].*?(\d{5,6})/);
            if (specificPattern) {
              nanhaiPrice = specificPattern[1];
              Logger.log(`コンテンツから特定パターンで南海価格を見つけました: ${nanhaiPrice}`);
            } else {
              // 前回見つかった既知の価格から近い値を探す (フォールバック)
              const priceMatches = articleText.match(/\b\d{5,6}\b/g);
              if (priceMatches && priceMatches.length > 1) {
                nanhaiPrice = priceMatches[priceMatches.length - 1]; // 最後の5-6桁の数字を使用
                Logger.log(`コンテンツから南海価格を見つけました: ${nanhaiPrice}`);
              }
            }
          }
          
          return { title, dateTime, extractedDate, price: nanhaiPrice };
        }
        return null;
      } catch (error) {
        Logger.log(`データ抽出エラー: ${error.toString()}`);
        return { title: "", dateTime: "", extractedDate: "", price: "" };
      }
    }

    const changjiangBaseUrl = "https://market.cnal.com/changjiang";
    const nanhaiBaseUrl = "https://market.cnal.com/nanhai";

    const changjiangData = findLatestArticle(changjiangBaseUrl, "changjiang");
    const nanhaiData = findLatestArticle(nanhaiBaseUrl, "nanhai");

    if (!changjiangData || !nanhaiData) throw new Error("最新価格記事が見つかりませんでした");

    const changjiangPriceData = extractPriceData(changjiangData.url, "changjiang");
    const nanhaiPriceData = extractPriceData(nanhaiData.url, "nanhai");

    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = spreadsheet.getSheetByName("当天铝锭价格");
    if (!sheet) throw new Error("シート '当天铝锭价格' が見つかりません");

    sheet.insertRowAfter(2);
    let dateStr = changjiangPriceData.extractedDate || nanhaiPriceData.extractedDate || 
                  (mostRecentBusinessDay.getFullYear() + "/" + (mostRecentBusinessDay.getMonth() + 1) + "/" + mostRecentBusinessDay.getDate());

    sheet.getRange("A3").setValue(dateStr);
    sheet.getRange("B3").setValue(changjiangPriceData.price);
    sheet.getRange("J3").setValue(nanhaiPriceData.price);
    sheet.getRange("C4:H4").copyTo(sheet.getRange("C3:H3"), {contentsOnly: false});
    sheet.getRange("K4:P4").copyTo(sheet.getRange("K3:P3"), {contentsOnly: false});

    const comparisonSheet = spreadsheet.getSheetByName("供应商资料及最新铝价与旧价对比");
    if (comparisonSheet) {
      comparisonSheet.getRange("J3").setFormula("='当天铝锭价格'!A3");
      comparisonSheet.getRange("K3").setFormula("='当天铝锭价格'!B3");
      comparisonSheet.getRange("M3").setFormula("='当天铝锭价格'!J3");
      comparisonSheet.getRange("J4").setFormula("='当天铝锭价格'!A4");
      comparisonSheet.getRange("K4").setFormula("='当天铝锭价格'!B4");
      comparisonSheet.getRange("M4").setFormula("='当天铝锭价格'!J4");

      // 数式をsetFormulaで直接設定
      comparisonSheet.getRange("J8").setFormula("=XLOOKUP(DATE(YEAR(J3),MONTH(J3)-3,DAY(J3)),'当天铝锭价格'!A:A,'当天铝锭价格'!A:A,\"\",0,1)");
      comparisonSheet.getRange("J9").setFormula("=INDEX('当天铝锭价格'!A:A,MATCH(MINIFS('当天铝锭价格'!A:A,'当天铝锭价格'!A:A,\">=\"&DATE(2025,1,1)),'当天铝锭价格'!A:A,0))");
      comparisonSheet.getRange("K8").setFormula("=XLOOKUP(DATE(YEAR(J3),MONTH(J3)-3,DAY(J3)),'当天铝锭价格'!A:A,'当天铝锭价格'!B:B,\"\",0,1)");
      comparisonSheet.getRange("K9").setFormula("=INDEX('当天铝锭价格'!B:B,MATCH(MINIFS('当天铝锭价格'!A:A,'当天铝锭价格'!A:A,\">=\"&DATE(2025,1,1)),'当天铝锭价格'!A:A,0))");
      comparisonSheet.getRange("L8").setFormula("=(K3-K8)/K8");
      comparisonSheet.getRange("L9").setFormula("=(K3-K9)/K9");
      comparisonSheet.getRange("M8").setFormula("=VLOOKUP(J8,'当天铝锭价格'!A:J,10,FALSE)");
      comparisonSheet.getRange("M9").setFormula("=VLOOKUP(J9,'当天铝锭价格'!A:J,10,FALSE)");
      comparisonSheet.getRange("N8").setFormula("=(M3-M8)/M8");
      comparisonSheet.getRange("N9").setFormula("=(M3-M9)/M9");

      const now = new Date();
      const updateInfo = `${now.getFullYear()}年${now.getMonth() + 1}月${now.getDate()}日 ${now.getHours()}:${now.getMinutes() < 10 ? '0' + now.getMinutes() : now.getMinutes()} 已更新\n${nanhaiData.title} (${nanhaiData.url}),\n${changjiangData.title} (${changjiangData.url})`;
      comparisonSheet.getRange("I10").setValue(updateInfo).setHorizontalAlignment("left");
    }

    SpreadsheetApp.flush();
    Utilities.sleep(5000); // 計算完了を待機

    // Excelエクスポートとメール送信
    const exportUrl = `https://docs.google.com/spreadsheets/d/${spreadsheet.getId()}/export?format=xlsx`;
    const params = { method: "get", headers: {"Authorization": "Bearer " + ScriptApp.getOAuthToken()}, muteHttpExceptions: true };
    const response = UrlFetchApp.fetch(exportUrl, params);
    const formattedDateForFilename = dateStr.replace(/\//g, '-');
    const blob = response.getBlob().setName(`供应商资料及最新铝价分析表_${formattedDateForFilename}.xlsx`);

    const dateParts = dateStr.split("/");
    const formattedDate = `${dateParts[0]}年${dateParts[1]}月${dateParts[2]}日`;
    const recipient = "bestinksalesman@gmail.com, hirokisakon@kirii.com.hk";
    const subject = `供应商资料及最新铝价分析表更新 - ${formattedDate}`;
    const body = `${formattedDate}供应商资料及最新铝价分析表已经更新。\n\n更新内容:\n- 長江价格: ${changjiangPriceData.price} 元/噸\n- 南海价格: ${nanhaiPriceData.price} 元/噸\n请查看供应商资料及最新铝价分析表。\nhttps://docs.google.com/spreadsheets/d/1RQb5fBTipFZPslbG60vP46DJZ8ZD9D7a7_eaKw718nM/edit?gid=112913047#gid=112913047\n\n如过国内不能参阅如上link请各自下载附件excel表\n请查看附件excel供应商资料及最新铝价分析表。\n\n这由于从佐近电邮自动发信息过来的。`;

    GmailApp.sendEmail(recipient, subject, body, { attachments: [blob], name: "供应商资料及最新铝价分析表自动更新" });
    Logger.log(`メール送信完了: ${recipient}`);

    return "すべての更新が完了しました";
  } catch (e) {
    Logger.log("エラー: " + e.toString());
    return "エラー: " + e.toString();
  }
}

/**
 * Gmailの添付ファイル（Excel）を処理し、指定のスプレッドシートにデータを転記する関数
 */
function processGmailAttachment() {
  const targetSpreadsheetId = "1RQb5fBTipFZPslbG60vP46DJZ8ZD9D7a7_eaKw718nM";
  const targetSheetName = "镀锌板卷价格";
  const searchSubject = "Today Mysteeldata";
  const excelSheetName = "日价格";

  try {
    console.log("processGmailAttachment の実行を開始します");

    // 件名で検索し、最新のメールを取得（既読/未読に関係なく）
    const threads = GmailApp.search(`subject:"${searchSubject}" newer_than:1d`, 0, 1);
    console.log(`検索条件に一致するスレッド数: ${threads.length}`);

    if (threads.length === 0) {
      console.log("対象のメールが見つかりませんでした。処理を終了します。");
      return;
    }

    // 最新のメッセージを取得
    const latestMessage = threads[0].getMessages()[threads[0].getMessageCount() - 1];
    console.log(`処理するメール - 件名: ${latestMessage.getSubject()}`);
    console.log(`処理するメール - 日時: ${latestMessage.getDate()}`);

    // 添付ファイルを確認
    const attachments = latestMessage.getAttachments();
    console.log(`添付ファイル数: ${attachments.length}`);

    let excelAttachment = null;
    for (let i = 0; i < attachments.length; i++) {
      const attachment = attachments[i];
      const attachmentName = attachment.getName();
      console.log(`添付ファイル ${i + 1}: ${attachmentName}`);

      // Excelファイルの検索条件を拡張
      if (attachmentName.endsWith('.xls') || attachmentName.endsWith('.xlsx') || 
          attachmentName.includes('Mysteel') || attachmentName.includes('价格')) {
        excelAttachment = attachment;
        console.log(`処理対象のExcelファイルを見つけました: ${attachmentName}`);
        break;
      }
    }

    if (!excelAttachment) {
      console.log("処理対象のExcelファイルが見つかりませんでした。");
      return;
    }

    // --- Google Sheets API を使用してExcelデータを読み取る ---
    // 1. 一時的にGoogle Driveにファイルを保存
    const tempFolder = DriveApp.getRootFolder(); // ルートフォルダを使用（必要に応じて変更）
    const tempFile = tempFolder.createFile(excelAttachment);
    const tempFileId = tempFile.getId();
    Logger.log(`Excelファイルを一時的にDriveに保存しました: ${tempFile.getName()} (ID: ${tempFileId})`);

    // 2. DriveファイルをGoogle Sheets形式に変換 (Sheets APIを使用)
    // この操作には Drive API v2 が必要です。GASエディタの「サービス」で「Drive API」を追加し、バージョンをv2にしてください。
    const convertedSheet = Drive.Files.copy({ mimeType: MimeType.GOOGLE_SHEETS }, tempFileId);
    const convertedSheetId = convertedSheet.id;
    Logger.log(`ファイルをGoogle Sheets形式に変換しました (ID: ${convertedSheetId})`);

    // 3. 変換されたスプレッドシートを開く
    let sourceSpreadsheet;
    let sourceSheet;
    try {
      sourceSpreadsheet = SpreadsheetApp.openById(convertedSheetId);
      sourceSheet = sourceSpreadsheet.getSheetByName(excelSheetName);

      if (!sourceSheet) {
        // 指定されたシート名が見つからない場合、最初のシートを使用するフォールバック
        Logger.log(`Excel内にシート名「${excelSheetName}」が見つかりません。最初のシートを使用します。`);
        const allSheets = sourceSpreadsheet.getSheets();
        if (allSheets.length > 0) {
          sourceSheet = allSheets[0];
          Logger.log(`フォールバックとしてシート「${sourceSheet.getName()}」を使用します。`);
        } else {
          throw new Error("変換されたスプレッドシートにシートが見つかりません。");
        }
      } else {
         Logger.log(`読み取り元シートを取得しました: ${sourceSheet.getName()}`);
      }
    } catch (openError) {
       Logger.log(`変換されたスプレッドシートを開く際にエラーが発生しました: ${openError}`);
       // 一時ファイルを削除
       try { DriveApp.getFileById(tempFileId).setTrashed(true); } catch(e) { Logger.log(`一時ファイル削除エラー(tempFileId): ${e}`);}
       try { DriveApp.getFileById(convertedSheetId).setTrashed(true); } catch(e) { Logger.log(`一時ファイル削除エラー(convertedSheetId): ${e}`);}
       // メールを既読にする
       try { latestMessage.markRead(); Logger.log("エラー発生後、メールを既読にしました。"); } catch(e) { Logger.log(`メール既読化エラー: ${e}`);}
       throw openError; // エラーを再スロー
    }


    // 4. データを取得
    const sourceData = sourceSheet.getDataRange().getValues();
    Logger.log(`読み取り元シートから ${sourceData.length} 行、${sourceData[0] ? sourceData[0].length : 0} 列のデータを取得しました。`);

    // 5. 一時ファイルを削除
    // Drive API v2 を使用しているため、DriveAppではなくDriveサービスで削除
    try { Drive.Files.remove(tempFileId); Logger.log(`一時ファイル (ID: ${tempFileId}) を削除しました。`); } catch(e) { Logger.log(`一時ファイル削除エラー(tempFileId): ${e}`);}
    try { Drive.Files.remove(convertedSheetId); Logger.log(`変換後ファイル (ID: ${convertedSheetId}) を削除しました。`); } catch(e) { Logger.log(`一時ファイル削除エラー(convertedSheetId): ${e}`);}
    // --- 読み取り完了 ---

    // 転記先のスプレッドシートとシートを取得
    const targetSpreadsheet = SpreadsheetApp.openById(targetSpreadsheetId);
    const targetSheet = targetSpreadsheet.getSheetByName(targetSheetName);

    if (!targetSheet) {
      throw new Error(`転記先のスプレッドシートにシート名「${targetSheetName}」が見つかりません。`);
    }
    Logger.log(`転記先シートを取得しました: ${targetSheet.getName()}`);

    // 転記先シートの既存データをクリア
    targetSheet.clearContents();
    Logger.log("転記先シートの既存データをクリアしました。");

    // データを転記先に貼り付け
    if (sourceData.length > 0 && sourceData[0].length > 0) {
      targetSheet.getRange(1, 1, sourceData.length, sourceData[0].length).setValues(sourceData);
      Logger.log(`データを転記先シートに貼り付けました。`);
    } else {
      Logger.log("読み取るデータがありませんでした。");
    }

    // 処理済みのメールを既読にする
    latestMessage.markRead();
    Logger.log("メールを既読にしました。");

    SpreadsheetApp.flush(); // 変更を即時反映

    // --- 完了ログをシートに書き込む ---
    try {
      const comparisonSheet = targetSpreadsheet.getSheetByName("供应商资料及最新铝价与旧价对比");
      if (comparisonSheet) {
        const now = new Date();
        const formattedDateTime = Utilities.formatDate(now, Session.getScriptTimeZone(), "yyyy年MM月dd日 HH:mm");
        const logMessage = `${formattedDateTime} 已更新\n收集信息源：我的钢铁 https://price.mysteel.com/#/price-search?breedId=1-1`;
        comparisonSheet.getRange("I21").setValue(logMessage).setVerticalAlignment("top").setWrap(true); // 縦位置を上揃えにし、折り返しを有効にする
        Logger.log(`完了ログをシート「供应商资料及最新铝价与旧价对比」のセルI21に書き込みました。`);
      } else {
        Logger.log("シート「供应商资料及最新铝价与旧价对比」が見つからなかったため、完了ログを書き込めませんでした。");
      }
    } catch (logError) {
      Logger.log(`完了ログの書き込み中にエラーが発生しました: ${logError.toString()}`);
    }
    // --- 完了ログ書き込み終了 ---

    console.log("処理が正常に完了しました");
    
    // 処理結果をメールで通知
    const now = new Date();
    GmailApp.sendEmail(
      Session.getEffectiveUser().getEmail(),
      "データ更新完了通知",
      `処理が完了しました。\n` +
      `更新日時: ${now.toLocaleString()}\n` +
      `処理したメール件名: ${latestMessage.getSubject()}\n` +
      `処理したファイル: ${excelAttachment.getName()}`
    );

  } catch (e) {
    console.error(`エラーが発生しました: ${e.toString()}`);
    console.error(`スタックトレース: ${e.stack}`);
    
    // エラー通知メールの送信
    GmailApp.sendEmail(
      Session.getEffectiveUser().getEmail(),
      "データ更新エラー通知",
      `処理中にエラーが発生しました。\n` +
      `エラー内容: ${e.toString()}\n\n` +
      `スタックトレース:\n${e.stack}`
    );
    
    throw e;
  }
}

// トリガー設定用のヘルパー関数
function createTimeDrivenTrigger() {
  // 既存のトリガーを削除
  const triggers = ScriptApp.getProjectTriggers();
  triggers.forEach(trigger => {
    if (trigger.getHandlerFunction() === 'processGmailAttachment') {
      ScriptApp.deleteTrigger(trigger);
    }
  });
  
  // 新しいトリガーを作成（5分おきに実行）
  ScriptApp.newTrigger('processGmailAttachment')
    .timeBased()
    .everyMinutes(5)
    .create();
    
  console.log('トリガーが正常に設定されました');
}
