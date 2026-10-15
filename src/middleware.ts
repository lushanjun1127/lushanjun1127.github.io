import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt';
import { authSecret } from '@/lib/auth/secret';


export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const protectedApi = path.startsWith('/api/') && !path.startsWith('/api/auth/') && path !== '/api/track' && (
    !['GET', 'HEAD', 'OPTIONS'].includes(request.method) || path.startsWith('/api/admin/') || path === '/api/settings/initSettings'
  );
  if (protectedApi && !await getToken({ req: request, secret: authSecret })) {
    return NextResponse.json({ error: '请先登录管理后台' }, { status: 401 });
  }
  const response = NextResponse.next();
  return response;
}

export const config = {
  matcher: '/:path*',
} 
