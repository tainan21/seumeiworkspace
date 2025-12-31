import { redirect, notFound } from "next/navigation";
import { getCurrentSession } from "~/lib/server/auth/session";

interface WorkspaceLayoutProps {
  children: React.ReactNode;
  params: Promise<{ workspace: string; locale: string }>;
}

/**
 * Layout do workspace
 * Valida autenticação e acesso ao workspace
 */
export default async function WorkspaceLayout({
  children,
  params,
}: WorkspaceLayoutProps) {
  try {
    const sessionResult = await getCurrentSession();

    if (!sessionResult.session || !sessionResult.user) {
      redirect("/login");
    }

    const { workspace: workspaceSlug } = await params;

    if (!workspaceSlug?.trim()) {
      notFound();
    }

    // TODO: Verificar se workspace existe e usuário tem acesso
    // const workspace = await prisma.workspace.findFirst({
    //   where: {
    //     slug: workspaceSlug,
    //     members: {
    //       some: {
    //         userId: sessionResult.user.id,
    //       },
    //     },
    //   },
    // });

    // if (!workspace) {
    //   redirect("/dashboard/workspaces");
    // }

    return (
      <div className="flex min-h-screen flex-col">
        {/* TODO: Workspace Header/Navbar */}
        <header className="bg-background border-b">
          <div className="container flex h-16 items-center">
            <div className="text-lg font-semibold">{workspaceSlug}</div>
          </div>
        </header>

        <div className="flex flex-1">
          {/* TODO: Workspace Sidebar */}
          <aside className="bg-muted/40 hidden w-64 border-r lg:block">
            <nav className="p-4">
              {/* Navigation items will be added here */}
            </nav>
          </aside>

          {/* Main Content */}
          <main className="flex-1 p-6">{children}</main>
        </div>
      </div>
    );
  } catch (error) {
    console.error("[WorkspaceLayout] Error:", error);
    redirect("/dashboard/workspaces");
  }
}
