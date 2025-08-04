"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MessageCircle, X, Maximize2, Minimize2, Monitor, Smartphone, ExternalLink, QrCode, Send } from "lucide-react";
import { cn } from "@/lib/utils";

interface WhatsAppIframeProps {
  className?: string;
}

export function WhatsAppIframe({ className }: WhatsAppIframeProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isFullSize, setIsFullSize] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [customUrl, setCustomUrl] = useState("https://web.whatsapp.com");
  const [isConnected, setIsConnected] = useState(false);

  // ローカルストレージから設定を読み込み
  useEffect(() => {
    const savedPhoneNumber = localStorage.getItem("whatsapp-phone-number");
    const savedCustomUrl = localStorage.getItem("whatsapp-custom-url");
    const savedFullSize = localStorage.getItem("whatsapp-full-size");
    
    if (savedPhoneNumber) {
      setPhoneNumber(savedPhoneNumber);
    }
    if (savedCustomUrl) {
      setCustomUrl(savedCustomUrl);
    }
    if (savedFullSize) {
      setIsFullSize(savedFullSize === "true");
    }
  }, []);

  // 設定をローカルストレージに保存
  const saveSettings = (phone: string, url: string) => {
    localStorage.setItem("whatsapp-phone-number", phone);
    localStorage.setItem("whatsapp-custom-url", url);
    localStorage.setItem("whatsapp-full-size", isFullSize.toString());
  };

  const handlePhoneNumberSubmit = () => {
    if (phoneNumber.trim()) {
      const whatsappUrl = `https://web.whatsapp.com/send?phone=${phoneNumber.replace(/\D/g, "")}`;
      setCustomUrl(whatsappUrl);
      saveSettings(phoneNumber, whatsappUrl);
      openWhatsAppInNewTab(whatsappUrl);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handlePhoneNumberSubmit();
    }
  };

  const toggleFullSize = () => {
    setIsFullSize(!isFullSize);
    localStorage.setItem("whatsapp-full-size", (!isFullSize).toString());
  };

  const openWhatsAppInNewTab = (url: string) => {
    window.open(url, '_blank', 'width=800,height=600,scrollbars=yes,resizable=yes');
  };

  const openWhatsAppHome = () => {
    const url = "https://web.whatsapp.com";
    setCustomUrl(url);
    saveSettings("", url);
    openWhatsAppInNewTab(url);
  };

  const openSampleNumber = () => {
    const url = "https://web.whatsapp.com/send?phone=+819012345678";
    setCustomUrl(url);
    saveSettings("+819012345678", url);
    openWhatsAppInNewTab(url);
  };

  return (
    <div className={cn(
      "fixed z-50",
      isFullSize 
        ? "bottom-0 right-0 w-1/2 h-screen" 
        : "bottom-0 right-4"
    )}>
      {/* WhatsApp ボタン */}
      {!isOpen && (
        <Button
          onClick={() => setIsOpen(true)}
          className="h-14 w-14 rounded-full bg-green-500 hover:bg-green-600 shadow-lg transition-all duration-200 hover:scale-105"
          size="icon"
        >
          <MessageCircle className="h-6 w-6 text-white" />
        </Button>
      )}

      {/* WhatsApp ウィンドウ */}
      {isOpen && (
        <div className={cn(
          "border border-gray-200 bg-white shadow-xl",
          isFullSize 
            ? "h-full w-full rounded-none" 
            : "mb-4 w-96 rounded-lg"
        )}>
          {/* ヘッダー - Gmail風スタイル */}
          <div className="flex items-center justify-between border-b border-gray-200 bg-white p-3 rounded-t-lg">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                <MessageCircle className="h-4 w-4 text-white" />
              </div>
              <div>
                <span className="font-medium text-gray-800">WhatsApp Web</span>
                <div className="text-xs text-gray-500">メッセージング</div>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-gray-600 hover:bg-gray-100"
                onClick={toggleFullSize}
                title={isFullSize ? "小さくする" : "大きくする"}
              >
                {isFullSize ? (
                  <Smartphone className="h-4 w-4" />
                ) : (
                  <Monitor className="h-4 w-4" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-gray-600 hover:bg-gray-100"
                onClick={() => setIsMinimized(!isMinimized)}
              >
                {isMinimized ? (
                  <Maximize2 className="h-4 w-4" />
                ) : (
                  <Minimize2 className="h-4 w-4" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-gray-600 hover:bg-gray-100"
                onClick={() => setIsOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* コンテンツ */}
          {!isMinimized && (
            <div className={cn(
              "p-4",
              isFullSize ? "h-[calc(100%-60px)]" : ""
            )}>
              {/* 電話番号入力 - Gmail風スタイル */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  連絡先を選択
                </label>
                <div className="flex gap-2">
                  <Input
                    type="tel"
                    placeholder="電話番号を入力（例: +81 90 1234 5678）"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="flex-1 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  />
                  <Button
                    onClick={handlePhoneNumberSubmit}
                    className="bg-green-500 hover:bg-green-600 text-white px-4"
                    size="sm"
                  >
                    <Send className="h-4 w-4 mr-1" />
                    送信
                  </Button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  電話番号を入力してEnterキーを押すか、送信ボタンをクリックしてください
                </p>
              </div>

              {/* WhatsApp Web プレビュー - Gmail風スタイル */}
              <div className="border border-gray-200 rounded-lg overflow-hidden bg-gray-50">
                <div className={cn(
                  "flex flex-col items-center justify-center text-center p-8",
                  isFullSize ? "h-[calc(100%-200px)]" : "h-96"
                )}>
                  <div className="mb-6">
                    <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                      <QrCode className="h-10 w-10 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">
                      WhatsApp Web
                    </h3>
                    <p className="text-sm text-gray-600 mb-6 max-w-xs">
                      新しいタブでWhatsApp Webが開き、メールアプリと並行して使用できます
                    </p>
                  </div>
                  
                  <div className="space-y-3 w-full max-w-xs">
                    <Button
                      onClick={openWhatsAppHome}
                      className="w-full bg-green-500 hover:bg-green-600 text-white h-10"
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      WhatsApp Web を開く
                    </Button>
                    
                    {phoneNumber && (
                      <Button
                        onClick={() => openWhatsAppInNewTab(customUrl)}
                        variant="outline"
                        className="w-full h-10 border-gray-300 text-gray-700 hover:bg-gray-50"
                      >
                        <MessageCircle className="h-4 w-4 mr-2" />
                        {phoneNumber} にメッセージ
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              {/* クイックアクション - Gmail風スタイル */}
              <div className="mt-4 space-y-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start text-gray-700 hover:bg-gray-100 h-9"
                  onClick={openWhatsAppHome}
                >
                  📱 WhatsApp Web ホーム
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start text-gray-700 hover:bg-gray-100 h-9"
                  onClick={openSampleNumber}
                >
                  📞 サンプル番号（+81 90 1234 5678）
                </Button>
              </div>

              {/* 接続状況 - Gmail風スタイル */}
              <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center gap-2 text-sm text-blue-700">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                  <span className="font-medium">統合メッセージング</span>
                </div>
                <p className="text-xs text-blue-600 mt-1">
                  WhatsApp Webは独立したウィンドウで動作し、メールアプリと統合された体験を提供します
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
} 