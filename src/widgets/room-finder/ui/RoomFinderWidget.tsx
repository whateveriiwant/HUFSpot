'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronRight, MoveUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

import { type Campus, CAMPUS_MAP } from '@/types/campusType';
import { getCurrentInfo } from '@/entities/schedule/lib/time';
import { BUILDINGS } from '@/entities/campus/model/constants';
import type { Building } from '@/entities/campus/model/types';
import type { DevOverride } from '@/entities/schedule/model/types';
import { fetchEmptyRooms } from '@/entities/room/api/fetchRooms';
import type { FloorData } from '@/entities/room/model/types';

interface RoomFinderWidgetProps {
  devOverride: DevOverride | null;
}

export const RoomFinderWidget = ({ devOverride }: RoomFinderWidgetProps) => {
  const [campus, setCampus] = useState<Campus | null>(null);
  const [selectedBuilding, setSelectedBuilding] = useState<Building | null>(
    null
  );
  const [floorData, setFloorData] = useState<FloorData[]>([]);
  const [timeLabel, setTimeLabel] = useState('');
  const [loading, setLoading] = useState(false);
  const section2Ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const match = /(?:^|;\s*)campus=([^;]*)/.exec(document.cookie);
    const value = match?.[1];

    if (value === 'H1' || value === 'H2') setCampus(value as Campus);
  }, []);

  const scrollToSectionBottom = () => {
    const section = section2Ref.current;
    if (!section) return;

    const rect = section.getBoundingClientRect();
    const sectionBottom = window.scrollY + rect.bottom;
    const maxScrollTop =
      document.documentElement.scrollHeight - window.innerHeight;
    const targetTop = Math.min(
      Math.max(sectionBottom - window.innerHeight, 0),
      maxScrollTop
    );

    window.scrollTo({ top: targetTop, behavior: 'smooth' });
  };

  useEffect(() => {
    if (!selectedBuilding) return;

    const rafId = window.requestAnimationFrame(() => {
      scrollToSectionBottom();
    });

    return () => window.cancelAnimationFrame(rafId);
  }, [selectedBuilding, loading, floorData.length]);

  const handleBuildingSelect = async (building: Building) => {
    const info = getCurrentInfo(devOverride ?? undefined);
    setSelectedBuilding(building);
    setTimeLabel(info.label);
    setFloorData([]);
    setLoading(true);

    try {
      const data = await fetchEmptyRooms(
        building.name,
        info.dayOfWeek,
        info.periods
      );
      setFloorData(data);
    } finally {
      setLoading(false);
    }
  };

  if (!campus) return null;

  const info = getCurrentInfo(devOverride ?? undefined);

  if (!info.isOpen) {
    return (
      <div className="min-h-dvh flex flex-col items-center justify-center text-center gap-4 px-6">
        <p className="text-6xl">
          {info.closedReason === 'weekend' ? '🏠' : '🔒'}
        </p>
        <h1 className="text-2xl font-bold">
          {info.closedReason === 'weekend'
            ? '주말에는 건물이 열지 않아요'
            : '지금은 개방 시간이 아니에요'}
        </h1>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {info.closedReason === 'weekend'
            ? '학교 건물은 평일에만 개방해요. 월요일에 다시 확인해 보세요.'
            : '건물 개방 시간은 평일 오전 6시 ~ 오후 10시예요.'}
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-dvh flex flex-col">
        <div className="pt-6 pb-4">
          <p className="text-sm font-medium text-muted-foreground">
            {CAMPUS_MAP[campus]}
          </p>
          <h1 className="text-2xl font-bold mt-1">어느 건물에서 찾을까요?</h1>
        </div>

        <div className="flex flex-col gap-2">
          {BUILDINGS[campus].map((building) => (
            <Button
              key={building.code}
              variant="outline"
              className="w-full h-14 justify-between px-4 text-base font-medium rounded-xl"
              onClick={() => handleBuildingSelect(building)}
            >
              <span className="flex items-center gap-3">
                <span className="text-xl">{building.emoji}</span>
                {building.name}
              </span>
              <ChevronRight className="text-muted-foreground" />
            </Button>
          ))}
        </div>
      </div>

      {selectedBuilding && (
        <div ref={section2Ref} className="pt-6 pb-10">
          <p className="text-sm font-medium text-muted-foreground">
            {selectedBuilding.emoji} {selectedBuilding.name} · {timeLabel}
          </p>
          <h1 className="text-2xl font-bold mt-1">
            현재 비어 있는 강의실이에요
          </h1>

          {loading ? (
            <p className="text-muted-foreground text-sm animate-pulse mt-8">
              불러오는 중…
            </p>
          ) : floorData.length > 0 ? (
            <div className="mt-6 flex flex-col gap-6">
              {floorData.map((floor, index) => (
                <div key={floor.floor}>
                  {index > 0 && <Separator className="mb-6" />}
                  <p className="text-lg font-semibold mb-3">{floor.floor}층</p>
                  <div className="grid grid-cols-3 gap-2">
                    {floor.rooms.map((room) => (
                      <div
                        key={room}
                        className="bg-accent rounded-xl p-4 flex items-center justify-center"
                      >
                        <span className="font-semibold">{room}호</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center text-center gap-3 mt-16">
              <p className="text-6xl">😔</p>
              <h2 className="text-xl font-bold">빈 강의실이 없어요</h2>
              <p className="text-sm text-muted-foreground">
                {selectedBuilding.name}의 모든 강의실이 사용 중이에요
              </p>
            </div>
          )}
        </div>
      )}

      <button
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className="fixed bottom-6 right-6 size-12 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center active:scale-95 transition-transform"
      >
        <MoveUp className="size-5" />
      </button>
    </>
  );
};
