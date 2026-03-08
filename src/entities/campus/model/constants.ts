import type { Campus } from '@/types/campusType';
import type { Building } from './types';

export const BUILDINGS: Record<Campus, Building[]> = {
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
