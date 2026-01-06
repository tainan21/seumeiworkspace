import { redirect } from "next/navigation";
import SidebarNav from "~/components/layout/sidebar-nav";
import { getCurrentSession } from "~/lib/server/auth/session";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default async function DashboardLayout({
  children,
}: DashboardLayoutProps) {
  const { session } = await getCurrentSession();
  if (!session) redirect("/login");

  return (
    <div className="bg-background min-h-screen w-full">
      {/* Header */}
      {/* <header className="sticky top-0 z-40 h-16 w-full border-b bg-background/80 backdrop-blur">
        <div className="flex h-full items-center justify-between px-4 lg:px-6">
          {/* Left */}
      {/* <div className="flex items-center gap-2">
          </div>

          <div className="flex items-center gap-2">
          </div>
        </div>
      </header>
       */}

      {/* Layout */}
      <div className="grid min-h-[calc(100vh-4rem)] grid-cols-1 lg:grid-cols-[280px_1fr]">
        {/* Sidebar */}
        <aside className="bg-muted/30 hidden border-r lg:block">
          <div className="sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto p-4">
            <SidebarNav />
          </div>
        </aside>

        {/* Main */}
        <main className="w-full">
          <div className="mx-auto max-w-[1600px] p-4 lg:p-6">{children}</div>
        </main>
      </div>
    </div>
  );
}
