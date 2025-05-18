"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { FileUpIcon, CheckCircle2, XCircle, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"

// Define the type for the extracted values
export interface ExtractedValues {
  projectName?: string;
  projectDetail?: string;
  calculationDate?: string;
  author?: string;
  yieldStrength?: number;
  elasticModulus?: number;
  materialFactor?: number;
  studType?: string;
  webHeight?: number;
  flangeWidth?: number;
  thickness?: number;
  bearingLength?: number;
  momentOfInertia?: number;
  effectiveSectionModulus?: number;
  span?: number;
  tributaryWidth?: number;
  designLoad?: number;
  loadHeight?: number;
  loadFactor?: number;
}

interface FileUploadParserProps {
  lang: string;
}

export default function FileUploadParser({ lang }: FileUploadParserProps) {
  const router = useRouter();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState("");
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [isApiProcessing, setIsApiProcessing] = useState(false);
  const [extractedValues, setExtractedValues] = useState<ExtractedValues | null>(null);
  const [status, setStatus] = useState<'idle' | 'uploading' | 'processing' | 'done' | 'error'>('idle');
  const [fileId, setFileId] = useState<string | null>(null);

  // Get the appropriate text based on language
  const getText = () => {
    if (lang === 'ja') {
      return {
        title: "ファイルアップロード",
        description: "書類をアップロードして、入力値を自動的に設定します",
        button: "ファイルを選択",
        uploading: "処理中...",
        processing: "APIで処理中...",
        success: "データを正常に抽出しました！",
        error: "エラーが発生しました："
      };
    } else if (lang === 'zh-HK') {
      return {
        title: "檔案上傳",
        description: "上傳文檔以自動設置輸入值",
        button: "選擇檔案",
        uploading: "上傳中...",
        processing: "API處理中...",
        success: "成功提取資料！",
        error: "發生錯誤："
      };
    } else {
      return {
        title: "File Upload",
        description: "Upload a document to automatically set input values",
        button: "Choose File",
        uploading: "Uploading...",
        processing: "Processing with API...",
        success: "Data extracted successfully!",
        error: "An error occurred:"
      };
    }
  };

  const text = getText();

  // Function to parse text and extract values from the document
  const parseDocumentText = (text: string): ExtractedValues => {
    console.log("Parsing extracted text:", text);
    const values: ExtractedValues = {};
    
    // Extract project name
    const projectNameMatch = text.match(/Job\s*(?:No)?[:\s]+([^\r\n]+)/i) || 
                            text.match(/項目名稱\s*[:：]\s*([^\n]+)/i) ||
                            text.match(/Job\s*[:：]\s*([^\n]+)/i);
    if (projectNameMatch && projectNameMatch[1]) {
      values.projectName = projectNameMatch[1].trim();
    }
    
    // Extract project detail/subject
    const projectDetailMatch = text.match(/Subject\s*[:：]\s*([^\r\n]+)/i) ||
                               text.match(/詳細信息\s*[:：]\s*([^\n]+)/i) ||
                               text.match(/C\s+\d+x\d+x\d+\.\d+t\/\d+H\/\d+o\.c\./i);
    if (projectDetailMatch && projectDetailMatch[1]) {
      values.projectDetail = projectDetailMatch[1].trim();
    } else if (projectDetailMatch) {
      values.projectDetail = projectDetailMatch[0].trim();
    }
    
    // Extract calculation date
    const dateMatch = text.match(/Date\s*[:：]\s*([^\r\n]+)/i) ||
                     text.match(/計算日期\s*[:：]\s*([^\n]+)/i) ||
                     text.match(/(\d{1,2})[-\/](\w+|[0-9]{1,2})[-\/](\d{4})/i);
    if (dateMatch && dateMatch[1]) {
      values.calculationDate = dateMatch[1].trim();
    }
    
    // Extract author
    const authorMatch = text.match(/Prep\.\s*[:：]\s*([^\r\n]+)/i) ||
                        text.match(/作者\s*[:：]\s*([^\n]+)/i) ||
                        text.match(/TC/i);
    if (authorMatch && authorMatch[1]) {
      values.author = authorMatch[1].trim();
    } else if (authorMatch) {
      values.author = authorMatch[0].trim();
    }
    
    // Extract yield strength
    const yieldMatch = text.match(/降伏強度[^:：]*[:：]\s*(\d+(?:\.\d+)?)\s*MPa/i);
    if (yieldMatch && yieldMatch[1]) {
      values.yieldStrength = parseFloat(yieldMatch[1]);
    }
    
    // Extract elastic modulus
    const modulusMatch = text.match(/彈性模量|弾性係数|Elastic Modulus[^:：]*[:：]\s*(\d+(?:\.\d+)?)\s*MPa/i);
    if (modulusMatch && modulusMatch[1]) {
      values.elasticModulus = parseFloat(modulusMatch[1]);
    }
    
    // Extract material factor
    const materialFactorMatch = text.match(/材料係數|材料係数|Material Factor[^:：]*[:：]\s*(\d+(?:\.\d+)?)/i);
    if (materialFactorMatch && materialFactorMatch[1]) {
      values.materialFactor = parseFloat(materialFactorMatch[1]);
    }
    
    // Extract stud type
    const studTypeMatch = text.match(/KIRII steel C-channel\s+(\d+\s*x\s*\d+\s*x\s*\d+\.\d+\s*(?:mm|t))/i) ||
                          text.match(/立筋類型|スタッド種類|Stud Type\s*[:：]\s*([^\n]+)/i) ||
                          text.match(/C\s*(\d+x\d+x\d+\.\d+t)/i);
    if (studTypeMatch && studTypeMatch[1]) {
      const studType = studTypeMatch[1].trim();
      values.studType = studType.replace(/\s+/g, '').replace('mm', 't');
    }
    
    // Extract web height
    const webHeightMatch = text.match(/腹板高度|ウェブ高さ|Web Height\s*[:：]\s*(\d+(?:\.\d+)?)\s*mm/i) ||
                          text.match(/\d+\s*x\s*\d+\s*x\s*\d+\.\d+/i);
    if (webHeightMatch && webHeightMatch[1]) {
      values.webHeight = parseFloat(webHeightMatch[1]);
    } else if (webHeightMatch) {
      // Extract dimensions from format like C75x45x0.8
      const dimensions = webHeightMatch[0].match(/(\d+)\s*x\s*(\d+)\s*x\s*(\d+\.\d+)/i);
      if (dimensions) {
        values.webHeight = parseFloat(dimensions[1]);
        values.flangeWidth = parseFloat(dimensions[2]);
        values.thickness = parseFloat(dimensions[3]);
      }
    }
    
    // Extract flange width if not already extracted
    if (!values.flangeWidth) {
      const flangeWidthMatch = text.match(/翼緣寬度|フランジ幅|Flange Width\s*[:：]\s*(\d+(?:\.\d+)?)\s*mm/i);
      if (flangeWidthMatch && flangeWidthMatch[1]) {
        values.flangeWidth = parseFloat(flangeWidthMatch[1]);
      }
    }
    
    // Extract thickness if not already extracted
    if (!values.thickness) {
      const thicknessMatch = text.match(/厚度|厚さ|Thickness\s*[:：]\s*(\d+(?:\.\d+)?)\s*mm/i);
      if (thicknessMatch && thicknessMatch[1]) {
        values.thickness = parseFloat(thicknessMatch[1]);
      }
    }
    
    // Extract bearing length
    const bearingLengthMatch = text.match(/支承長度|支持長さ|Bearing Length\s*[:：]\s*(\d+(?:\.\d+)?)\s*mm/i);
    if (bearingLengthMatch && bearingLengthMatch[1]) {
      values.bearingLength = parseFloat(bearingLengthMatch[1]);
    }
    
    // Extract moment of inertia (both normal and effective)
    const inertiaMatch = text.match(/I(?:xe)?\s*[:=]\s*(\d+(?:\.\d+)?)\s*mm(?:4|⁴)/i) ||
                         text.match(/Moment of inertia - major axis\s*[\r\n]+(\d+(?:\.\d+)?)\s*mm(?:4|⁴)/i) ||
                         text.match(/慣性矩|慣性モーメント|Moment of Inertia\s*[:：]\s*(\d+(?:\.\d+)?)\s*mm(?:4|⁴)/i);
    
    // Extract effective moment of inertia
    const effectiveInertiaMatch = text.match(/I(?:xe)?\s*[:=]\s*(\d+(?:\.\d+)?)\s*mm(?:4|⁴)/i) ||
                                 text.match(/Effective 2nd moment of area\s*[\r\n]+(\d+(?:\.\d+)?)\s*mm(?:4|⁴)/i) ||
                                 text.match(/有効慣性モーメント|Effective moment of inertia\s*[:：]\s*(\d+(?:\.\d+)?)\s*mm(?:4|⁴)/i);
    
    if (effectiveInertiaMatch && effectiveInertiaMatch[1]) {
      values.momentOfInertia = parseFloat(effectiveInertiaMatch[1]);
    } else if (inertiaMatch && inertiaMatch[1]) {
      values.momentOfInertia = parseFloat(inertiaMatch[1]);
    }
    
    // Extract effective section modulus
    const modulusMatch2 = text.match(/S(?:xe)?\s*[:=]\s*(\d+(?:\.\d+)?)\s*mm(?:3|³)/i) ||
                          text.match(/Effective section modulus\s*[\r\n]+(\d+(?:\.\d+)?)\s*mm(?:3|³)/i) ||
                          text.match(/有效截面模數|有効断面係数|Effective Section Modulus\s*[:：]\s*(\d+(?:\.\d+)?)\s*mm(?:3|³)/i);
    if (modulusMatch2 && modulusMatch2[1]) {
      values.effectiveSectionModulus = parseFloat(modulusMatch2[1]);
    }
    
    // Extract span
    const spanMatch = text.match(/L\s*[:=]\s*(\d+(?:\.\d+)?)\s*mm/i) ||
                      text.match(/Span between supports\s*[\r\n]+(\d+(?:\.\d+)?)\s*mm/i) ||
                      text.match(/跨度|スパン|Span[^:：]*[:：]\s*(\d+(?:\.\d+)?)\s*mm/i);
    if (spanMatch && spanMatch[1]) {
      values.span = parseFloat(spanMatch[1]);
    }
    
    // Extract tributary width
    const widthMatch = text.match(/T(?:w)\s*[:=]\s*(\d+(?:\.\d+)?)\s*mm/i) ||
                       text.match(/Tributary width\/stud spacing\s*[\r\n]+(\d+(?:\.\d+)?)\s*mm/i) ||
                       text.match(/立筋間距|スタッド間隔|Stud Spacing[^:：]*[:：]\s*(\d+(?:\.\d+)?)\s*mm/i);
    if (widthMatch && widthMatch[1]) {
      values.tributaryWidth = parseFloat(widthMatch[1]);
    }
    
    // Extract design load
    const loadMatch = text.match(/ω\s*[:=]\s*(\d+(?:\.\d+)?)\s*kPa/i) ||
                      text.match(/Design uniform load\s*[\r\n]+(\d+(?:\.\d+)?)\s*kPa/i) ||
                      text.match(/設計荷載|設計荷重|Design Load[^:：]*[:：]\s*(\d+(?:\.\d+)?)\s*kN\/m/i);
    if (loadMatch && loadMatch[1]) {
      values.designLoad = parseFloat(loadMatch[1]);
      // Convert from kPa to kN/m if needed
      if (text.includes('kPa') && !text.includes('kN/m')) {
        // Calculate based on tributary width if available, otherwise use default conversion
        const conversionFactor = values.tributaryWidth ? values.tributaryWidth / 1000 : 0.406;
        values.designLoad = values.designLoad * conversionFactor;
      }
    }
    
    // Extract load height
    const heightMatch = text.match(/荷載高度|荷重高さ|Load Height[^:：]*[:：]\s*(\d+(?:\.\d+)?)\s*mm/i);
    if (heightMatch && heightMatch[1]) {
      values.loadHeight = parseFloat(heightMatch[1]) / 1000; // Convert mm to m
    }
    
    // Extract load factor
    const factorMatch = text.match(/W(?:k)\s*[:=]\s*(\d+(?:\.\d+)?)/i) ||
                        text.match(/Partial load factor - wind load only\s*[\r\n]+(\d+(?:\.\d+)?)/i) ||
                        text.match(/荷載係數|荷重係数|Load Factor\s*[:：]\s*(\d+(?:\.\d+)?)/i);
    if (factorMatch && factorMatch[1]) {
      values.loadFactor = parseFloat(factorMatch[1]);
    }
    
    console.log("Extracted values from document:", values);
    return values;
  };


  // Function to extract text from file using Dify API via Next.js API routes
  const extractTextFromFile = async (file: File): Promise<string> => {
    setStatus('uploading');
    setIsApiProcessing(true);
    setProgress(10);
    console.log(`Processing file using Dify API: ${file.name}`);
    
      try {
        // Create FormData for file upload
        const formData = new FormData();
        formData.append('file', file);
        
        console.log("Uploading file to API...");
        console.log(`File: ${file.name}, Size: ${file.size}, Type: ${file.type}`);
        
        // Step 1: Upload file to our Next.js API route
        setProgress(25);
        console.log("Sending file to /api/dify/upload endpoint");
        const fileUploadResponse = await fetch('/api/dify/upload', {
        method: 'POST',
        body: formData
      });
      
      if (!fileUploadResponse.ok) {
        const errorData = await fileUploadResponse.json();
        console.error(`File upload failed: ${errorData.error || fileUploadResponse.statusText}`);
        throw new Error(`File upload failed: ${errorData.error || fileUploadResponse.statusText}`);
      }
      
      const fileResult = await fileUploadResponse.json();
      console.log("File upload response:", fileResult);
      
      // Get file ID
      const fileId = fileResult.id;
      if (!fileId) {
        throw new Error("No file ID returned from API");
      }
      setFileId(fileId);
      setStatus('processing');
      setProgress(30);
      
      // 2. 解析完了をfileIdでポーリング
      let completed = false;
      for (let i = 0; i < 60; i++) { // 最大60秒待つ
        const res = await fetch(`/api/dify/webhook?fileId=${fileId}`);
        const statusData = await res.json();
        if (statusData.completed) {
          completed = true;
          break;
        }
        await new Promise(r => setTimeout(r, 1000));
      }
      if (!completed) throw new Error("Webhook通知が受信できませんでした。ファイル解析に失敗した可能性があります。");
      setProgress(60);
      
      // Step 3: Extract APIを呼ぶ
      const extractResponse = await fetch('/api/dify/extract', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          fileObject: fileResult,
          query
        })
      });
      
      setProgress(80);
      
      if (!extractResponse.ok) {
        const errorData = await extractResponse.json();
        console.error(`Text extraction failed: ${errorData.error || extractResponse.statusText}`);
        throw new Error(`Text extraction failed: ${errorData.error || extractResponse.statusText}`);
      }
      
      const extractResult = await extractResponse.json();
      console.log("Extract response:", extractResult);
      setProgress(100);
      setIsApiProcessing(false);
      setStatus('done');
      
      // レスポンス構造を詳細にデバッグ
      console.log("Response structure:", JSON.stringify(extractResult, null, 2));
      
      // APIから返された抽出テキストを取得
      // ワークフローAPIの新しいレスポンス形式に対応
      if (extractResult.answer && typeof extractResult.answer === 'string') {
        console.log("Answer directly available in response");
        return extractResult.answer;
      }
      
      // オリジナルのレスポンスから抽出
      if (extractResult.originalResponse) {
        console.log("Using original response from API");
        
        const resp = extractResult.originalResponse;
        
        // ワークフローレスポンス形式の処理
        if (resp.outputs && resp.outputs.answer) {
          console.log("Found answer in originalResponse.outputs.answer");
          return resp.outputs.answer;
        }
        
        if (resp.answer) {
          console.log("Found answer in originalResponse.answer");
          return resp.answer;
        }
        
        if (resp.response) {
          console.log("Found answer in originalResponse.response");
          return resp.response;
        }
        
        if (resp.output) {
          console.log("Found answer in originalResponse.output");
          return resp.output;
        }
      }
      
      // デバッグ用に応答全体を文字列化
      const responseStr = JSON.stringify(extractResult);
      console.log("Fallback - using entire response as string:", responseStr.substring(0, 200) + "...");
      return responseStr;
    } catch (error) {
      console.error("Error processing file:", error);
      setIsApiProcessing(false);
      setProgress(0);
      setStatus('error');
      throw error;
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setStatus('uploading');
    setIsUploading(true);
    setUploadStatus('idle');
    setErrorMessage("");
    setSelectedFileName(file.name);
    setProgress(0);

    try {
      console.log(`Processing file: ${file.name} (${file.type})`);
      
      // Extract text from file
      const extractedText = await extractTextFromFile(file);
      console.log("Extracted text (first 200 chars):", extractedText.substring(0, 200) + "...");
      
      // Parse values from extracted text
      const extractedValues = parseDocumentText(extractedText);
      
      // Check if at least some key values were extracted
      if (Object.keys(extractedValues).length > 0) {
        console.log("Successfully extracted values:", extractedValues);
        setExtractedValues(extractedValues); // Save values to component state
        
        // Save extracted values to localStorage
        try {
          localStorage.setItem('extractedValues', JSON.stringify(extractedValues));
          console.log("Values saved to localStorage");
        } catch (error) {
          console.error("Failed to save values to localStorage:", error);
        }
        
        setUploadStatus('success');
        
        // Refresh page after data is successfully extracted to notify parent component of changes
        setTimeout(() => {
          router.refresh();
        }, 1000);
      } else {
        console.error("No data could be extracted from the document");
        setUploadStatus('error');
        setErrorMessage("No data could be extracted from the document");
      }
    } catch (error) {
      console.error("Error processing file:", error);
      setUploadStatus('error');
      setErrorMessage(`Failed to process the file: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="p-4 border rounded-md mb-6">
      <div className="flex flex-col items-center">
        <div className="w-full max-w-md">
          <div className="w-full mb-3">
            <Input
              type="file"
              accept=".pdf,.docx,.doc,.jpg,.jpeg,.png"
              onChange={handleFileUpload}
              disabled={isUploading || isApiProcessing}
              className="hidden"
              id="file-upload"
              aria-label={lang === 'zh-HK' ? "點擊選擇文件" : lang === 'ja' ? "ファイルを選択" : "Click to select a file"}
            />
            <Button 
              variant="default" 
              type="button"
              onClick={() => {
                console.log("Button clicked, triggering file input click");
                const fileInput = document.getElementById('file-upload') as HTMLInputElement;
                if (fileInput) {
                  fileInput.click();
                } else {
                  console.error("File input element not found");
                }
              }}
              disabled={isUploading || isApiProcessing}
              className="w-full"
            >
              {isUploading || isApiProcessing ? (
                <div className="flex items-center">
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isUploading 
                    ? (lang === 'zh-HK' ? "上傳中..." : lang === 'ja' ? "アップロード中..." : "Uploading...") 
                    : (lang === 'zh-HK' ? "API處理中..." : lang === 'ja' ? "API処理中..." : "API Processing...")}
                </div>
              ) : (
                <span>
                  {lang === 'zh-HK' ? "點擊選擇文件" : lang === 'ja' ? "ファイルを選択" : "Click to select a file"}
                </span>
              )}
            </Button>
          </div>
        </div>
        
        {selectedFileName && (
          <div className="mt-2 text-sm text-green-600">
            <CheckCircle2 className="inline h-4 w-4 mr-1" />
            {lang === 'zh-HK' ? `已選擇文件: ${selectedFileName}` : 
             lang === 'ja' ? `選択されたファイル: ${selectedFileName}` : 
             `File selected: ${selectedFileName}`}
          </div>
        )}
        
        {isApiProcessing && (
          <div className="w-full max-w-md mt-4">
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div 
                className="bg-blue-600 h-2.5 rounded-full transition-all duration-300" 
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <p className="text-sm text-center mt-2 text-gray-600">
              {lang === 'zh-HK' ? "API處理中..." : lang === 'ja' ? "APIでファイルを処理中..." : "Processing file with API..."}
            </p>
          </div>
        )}
      </div>

      {uploadStatus === 'success' && (
        <Alert className="mt-4 bg-green-50 border-green-200">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-600">
            {text.success}
          </AlertDescription>
        </Alert>
      )}

      {uploadStatus === 'error' && (
        <Alert className="mt-4 bg-red-50 border-red-200">
          <XCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-600">
            {text.error} {errorMessage}
          </AlertDescription>
        </Alert>
      )}

    </div>
  );
}
