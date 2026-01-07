import { NextRequest, NextResponse } from "next/server";
import { getCurrentSession } from "~/lib/server/auth/session";
import { AdminService } from "~/domains/admin/services/admin.service";
import { getAllActivityLogs } from "~/domains/admin/actions/activity-admin.actions";

const adminService = new AdminService();

/**
 * API Route para Activity Logs (Admin Global)
 * 
 * GET /api/admin/activity
 * 
 * Query params:
 * - workspaceId: string (opcional)
 * - action: string (opcional)
 * - userId: string (opcional)
 * - dateFrom: ISO date string (opcional)
 * - dateTo: ISO date string (opcional)
 * - limit: number (opcional, max 100)
 * - offset: number (opcional)
 * 
 * TODO: Quando migrar para app externo:
 * 1. Implementar API Key authentication
 *    - Adicionar header: Authorization: Bearer <api_key>
 *    - Validar API key no banco de dados
 *    - Rate limiting por API key
 * 
 * 2. Habilitar CORS para domínio do admin app
 *    - Descomentar headers CORS abaixo
 *    - Configurar domínio permitido em variável de ambiente
 *    - Adicionar OPTIONS handler para preflight
 * 
 * 3. Adicionar rate limiting
 *    - Implementar Redis/Upstash para rate limiting
 *    - Limite: 100 requests por minuto por API key
 *    - Retornar 429 Too Many Requests quando exceder
 * 
 * 4. Implementar webhook notifications
 *    - Notificar app externo quando houver novos logs críticos
 *    - Configurar endpoints de webhook
 *    - Retry logic para falhas de webhook
 */
export async function GET(request: NextRequest) {
  try {
    // Validar autenticação admin
    const { user } = await getCurrentSession();
    if (!user) {
      return NextResponse.json(
        { error: "Não autenticado" },
        { status: 401 }
      );
    }

    const isAdmin = await adminService.isGlobalAdmin(user.id);
    if (!isAdmin) {
      return NextResponse.json(
        { error: "Acesso negado: apenas administradores globais" },
        { status: 403 }
      );
    }

    // Extrair query params
    const searchParams = request.nextUrl.searchParams;
    const workspaceId = searchParams.get("workspaceId") || undefined;
    const action = searchParams.get("action") || undefined;
    const userId = searchParams.get("userId") || undefined;
    const dateFromStr = searchParams.get("dateFrom");
    const dateToStr = searchParams.get("dateTo");
    const limitStr = searchParams.get("limit");
    const offsetStr = searchParams.get("offset");

    // Parse dates
    const dateFrom = dateFromStr ? new Date(dateFromStr) : undefined;
    const dateTo = dateToStr ? new Date(dateToStr) : undefined;
    const limit = limitStr ? parseInt(limitStr, 10) : 100;
    const offset = offsetStr ? parseInt(offsetStr, 10) : 0;

    // Buscar logs
    const result = await getAllActivityLogs({
      workspaceId,
      action,
      userId,
      dateFrom,
      dateTo,
      limit,
      offset,
    });

    // TODO: Headers CORS para app externo (descomentar quando necessário)
    // const response = NextResponse.json(result);
    // response.headers.set('Access-Control-Allow-Origin', process.env.ADMIN_APP_URL || '*');
    // response.headers.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
    // response.headers.set('Access-Control-Allow-Headers', 'Authorization, Content-Type');
    // return response;

    return NextResponse.json(result);
  } catch (error) {
    console.error("[API /admin/activity] Error:", error);
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : "Erro ao buscar logs" 
      },
      { status: 500 }
    );
  }
}

// TODO: Handler OPTIONS para CORS preflight (descomentar quando necessário)
// export async function OPTIONS(request: NextRequest) {
//   return new NextResponse(null, {
//     status: 200,
//     headers: {
//       'Access-Control-Allow-Origin': process.env.ADMIN_APP_URL || '*',
//       'Access-Control-Allow-Methods': 'GET, OPTIONS',
//       'Access-Control-Allow-Headers': 'Authorization, Content-Type',
//       'Access-Control-Max-Age': '86400',
//     },
//   });
// }

