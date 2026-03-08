import { DAYS, PAIR_SLOTS } from '../model/constants';
import type { CurrentInfo, DevOverride } from '../model/types';

export const getCurrentInfo = (override?: DevOverride): CurrentInfo => {
  const now = new Date();
  const day = override?.day ?? now.getDay();
  const dayOfWeek = DAYS[day];
  const totalMin = override?.totalMin ?? now.getHours() * 60 + now.getMinutes();

  if (day === 0 || day === 6) {
    return {
      dayOfWeek,
      periods: null,
      label: '주말',
      isOpen: false,
      closedReason: 'weekend',
    };
  }

  if (totalMin < 6 * 60 || totalMin >= 22 * 60) {
    return {
      dayOfWeek,
      periods: null,
      label: '개방 전/후',
      isOpen: false,
      closedReason: 'hours',
    };
  }

  if (totalMin < 9 * 60) {
    return { dayOfWeek, periods: null, label: '수업 시작 전', isOpen: true };
  }

  const currentSlot = PAIR_SLOTS.find(
    (s) => totalMin >= s.startMin && totalMin <= s.endMin
  );
  if (currentSlot) {
    return {
      dayOfWeek,
      periods: currentSlot.periods,
      label: currentSlot.label,
      isOpen: true,
    };
  }

  if (totalMin > 20 * 60 + 50) {
    return { dayOfWeek, periods: null, label: '오늘 수업 종료', isOpen: true };
  }

  const nextSlot = PAIR_SLOTS.find((s) => s.startMin > totalMin);
  if (nextSlot) {
    return {
      dayOfWeek,
      periods: nextSlot.periods,
      label: nextSlot.label,
      isOpen: true,
    };
  }

  return { dayOfWeek, periods: null, label: '오늘 수업 종료', isOpen: true };
};
