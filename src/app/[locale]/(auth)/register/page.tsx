import { redirect } from "next/navigation";
import AuthForm from "~/components/layout/auth-form";
import { Card } from "~/components/ui/card";
import { getCurrentSession } from "~/lib/server/auth/session";

export default async function Register() {
  const { session } = await getCurrentSession();
  if (session) return redirect("/dashboard");

  // O sistema cria usuários automaticamente no primeiro login
  // Esta página redireciona para login, mas mantém a rota /register funcionando
  return (
    <section>
      <div className="">
        <div className="flex min-h-[calc(100vh-184px)] items-center justify-center md:min-h-[calc(100vh-160px)]">
          <Card className="w-full max-w-[450px] p-6 shadow-md">
            <h2 className="pb-2 text-center text-3xl font-semibold tracking-tight transition-colors">
              Criar Conta
            </h2>
            <p className="text-muted-foreground mb-4 text-center text-sm">
              Faça login para criar sua conta automaticamente
            </p>
            <AuthForm />
          </Card>
        </div>
      </div>
    </section>
  );
}
