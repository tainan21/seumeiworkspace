"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import type { ThemeMode, ThemePreset } from "~/types/theme";
import { isValidThemeMode, isValidThemePreset } from "~/types/theme";

const THEME_MODE_COOKIE = "theme_mode";
const THEME_PRESET_COOKIE = "theme_preset";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // 1 ano

/**
 * Atualiza o modo do tema (light/dark/system)
 */
export async function updateThemeMode(mode: ThemeMode) {
    try {
        if (!isValidThemeMode(mode)) {
            throw new Error("Modo de tema inválido");
        }

        const cookieStore = await cookies();
        cookieStore.set(THEME_MODE_COOKIE, mode, {
            path: "/",
            maxAge: COOKIE_MAX_AGE,
            sameSite: "lax",
            secure: process.env.NODE_ENV === "production",
        });

        revalidatePath("/dashboard", "layout");

        return { success: true };
    } catch (error) {
        console.error("[updateThemeMode] Error:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Erro ao atualizar modo do tema",
        };
    }
}

/**
 * Atualiza o preset do tema
 */
export async function updateThemePreset(preset: ThemePreset) {
    try {
        if (!isValidThemePreset(preset)) {
            throw new Error("Preset de tema inválido");
        }

        const cookieStore = await cookies();
        cookieStore.set(THEME_PRESET_COOKIE, preset, {
            path: "/",
            maxAge: COOKIE_MAX_AGE,
            sameSite: "lax",
            secure: process.env.NODE_ENV === "production",
        });

        revalidatePath("/dashboard", "layout");

        return { success: true };
    } catch (error) {
        console.error("[updateThemePreset] Error:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Erro ao atualizar preset do tema",
        };
    }
}

/**
 * Busca preferências de tema atuais
 */
export async function getThemePreferences() {
    try {
        const cookieStore = await cookies();
        const mode = cookieStore.get(THEME_MODE_COOKIE)?.value || "light";
        const preset = cookieStore.get(THEME_PRESET_COOKIE)?.value || "default";

        return {
            success: true,
            data: {
                mode: isValidThemeMode(mode) ? mode : "light",
                preset: isValidThemePreset(preset) ? preset : "default",
            },
        };
    } catch (error) {
        console.error("[getThemePreferences] Error:", error);
        return {
            success: false,
            error: "Erro ao buscar preferências de tema",
            data: { mode: "light" as ThemeMode, preset: "default" as ThemePreset },
        };
    }
}
