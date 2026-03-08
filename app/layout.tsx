import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import React from "react";

const pretendard = localFont({
  src: "./fonts/PretendardVariable.woff2",
  display: "swap",
  weight: "45 920",
  variable: "--font-pretendard",
});

export const metadata: Metadata = {
  title: "HUFSpot - 한국외대 빈 강의실 찾기",
  description: "한국외국어대학교 실시간 빈 강의실 조회",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko" className={pretendard.variable}>
      <body className="min-h-screen bg-[#f5f5f7] font-sans antialiased flex justify-center">
        <div
          className={[
            "relative",
            "w-full min-w-[320px] max-w-[430px]",
            "min-h-screen",
            "bg-white",
            "overflow-x-hidden",
            "shadow-[0_0_40px_rgba(0,0,0,0.08)]",
            "p-4",
          ].join(" ")}
        >
          {children}
        </div>
      </body>
    </html>
  );
}
