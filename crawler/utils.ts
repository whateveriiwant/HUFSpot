interface TermInfo {
  year: string;
  sessn: string; // 1: 1학기, 11: 여름학기, 2: 2학기, 21: 겨울학기
}

export function getCurrentTermInfo(currentDate: Date = new Date()): TermInfo {
  const month = currentDate.getMonth() + 1; // getMonth()는 0부터 시작하므로 +1
  let year = currentDate.getFullYear();
  let sessn = '1';

  // 외대 시간표 조회 오픈 시기를 고려한 휴리스틱 맵핑
  if (month >= 1 && month <= 5) {
    // 1월 ~ 5월: 1학기 데이터 우선 제공 (1월 초중순부터 보통 1학기 시간표 오픈)
    sessn = '1';
  } else if (month === 6 || month === 7) {
    // 6월 ~ 7월 중순: 여름 계절학기 또는 2학기 준비 (MVP에서는 2학기로 일찍 넘겨도 무방)
    // 여기서는 2학기 시간표 조회가 7월 말경에 열린다고 가정
    sessn = '2';
  } else if (month >= 8 && month <= 11) {
    // 8월 ~ 11월: 2학기 데이터 우선 제공
    sessn = '2';
  } else if (month === 12) {
    // 12월: 내년도 1학기 준비로 넘어감
    year += 1;
    sessn = '1';
  }

  return {
    year: year.toString(),
    sessn: sessn,
  };
}
