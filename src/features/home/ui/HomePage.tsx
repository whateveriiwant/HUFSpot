import { CampusSelector } from '@/features/home/ui/CampusSelector';

const HomePage = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex-1 flex flex-col items-center justify-center gap-10">
        <div className="text-center space-y-2">
          <p className="text-5xl mb-4">📍</p>
          <h1 className="text-3xl font-bold tracking-tight">HUFSpot</h1>
          <p className="text-sm text-muted-foreground">캠퍼스를 선택해주세요</p>
        </div>
        <CampusSelector />
      </div>
    </div>
  );
};

export default HomePage;
