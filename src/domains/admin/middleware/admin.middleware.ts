import { NextRequest, NextResponse } from "next/server";
import { getCurrentSession } from "~/lib/server/auth/session";
import { AdminService } from "../services/admin.service";

const adminService = new AdminService();

/**
 * Middleware para proteger rotas administrativas
 * Valida se o usuário é admin global
 */
export async function adminMiddleware(request: NextRequest) {
  const { user } = await getCurrentSession();

  if (!user) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  const isAdmin = await adminService.isGlobalAdmin(user.id);

  if (!isAdmin) {
    return NextResponse.json(
      { error: "Unauthorized: Admin access required" },
      { status: 403 }
    );
  }

  // Adiciona flag de admin ao request
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-is-global-admin", "true");
  requestHeaders.set("x-user-id", user.id);

  return NextResponse.next({
    request: { headers: requestHeaders },
  });
}

/**
 * Helper para verificar se usuário é admin (usado em Server Components)
 */
export async function requireAdmin() {
  const { user } = await getCurrentSession();

  if (!user) {
    throw new Error("Unauthorized: Please log in");
  }

  const isAdmin = await adminService.isGlobalAdmin(user.id);

  if (!isAdmin) {
    throw new Error("Unauthorized: Admin access required");
  }

  return user.id;
}
