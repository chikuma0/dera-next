import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Only exclude static/api paths
export function middleware(request: NextRequest) {
  // Only skip static/api paths
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next|api|favicon.ico).*)'],
};
