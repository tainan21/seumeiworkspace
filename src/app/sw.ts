import { defaultCache } from "@serwist/next/worker";
import type { PrecacheEntry, SerwistGlobalConfig } from "serwist";
import { Serwist } from "serwist";

/**
 * Service Worker Configuration
 * 
 * Este arquivo configura o Service Worker usando Serwist para:
 * - Cache de recursos estáticos (precache)
 * - Cache de requisições de rede (runtime caching)
 * - Atualização automática do service worker
 * - Suporte offline
 */

// Declaração de tipos para TypeScript
// `injectionPoint` é a string que será substituída pelo manifest de precache
// Por padrão, é `"self.__SW_MANIFEST"`
declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}

declare const self: ServiceWorkerGlobalScope;

// Configuração do Serwist
const serwist = new Serwist({
  // Entradas de precache - recursos que serão cacheados na instalação
  precacheEntries: self.__SW_MANIFEST,
  
  // Pular fase de espera - ativa o novo service worker imediatamente
  skipWaiting: true,
  
  // Reivindicar controle de todos os clientes imediatamente
  clientsClaim: true,
  
  // Habilitar navigation preload para melhor performance
  navigationPreload: true,
  
  // Configuração de cache em runtime
  // defaultCache inclui estratégias para:
  // - Imagens: Cache First com fallback para Network
  // - Fontes: Cache First
  // - API: Network First com fallback para Cache
  // - Navegação: Network First
  runtimeCaching: defaultCache,
});

// Adicionar event listeners do Service Worker
serwist.addEventListeners();

// Event listeners adicionais para monitoramento
self.addEventListener("install", (event) => {
  // Service Worker instalado com sucesso
  console.log("🔧 Service Worker instalado");
});

self.addEventListener("activate", (event) => {
  // Service Worker ativado e pronto para uso
  console.log("✅ Service Worker ativado");
});

// Tratamento de erros do Service Worker
self.addEventListener("error", (event) => {
  console.error("❌ Erro no Service Worker:", event.error);
});

self.addEventListener("unhandledrejection", (event) => {
  console.error("❌ Promise rejeitada no Service Worker:", event.reason);
});
