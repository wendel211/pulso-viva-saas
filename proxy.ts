import { NextResponse, type NextRequest } from "next/server";

import { decrypt } from "@/lib/session";

/**
 * Proxy (Next.js 16 — substitui o antigo middleware.ts).
 * Faz apenas checagem otimista lendo o cookie de sessão; a verificação
 * forte ocorre no DAL (`verifySession`), próximo aos dados.
 */
const protectedPrefixes = ["/dashboard"];
const publicRoutes = ["/login", "/signup", "/recuperar-senha", "/"];

export default async function proxy(req: NextRequest) {
  const path = req.nextUrl.pathname;
  const isProtected = protectedPrefixes.some((p) => path.startsWith(p));
  const isPublic = publicRoutes.includes(path);

  const cookie = req.cookies.get("session")?.value;
  const session = await decrypt(cookie);

  if (isProtected && !session?.userId) {
    return NextResponse.redirect(new URL("/login", req.nextUrl));
  }

  if (isPublic && session?.userId && !path.startsWith("/dashboard")) {
    return NextResponse.redirect(new URL("/dashboard", req.nextUrl));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\.png$).*)"],
};
