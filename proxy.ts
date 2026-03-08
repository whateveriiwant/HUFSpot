import { NextRequest, NextResponse } from 'next/server';

// 루트 경로와 /rooms 하위 경로 전체에 적용
export const config = {
  matcher: ['/', '/rooms', '/rooms/:path*'],
};

export function proxy(request: NextRequest) {
  const campus = request.cookies.get('campus')?.value;
  const { pathname, searchParams } = request.nextUrl;
  const shouldResetCampus =
    pathname === '/' && searchParams.get('resetCampus') === '1';

  // 홈 복귀 요청에서는 campus 쿠키를 지우고 선택 화면을 노출
  if (shouldResetCampus) {
    const response = NextResponse.next();
    response.cookies.set('campus', '', {
      path: '/',
      maxAge: 0,
      sameSite: 'lax',
    });
    return response;
  }

  // 루트 경로에서 campus 쿠키가 있으면 /rooms로 리다이렉트
  if (pathname === '/' && campus && (campus === 'H1' || campus === 'H2')) {
    return NextResponse.redirect(new URL('/rooms', request.url));
  }

  // /rooms 경로에서 campus 쿠키가 없거나 유효하지 않으면 온보딩 페이지로 리다이렉트
  if (
    pathname.startsWith('/rooms') &&
    (!campus || (campus !== 'H1' && campus !== 'H2'))
  ) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}
