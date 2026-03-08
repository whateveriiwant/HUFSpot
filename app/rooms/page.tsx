import { cookies } from "next/headers";
import { ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { type Campus, CAMPUS_MAP } from "@/types/campusType";

const BUILDINGS: Record<Campus, { code: string; name: string; emoji: string }[]> = {
  H1: [
    { code: "0", name: "본관",         emoji: "🏛️" },
    { code: "1", name: "인문과학관",   emoji: "📚" },
    { code: "2", name: "교수학습개발원", emoji: "🎓" },
    { code: "3", name: "사회과학관",   emoji: "🏢" },
    { code: "5", name: "법학관",       emoji: "⚖️" },
    { code: "C", name: "사이버관",     emoji: "💻" },
  ],
  H2: [
    { code: "0", name: "백년관",       emoji: "🏛️" },
    { code: "1", name: "어문관",       emoji: "📚" },
    { code: "2", name: "교양관",       emoji: "🎓" },
    { code: "3", name: "자연과학관",   emoji: "🔬" },
    { code: "4", name: "인문경상관",   emoji: "🏢" },
    { code: "5", name: "공학관",       emoji: "⚙️" },
  ],
};

const RoomsPage = async () => {
  const cookieStore = await cookies();
  const campus = cookieStore.get("campus")?.value as Campus | undefined;
  const campusName = campus ? CAMPUS_MAP[campus] : "알 수 없는 캠퍼스";
  const buildings = campus ? BUILDINGS[campus] : [];

  return (
    <div className="flex flex-col min-h-screen">
      {/* 헤더 */}
      <div className="pt-6 pb-4">
        <p className="text-md font-medium text-muted-foreground">
          {campusName}
        </p>
        <h1 className="text-2xl font-bold mt-1">어느 건물에서 찾을까요?</h1>
      </div>

      {/* 건물 목록 */}
      <div className="flex flex-col gap-2">
        {buildings.map((building) => (
          <Button
            key={building.code}
            variant="outline"
            className="w-full h-14 justify-between px-4 text-base font-medium rounded-xl"
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
  );
};

export default RoomsPage;
