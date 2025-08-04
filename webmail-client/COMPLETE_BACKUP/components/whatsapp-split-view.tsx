"use client";

export function WhatsAppSplitView() {
  return (
    <div className="flex flex-col h-full bg-white">
      {/* WhatsApp Web iframe */}
      <div className="flex-1 relative">
        <iframe
          src="https://web.whatsapp.com"
          className="w-full h-full border-0"
          title="WhatsApp Web"
          allow="camera; microphone; geolocation; clipboard-read; clipboard-write"
          sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox allow-modals allow-downloads"
        />
      </div>
    </div>
  );
} 