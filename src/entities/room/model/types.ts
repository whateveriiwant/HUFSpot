export interface FloorData {
  floor: string;
  rooms: string[];
}

export interface ClassroomRecord {
  id: string;
  roomNumber: string;
}

export interface ScheduleRecord {
  classroom_id: string;
}
