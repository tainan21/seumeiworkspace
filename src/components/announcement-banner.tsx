"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import Link from "next/link";

// Chave única para este banner (pode ser alterada quando quiser forçar exibição novamente)
const BANNER_STORAGE_KEY = "seumei_test_phase_banner_dismissed";
const BANNER_VERSION = "v1"; // Incremente para forçar exibição novamente

export function AnnouncementBanner() {
  const [isVisible, setIsVisible] = useState(false); // Começa como false para evitar flash
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    // Marca como montado (client-side)
    setIsMounted(true);
    
    // Verifica se o usuário já fechou este banner
    const dismissed = localStorage.getItem(`${BANNER_STORAGE_KEY}_${BANNER_VERSION}`);
    
    // Só mostra se não foi fechado antes
    setIsVisible(dismissed !== "true");
  }, []);

  const handleDismiss = () => {
    // Salva no localStorage que o usuário fechou
    localStorage.setItem(`${BANNER_STORAGE_KEY}_${BANNER_VERSION}`, "true");
    setIsVisible(false);
  };

  // Não renderiza até estar montado (evita problemas de hidratação)
  if (!isMounted || !isVisible) return null;

  return (
    <div className="bg-primary fixed top-0 right-0 left-0 z-50 border-b">
      <div className="container mx-auto px-4 py-2">
        <div className="flex items-center justify-between">
          <div className="text-primary-foreground flex-1 text-center text-sm font-medium">
            <span className="mr-2">🚀</span>
            Seumei EM fase de testes! Apps, Ai, Extensions, Workspaces, Projetos
            -{" "}
            <Link
              href="https://seumei.taicode.com.br"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold underline-offset-4 transition-all hover:underline"
            >
              Testar agora!
            </Link>
          </div>
          <button
            onClick={handleDismiss}
            className="hover:bg-primary-foreground/20 ml-4 rounded-full p-1.5 transition-colors"
            aria-label="Dismiss announcement"
          >
            <X className="text-primary-foreground h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}