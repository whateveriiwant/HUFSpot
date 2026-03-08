import "dotenv/config";
import { createClient } from "@supabase/supabase-js";
import { getCurrentTermInfo } from "./utils";
import { MAJORS } from "./majors";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

const DELAY_MS = 1500;
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// 영문 요일 → 한글 변환 (dayTimeDisplayE가 영문 약어를 사용함)
const EN_TO_KR: Record<string, string> = {
  Mon: "월",
  Tue: "화",
  Wed: "수",
  Thu: "목",
  Fri: "금",
  Sat: "토",
  Sun: "일",
};

const BASE_HEADERS: Record<string, string> = {
  "User-Agent":
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36",
  "Accept-Language": "ko-KR,ko;q=0.9",
  Origin: "https://wis.hufs.ac.kr",
  Referer:
    "https://wis.hufs.ac.kr/src08/jsp/lecture/LECTURE2020L.jsp?type=plan&tab_lang=K",
  "X-Requested-With": "XMLHttpRequest",
};

// 강의실 코드 첫 자리 → 건물명 매핑
const SEOUL_BUILDINGS: Record<string, string> = {
  "0": "본관",
  "1": "인문과학관",
  "2": "교수학습개발원",
  "3": "사회과학관",
  "5": "법학관",
  C: "사이버관",
};

const GLOBAL_BUILDINGS: Record<string, string> = {
  "0": "백년관",
  "1": "어문관",
  "2": "교양관",
  "3": "자연과학관",
  "4": "인문경상관",
  "5": "공학관",
};

interface ScheduleEntry {
  dayOfWeek: string;
  startTime: number;
  endTime: number;
  buildingName: string;
  roomNumber: string;
}

/**
 * 메인 페이지 GET → Set-Cookie 헤더에서 세션 쿠키 추출
 * JSESSIONID 없이 POST하면 서버가 500을 반환함
 */
async function getSessionCookie(): Promise<string> {
  const res = await fetch(
    "https://wis.hufs.ac.kr/src08/jsp/lecture/LECTURE2020L.jsp?type=plan&tab_lang=K",
    { headers: { "User-Agent": BASE_HEADERS["User-Agent"] } },
  );

  // Node.js 18+: getSetCookie() 로 복수 쿠키 모두 수집
  const setCookies: string[] =
    typeof (res.headers as any).getSetCookie === "function"
      ? (res.headers as any).getSetCookie()
      : [res.headers.get("set-cookie") ?? ""];

  const cookie = setCookies
    .map((c) => c.split(";")[0].trim())
    .filter(Boolean)
    .join("; ");

  console.log(`🍪 세션 쿠키 획득: ${cookie}`);
  return cookie;
}

function parseRoomCode(
  code: string,
  campus: string,
): { buildingName: string; roomNumber: string } | null {
  if (!code || code.length < 2) return null;
  const buildingChar = code.charAt(0).toUpperCase();
  const roomNumber = code.slice(1);
  const map = campus === "H1" ? SEOUL_BUILDINGS : GLOBAL_BUILDINGS;
  const buildingName = map[buildingChar];
  if (!buildingName) return null;
  return { buildingName, roomNumber };
}

/**
 * 강의시간/강의실 문자열 파싱
 * "목 1 2 3 (0209)"     → 목요일 1~3교시, 본관 209호
 * "월 12 수 5 6 (0209)" → 월요일 12교시 + 수요일 5~6교시, 본관 209호
 */
function parseTimeLocation(str: string, campus: string): ScheduleEntry[] {
  if (!str) return [];

  // 영문 요일을 한글로 정규화: "Mon 7 8 9 (2508)" → "월 7 8 9 (2508)"
  const normalized = str.replace(
    /\b(Mon|Tue|Wed|Thu|Fri|Sat|Sun)\b/g,
    (m) => EN_TO_KR[m] ?? m,
  );

  const roomMatch = normalized.match(/\(([^)]+)\)\s*$/);
  if (!roomMatch) return [];

  const room = parseRoomCode(roomMatch[1].trim(), campus);
  if (!room) return [];

  const timePart = normalized.slice(0, roomMatch.index).trim();
  const entries: ScheduleEntry[] = [];
  const dayPattern = /([월화수목금토일])((?:\s+\d+)+)/g;
  let match: RegExpExecArray | null;

  while ((match = dayPattern.exec(timePart)) !== null) {
    const dayOfWeek = match[1];
    const periods = match[2]
      .trim()
      .split(/\s+/)
      .map(Number)
      .filter((n) => !isNaN(n) && n > 0);

    if (periods.length === 0) continue;
    entries.push({
      dayOfWeek,
      startTime: Math.min(...periods),
      endTime: Math.max(...periods),
      ...room,
    });
  }

  return entries;
}

