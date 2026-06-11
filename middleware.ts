// Middleware is deprecated in Next.js 16 but kept as a passthrough
// for compatibility. No auth checks — this is a frontend prototype.

import { type NextRequest, NextResponse } from "next/server";

export async function middleware(_request: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
