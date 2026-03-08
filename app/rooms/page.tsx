'use client';

import { useState, useRef, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { ChevronRight, MoveUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { type Campus, CAMPUS_MAP } from '@/types/campusType';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const BUILDINGS: Record<
  Campus,
  { code: string; name: string; emoji: string }[]
> = {
  H1: [
    { code: '0', name: '본관', emoji: '🏛️' },
    { code: '1', name: '인문과학관', emoji: '📚' },
    { code: '2', name: '교수학습개발원', emoji: '🎓' },
    { code: '3', name: '사회과학관', emoji: '🏢' },
    { code: '5', name: '법학관', emoji: '⚖️' },
    { code: 'C', name: '사이버관', emoji: '💻' },
  ],
  H2: [
    { code: '0', name: '백년관', emoji: '🏛️' },
    { code: '1', name: '어문관', emoji: '📚' },
    { code: '2', name: '교양관', emoji: '🎓' },
    { code: '3', name: '자연과학관', emoji: '🔬' },
    { code: '4', name: '인문경상관', emoji: '🏢' },
    { code: '5', name: '공학관', emoji: '⚙️' },
  ],
};

const DAYS = ['일', '월', '화', '수', '목', '금', '토'];

const getCurrentInfo = (): {
  dayOfWeek: string;
  period: number | null;
  label: string;
} => {
  const now = new Date();
  const dayOfWeek = DAYS[now.getDay()];
  const totalMinutes = now.getHours() * 60 + now.getMinutes();
  const startMinutes = 9 * 60;

  if (totalMinutes < startMinutes) {
    return { dayOfWeek, period: null, label: '수업 시작 전' };
  }
  const period = Math.floor((totalMinutes - startMinutes) / 60) + 1;
  if (period > 12) {
    return { dayOfWeek, period: null, label: '오늘 수업 종료' };
  }
  return { dayOfWeek, period, label: `${period}교시` };
};

interface FloorData {
  floor: string;
  rooms: string[];
}
interface Building {
  code: string;
  name: string;
  emoji: string;
}

const fetchEmptyRooms = async (
  buildingName: string,
  dayOfWeek: string,
  period: number | null
): Promise<FloorData[]> => {
  const { data: allRooms } = await supabase
    .from('Classroom')
    .select('id, roomNumber')
    .eq('buildingName', buildingName);

  if (!allRooms?.length) return [];

  let occupiedIds: string[] = [];
  if (period !== null) {
    const { data: schedules } = await supabase
      .from('Schedule')
      .select('classroom_id')
      .eq('dayOfWeek', dayOfWeek)
      .lte('startTime', period)
      .gte('endTime', period)
      .in(
        'classroom_id',
        allRooms.map((r) => r.id)
      );
    occupiedIds = schedules?.map((s) => s.classroom_id) ?? [];
  }

  const empty = allRooms.filter((r) => !occupiedIds.includes(r.id));
  const byFloor: Record<string, string[]> = {};
  for (const room of empty) {
    const f = room.roomNumber[0];
    if (!byFloor[f]) byFloor[f] = [];
    byFloor[f].push(room.roomNumber);
  }

  return Object.entries(byFloor)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([floor, rooms]) => ({ floor, rooms: rooms.sort() }));
};

const RoomsPage = () => {
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
    if (value === 'H1' || value === 'H2') setCampus(value);
  }, []);

  const handleBuildingSelect = async (building: Building) => {
    const info = getCurrentInfo();
    setSelectedBuilding(building);
    setTimeLabel(info.label);
    setFloorData([]);
    setLoading(true);

    setTimeout(() => {
      section2Ref.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);

    const data = await fetchEmptyRooms(
      building.name,
      info.dayOfWeek,
      info.period
    );
    setFloorData(data);
    setLoading(false);
  };

  if (!campus) return null;

  return (
    <>
      {/* Section 1: 건물 선택 */}
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

      {/* Section 2: 빈 강의실 결과 */}
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
      {/* 맨 위로 버튼 */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className="fixed bottom-6 right-6 size-12 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center active:scale-95 transition-transform"
      >
        <MoveUp className="size-5" />
      </button>
    </>
  );
};

export default RoomsPage;