async function getOrCreateClassroomId(
  buildingName: string,
  roomNumber: string,
): Promise<string | null> {
  const { data: existing } = await supabase
    .from("Classroom")
    .select("id")
    .eq("buildingName", buildingName)
    .eq("roomNumber", roomNumber)
    .single();

  if (existing) return existing.id;

  const { data: inserted, error } = await supabase
    .from("Classroom")
    .insert({ buildingName, roomNumber })
    .select("id")
    .single();

  if (error) {
    const { data: retried } = await supabase
      .from("Classroom")
      .select("id")
      .eq("buildingName", buildingName)
      .eq("roomNumber", roomNumber)
      .single();
    return retried?.id ?? null;
  }

  return inserted?.id ?? null;
}

async function run() {
  const { year, sessn } = getCurrentTermInfo();
  console.log(`🚀 ${year}년 ${sessn}학기 데이터 수집 시작...`);

  const targetMajors = MAJORS; // 서울(H1) + 글로벌(H2) 전체
  const h1Count = targetMajors.filter((m) => m.campus === "H1").length;
  const h2Count = targetMajors.filter((m) => m.campus === "H2").length;
  console.log(
    `📋 총 ${targetMajors.length}개 전공 (서울 ${h1Count}개 + 글로벌 ${h2Count}개)`,
  );

  try {
    // 1. 세션 쿠키 획득
    const cookie = await getSessionCookie();

    // 2. Schedule 초기화
    await supabase
      .from("Schedule")
      .delete()
      .neq("id", "00000000-0000-0000-0000-000000000000");
    console.log("🗑️  기존 Schedule 초기화 완료\n");

    for (const [index, major] of targetMajors.entries()) {
      console.log(
        `[${index + 1}/${targetMajors.length}] [${major.campus}] ${major.name}`,
      );

      // 브라우저 Payload와 동일한 파라미터 구성
      const params = new URLSearchParams({
        mName: "getDataLssnLista",
        cName: "hufs.stu1.STU1_C009",
        org_sect: "A",
        ledg_year: year,
        ledg_sessn: sessn,
        campus: major.campus,
        crs_strct_cd: major.code,
        gubun: "1",
        subjt_nm: "",
        won: "",
        cyber: "",
        emp_nm: "",
        d1: "N",
        d2: "N",
        d3: "N",
        d4: "N",
        d5: "N",
        d6: "N",
        t1: "N",
        t2: "N",
        t3: "N",
        t4: "N",
        t5: "N",
        t6: "N",
        t7: "N",
        t8: "N",
        t9: "N",
        t10: "N",
        t11: "N",
        t12: "N",
      });

      const response = await fetch("https://wis.hufs.ac.kr/hufs", {
        method: "POST",
        headers: {
          ...BASE_HEADERS,
          "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
          Cookie: cookie,
        },
        body: params.toString(),
      });

      const rawText = await response.text();
      let lectures: any[] = [];

      try {
        // 서버 응답이 URL 인코딩된 JSON: %7B%22rtnCode%22... → {"rtnCode"...
        const decoded = decodeURIComponent(rawText);
        const parsed = JSON.parse(decoded);
        lectures = Array.isArray(parsed.data) ? parsed.data : [];
      } catch {
        // URL 인코딩 없이 바로 JSON인 경우 폴백
        try {
          const parsed = JSON.parse(rawText);
          lectures = Array.isArray(parsed.data) ? parsed.data : [];
        } catch {
          console.warn(`  ⚠️  JSON 파싱 실패 (status=${response.status})`);
          continue;
        }
      }

      let inserted = 0;
      for (const lecture of lectures) {
        const timeStr: string =
          lecture.dayTimeDisplayE || lecture.dayTimeDisplay || "";
        if (!timeStr) continue;

        const entries = parseTimeLocation(timeStr, major.campus);
        for (const entry of entries) {
          const classroomId = await getOrCreateClassroomId(
            entry.buildingName,
            entry.roomNumber,
          );
          if (!classroomId) continue;

          await supabase.from("Schedule").insert({
            classroom_id: classroomId,
            dayOfWeek: entry.dayOfWeek,
            startTime: entry.startTime,
            endTime: entry.endTime,
          });
          inserted++;
        }
      }

      console.log(`  → 강의 ${lectures.length}개, Schedule ${inserted}건 적재`);
      await delay(DELAY_MS);
    }

    console.log("\n🏁 모든 데이터 수집 및 적재 완료");
  } catch (error) {
    console.error("❌ 작업 중 오류 발생:", error);
  }
}

run();
