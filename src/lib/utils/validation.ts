/**
 * Valida campos obrigatórios em um objeto
 * @throws Error se algum campo obrigatório estiver vazio
 */
export function validateRequired<T extends Record<string, unknown>>(
    data: T,
    fields: (keyof T)[]
): void {
    for (const field of fields) {
        const value = data[field];
        if (!value || (typeof value === "string" && !value.trim())) {
            throw new Error(`Campo obrigatório: ${String(field)}`);
        }
    }
}

/**
 * Valida formato de e-mail
 */
export function validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * Sanitiza string removendo caracteres especiais
 */
export function sanitizeString(str: string): string {
    return str.trim().replace(/[<>]/g, "");
}

/**
 * Gera slug a partir de string
 */
export function generateSlug(str: string): string {
    return str
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "") // Remove acentos
        .replace(/[^\w\s-]/g, "") // Remove caracteres especiais
        .replace(/\s+/g, "-") // Substitui espaços por hífens
        .replace(/-+/g, "-") // Remove hífens duplicados
        .replace(/^-+|-+$/g, ""); // Remove hífens do início e fim
}
