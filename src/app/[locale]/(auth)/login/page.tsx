import { redirect } from "next/navigation";
import AuthForm from "~/components/layout/auth-form";
import { Card } from "~/components/ui/card";
import { getCurrentSession } from "~/lib/server/auth/session";
import { AnimatedBackground } from "~/components/shared/animated-background";

export default async function Login() {
  const { session } = await getCurrentSession();
  if (session) return redirect("/dashboard");
  return (
    <section className="relative min-h-screen bg-zinc-950 overflow-hidden">
      <AnimatedBackground variant="mesh" animated />
      <div className="relative z-10">
        <div className="flex min-h-screen items-center justify-center p-4">
          <Card className="w-full max-w-[450px] p-6 shadow-2xl border-zinc-800/50 bg-zinc-900/50 backdrop-blur-sm">
            <h2 className="pb-2 text-center text-3xl font-semibold tracking-tight transition-colors text-white">
              Login
            </h2>
            <AuthForm />
          </Card>
        </div>
      </div>
    </section>
  );
}