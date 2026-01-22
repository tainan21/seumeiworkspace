"use client";

import { useState } from "react";
import { Button } from "~/components/ui/button";
import { Loader2, Moon, Sun, Monitor } from "lucide-react";
import { submitThemeStep } from "~/app/[locale]/[workspace]/onboarding/actions";
import { toast } from "~/hooks/use-toast";
import { cn } from "~/lib/utils";
import { THEME_PRESET_OPTIONS, THEME_MODE_OPTIONS } from "~/types/theme";

interface ThemeStepProps {
    workspaceId: string;
    onSuccess: () => void;
}

export default function ThemeStep({ workspaceId, onSuccess }: ThemeStepProps) {
    const [mode, setMode] = useState<"light" | "dark">("light");
    const [preset, setPreset] = useState<string>("default");
    const [loading, setLoading] = useState(false);

    async function handleSubmit() {
        setLoading(true);
        try {
            await submitThemeStep(workspaceId, preset, mode);
            toast({
                title: "Tema salvo!",
                description: "Personalização aplicada com sucesso.",
            });
            onSuccess();
        } catch (error) {
            console.error(error);
            toast({
                title: "Erro ao salvar",
                description: "Não foi possível salvar o tema.",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    }

    // Helper to get preset colors for preview
    const currentPreset = THEME_PRESET_OPTIONS.find(p => p.value === preset) || THEME_PRESET_OPTIONS[0];
    const primaryColor = mode === "dark" ? currentPreset.primary.dark : currentPreset.primary.light;

    return (
        <div className="space-y-8">
            {/* Mode Selection */}
            <div className="space-y-4">
                <h3 className="text-lg font-medium">1. Escolha o modo</h3>
                <div className="flex gap-4">
                    <button
                        onClick={() => setMode("light")}
                        className={cn(
                            "flex flex-1 flex-col items-center justify-center gap-2 rounded-lg border-2 p-4 transition-all",
                            mode === "light"
                                ? "border-primary bg-primary/5"
                                : "border-muted hover:border-primary/50"
                        )}
                    >
                        <Sun className="h-6 w-6" />
                        <span>Claro</span>
                    </button>
                    <button
                        onClick={() => setMode("dark")}
                        className={cn(
                            "flex flex-1 flex-col items-center justify-center gap-2 rounded-lg border-2 p-4 transition-all",
                            mode === "dark"
                                ? "border-primary bg-primary/5"
                                : "border-muted hover:border-primary/50"
                        )}
                    >
                        <Moon className="h-6 w-6" />
                        <span>Escuro</span>
                    </button>
                </div>
            </div>

            {/* Preset Selection */}
            <div className="space-y-4">
                <h3 className="text-lg font-medium">2. Escolha o estilo</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {THEME_PRESET_OPTIONS.map((p) => {
                        const pColor = mode === "dark" ? p.primary.dark : p.primary.light;
                        return (
                            <button
                                key={p.value}
                                onClick={() => setPreset(p.value)}
                                className={cn(
                                    "relative flex flex-col items-center gap-3 rounded-lg border-2 p-4 transition-all text-sm",
                                    preset === p.value
                                        ? "border-primary bg-primary/5"
                                        : "border-muted hover:border-primary/50"
                                )}
                            >
                                <div
                                    className="h-10 w-10 rounded-full shadow-sm border"
                                    style={{ backgroundColor: pColor }}
                                />
                                <span className="font-medium">{p.label}</span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Preview Section */}
            <div className="rounded-lg border bg-background p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-4 border-b pb-2">
                    <Monitor className="h-4 w-4 text-muted-foreground" />
                    <span className="text-xs font-medium text-muted-foreground">Preview</span>
                </div>

                {/* Mock UI */}
                <div
                    className={cn(
                        "rounded-md border p-4 transition-colors",
                        mode === "dark" ? "bg-slate-950 text-slate-50 border-slate-800" : "bg-white text-slate-900 border-slate-200"
                    )}
                    style={{
                        // @ts-ignore
                        "--color-primary": primaryColor
                    } as any}
                >
                    <div className="flex justify-between items-center mb-6">
                        <div className="h-6 w-24 rounded bg-muted/50"></div>
                        <div className="flex gap-2">
                            <div className="h-8 w-8 rounded-full bg-muted/50"></div>
                        </div>
                    </div>

                    <div className="mb-4">
                        <div
                            className="h-24 rounded-lg flex items-center justify-center text-white font-medium"
                            style={{ backgroundColor: primaryColor }}
                        >
                            Cor Principal
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="h-20 rounded-lg bg-muted/30 border border-dashed"></div>
                        <div className="h-20 rounded-lg bg-muted/30 border border-dashed"></div>
                    </div>
                </div>
            </div>

            <div className="flex justify-end pt-4">
                <Button
                    onClick={handleSubmit}
                    disabled={loading}
                    size="lg"
                >
                    {loading ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Salvando...
                        </>
                    ) : (
                        "Continuar para Recursos"
                    )}
                </Button>
            </div>
        </div>
    );
}
