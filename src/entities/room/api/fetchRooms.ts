import { supabase } from '@/shared/api/supabase';
import type {
  FloorData,
  ClassroomRecord,
  ScheduleRecord,
} from '../model/types';

export const fetchEmptyRooms = async (
  buildingName: string,
  dayOfWeek: string,
  periods: number[] | null
): Promise<FloorData[]> => {
  const { data } = await supabase
    .from('Classroom')
    .select('id, roomNumber')
    .eq('buildingName', buildingName);

  const allRooms = data as ClassroomRecord[] | null;
  if (!allRooms?.length) return [];

  let occupiedIds: string[] = [];

  if (periods !== null) {
    const minPeriod = Math.min(...periods);
    const maxPeriod = Math.max(...periods);
    const { data: scheduleData } = await supabase
      .from('Schedule')
      .select('classroom_id')
      .eq('dayOfWeek', dayOfWeek)
      .lte('startTime', maxPeriod)
      .gte('endTime', minPeriod)
      .in(
        'classroom_id',
        allRooms.map((r) => r.id)
      );

    const schedules = scheduleData as ScheduleRecord[] | null;
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
