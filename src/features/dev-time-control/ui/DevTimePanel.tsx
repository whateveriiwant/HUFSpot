'use client';

import React, { useState } from 'react';
import { Wrench } from 'lucide-react';
import { DAYS } from '@/entities/schedule/model/constants';
import { getCurrentInfo } from '@/entities/schedule/lib/time';
import type { DevOverride } from '@/entities/schedule/model/types';

interface DevTimePanelProps {
  devOverride: DevOverride | null;
  setDevOverride: React.Dispatch<React.SetStateAction<DevOverride | null>>;
}

export const DevTimePanel = ({
  devOverride,
  setDevOverride,
}: DevTimePanelProps) => {
  const [devOpen, setDevOpen] = useState(false);

  return (
    <div className="fixed bottom-6 left-6 z-50 flex flex-col items-start gap-2">
      {devOpen && (
        <div className="bg-background border rounded-2xl shadow-xl p-4 w-64 flex flex-col gap-3">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            Dev · 시간 조작
          </p>
          <div>
            <p className="text-xs text-muted-foreground mb-1.5">요일</p>
            <div className="grid grid-cols-7 gap-1">
              {DAYS.map((d, i) => (
                <button
                  key={d}
                  onClick={() =>
                    setDevOverride((prev) => ({
                      day: i,
                      totalMin:
                        prev?.totalMin ??
                        new Date().getHours() * 60 + new Date().getMinutes(),
                    }))
                  }
                  className={`text-xs py-1 rounded-lg font-medium transition-colors ${
                    (devOverride?.day ?? new Date().getDay()) === i
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-accent text-accent-foreground'
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1.5">시간</p>
            <input
              type="time"
              className="w-full border rounded-lg px-3 py-2 text-sm bg-background"
              value={(() => {
                const m =
                  devOverride?.totalMin ??
                  new Date().getHours() * 60 + new Date().getMinutes();
                return `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
              })()}
              onChange={(e) => {
                const [h, m] = e.target.value.split(':').map(Number);
                setDevOverride((prev) => ({
                  day: prev?.day ?? new Date().getDay(),
                  totalMin: h * 60 + m,
                }));
              }}
            />
          </div>
          <div className="bg-accent rounded-lg px-3 py-2 text-xs text-muted-foreground">
            판정:{' '}
            <span className="font-semibold text-foreground">
              {(() => {
                const info = getCurrentInfo(devOverride ?? undefined);
                return info.isOpen
                  ? info.label
                  : `닫힘 (${info.closedReason ?? '알 수 없음'})`;
              })()}
            </span>
          </div>
          <button
            onClick={() => setDevOverride(null)}
            className="text-xs text-muted-foreground underline text-left"
          >
            현재 시간으로 초기화
          </button>
        </div>
      )}
      <button
        onClick={() => setDevOpen((v) => !v)}
        className={`size-12 rounded-full shadow-lg flex items-center justify-center active:scale-95 transition-all ${
          devOverride
            ? 'bg-amber-400 text-amber-950'
            : 'bg-secondary text-secondary-foreground'
        }`}
      >
        <Wrench className="size-5" />
      </button>
    </div>
  );
};
