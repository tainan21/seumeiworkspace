"use client";

import { useState, useEffect } from "react";
import type { FormEvent } from "react";
import { GridBackground } from "~/components/shared/whitelist/grid-brackground";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { Avatar, AvatarFallback } from "~/components/ui/avatar";
import { Icons } from "~/components/shared/whitelist/icons";
import {
  subscribeToWaitlist,
  getWaitlistCount,
} from "~/domains/whitelist";

export default function Page() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [count, setCount] = useState<number | null>(null);

  // Carregar contador na montagem
  useEffect(() => {
    async function loadCount() {
      try {
        const total = await getWaitlistCount();
        setCount(total);
      } catch (err) {
        console.error("Erro ao carregar contador:", err);
        setCount(0);
      }
    }
    loadCount();
  }, []);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Validação client-side básica
    if (!email.trim()) {
      setError("Por favor, insira um email");
      setIsSuccess(false);
      return;
    }

    if (!email.includes("@") || !email.includes(".")) {
      setError("Por favor, insira um email válido");
      setIsSuccess(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    setIsSuccess(false);

    try {
      const result = await subscribeToWaitlist(email);

      if (result.success) {
        setIsSuccess(true);
        setEmail("");
        // Recarregar contador
        const newCount = await getWaitlistCount();
        setCount(newCount);
        // Limpar mensagem de sucesso após 5 segundos
        setTimeout(() => {
          setIsSuccess(false);
        }, 5000);
      } else {
        setError(result.message || "Erro ao processar inscrição");
        setIsSuccess(false);
      }
    } catch (err: any) {
      setError(err.message || "Erro ao processar inscrição. Tente novamente.");
      setIsSuccess(false);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen">
      <GridBackground />
      <div className="relative z-10 flex items-center justify-center min-h-screen">
        <div className="w-full max-w-xl mx-auto p-8 space-y-12">
          <div className="space-y-6 text-center">
            <h2 className="text-4xl sm:text-5xl font-extrabold text-center bg-clip-text text-transparent bg-gradient-to-br from-gray-200 to-gray-600">
              Join Our Product Launch Waitlist
            </h2>
            <p className="text-xl text-gray-400 max-w-lg mx-auto">
              Be part of something truly extraordinary. Join thousands of others
              already gaining early access to our revolutionary new product.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex gap-2 max-w-md mx-auto">
              <Input
                type="email"
                placeholder="Enter your email"
                className="h-12 bg-gray-950/50 border-gray-800"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                required
              />
              <Button
                type="submit"
                className="h-12 px-6 bg-black hover:bg-black/90 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                variant="ghost"
                disabled={isLoading}
              >
                {isLoading ? "..." : "Get Notified"}
              </Button>
            </div>

            {/* Mensagens de feedback */}
            {isSuccess && (
              <div className="max-w-md mx-auto p-3 text-sm text-center text-green-400 bg-green-400/10 rounded-md border border-green-400/20">
                Inscrição realizada com sucesso! Verifique seu email.
              </div>
            )}

            {error && (
              <div className="max-w-md mx-auto p-3 text-sm text-center text-red-400 bg-red-400/10 rounded-md border border-red-400/20">
                {error}
              </div>
            )}
          </form>

          <div className="flex flex-col items-center gap-8">
            <div className="flex items-center gap-4">
              <div className="flex -space-x-3">
                <Avatar className="border-2 w-12 h-12">
                  <AvatarFallback className="text-sm font-semibold border-white/20 bg-purple-600">
                    JD
                  </AvatarFallback>
                </Avatar>
                <Avatar className="border-2 w-12 h-12">
                  <AvatarFallback className="text-sm font-semibold border-white/20 bg-blue-600">
                    AS
                  </AvatarFallback>
                </Avatar>
                <Avatar className="border-2 w-12 h-12">
                  <AvatarFallback className="text-sm font-semibold border-white/20 bg-blue-700">
                    MK
                  </AvatarFallback>
                </Avatar>
              </div>
              <span className="font-bold">
                {count !== null
                  ? `${count}+ people on the waitlist`
                  : "Loading..."}
              </span>
            </div>

            <div className="flex gap-6 justify-center">
              <Button
                variant="ghost"
                size="icon"
                className="text-gray-400 hover:text-gray-300"
              >
                <Icons.twitter className="w-5 h-5 fill-current" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="text-gray-400 hover:text-gray-300"
              >
                <Icons.gitHub className="w-5 h-5 fill-current" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
