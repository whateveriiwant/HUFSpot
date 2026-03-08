import Link from 'next/link';

const NotFound = () => {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 text-center">
      <p className="text-6xl">404</p>
      <div className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight">
          페이지를 찾을 수 없어요
        </h1>
        <p className="text-sm text-muted-foreground">
          주소를 다시 확인하거나 홈으로 돌아가서 다시 시도해 주세요.
        </p>
      </div>
      <Link
        href="/"
        className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-6 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
      >
        홈으로 이동
      </Link>
    </main>
  );
};

export default NotFound;
