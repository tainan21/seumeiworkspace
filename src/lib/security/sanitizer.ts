/**
 * Sanitização de inputs para segurança
 */

/**
 * Remove tags HTML de uma string
 */
export function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, "");
}

/**
 * Escape de caracteres HTML
 */
export function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  };

  return text.replace(/[&<>"']/g, (m) => map[m]);
}

/**
 * Sanitiza string removendo caracteres perigosos
 */
export function sanitizeString(input: string): string {
  return escapeHtml(input.trim());
}

/**
 * Valida e sanitiza URL
 */
export function sanitizeUrl(url: string): string | null {
  try {
    const parsed = new URL(url);
    
    // Permitir apenas HTTP e HTTPS
    if (!["http:", "https:"].includes(parsed.protocol)) {
      return null;
    }

    return parsed.toString();
  } catch {
    return null;
  }
}

/**
 * Sanitiza objeto removendo propriedades perigosas
 */
export function sanitizeObject<T extends Record<string, unknown>>(
  obj: T
): T {
  const sanitized = { ...obj } as Record<string, unknown>;

  for (const [key, value] of Object.entries(sanitized)) {
    if (typeof value === "string") {
      sanitized[key] = sanitizeString(value);
    } else if (typeof value === "object" && value !== null) {
      sanitized[key] = sanitizeObject(value as Record<string, unknown>);
    }
  }

  return sanitized as T;
}

/**
 * Remove caracteres de controle e normaliza string
 */
export function normalizeString(input: string): string {
  return input
    .replace(/[\x00-\x1F\x7F]/g, "") // Remove caracteres de controle
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, ""); // Remove acentos
}
