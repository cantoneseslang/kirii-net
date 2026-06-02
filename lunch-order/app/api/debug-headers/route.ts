import { NextRequest, NextResponse } from "next/server";

export function GET(req: NextRequest) {
  const referer = req.headers.get("referer") || req.headers.get("referrer");
  const ua = req.headers.get("user-agent");
  const cookie = req.headers.get("cookie");
  return NextResponse.json({ referer, userAgent: ua, cookieNames: cookie?.split(";").map(s=>s.split("=")[0].trim()) ?? [] });
}




