import { cookies } from "next/headers";
import { Campus, CAMPUS_MAP } from "@/types/campusType";

const RoomsPage = async () => {
  const cookieStore = await cookies();
  const campusCode = cookieStore.get("campus")?.value as Campus | undefined;
  const campusName =
    campusCode === "H1"
      ? CAMPUS_MAP[campusCode]
      : campusCode === "H2"
        ? CAMPUS_MAP[campusCode]
        : "알 수 없는 캠퍼스";
  return (
    <div className="flex flex-col min-h-screen">
      <h1 className="text-primary text-2xl font-bold">
        {campusName} 빈 강의실 찾기
      </h1>
    </div>
  );
};

export default RoomsPage;
