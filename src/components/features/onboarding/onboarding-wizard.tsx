"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import EnterpriseStep from "./steps/enterprise-step";
import CategoryStep from "./steps/category-step";
import ThemeStep from "./steps/theme-step";
import FeaturesStep from "./steps/features-step";
import ProductStep from "./steps/product-step";
import { Card } from "~/components/ui/card";
import { Progress } from "~/components/ui/progress";

interface OnboardingWizardProps {
    workspace: any;
    progress: any;
}

const STEPS = [
    { id: 1, title: "Sobre a Empresa", description: "Dados fiscais e contato" },
    { id: 2, title: "Categoria", description: "Segmento de atuação" },
    { id: 3, title: "Aparência", description: "Personalize seu sistema" },
    { id: 4, title: "Recursos", description: "Escolha suas ferramentas" },
    { id: 5, title: "Primeiro Produto", description: "Cadastre um item" },
];

export function OnboardingWizard({ workspace, progress }: OnboardingWizardProps) {
    const router = useRouter();
    const [currentStep, setCurrentStep] = useState(progress.currentStep || 1);

    // Calcular progresso da barra
    const progressPercentage = ((currentStep - 1) / STEPS.length) * 100;

    const renderStep = () => {
        switch (currentStep) {
            case 1:
                return (
                    <div className="p-4">
                        <h2 className="text-2xl font-bold mb-4">Configurar Empresa</h2>
                        <p className="text-muted-foreground mb-6">
                            Vamos começar configurando os dados principais do seu negócio.
                        </p>
                        <EnterpriseStep workspaceId={workspace.id} onSuccess={() => setCurrentStep(2)} />
                    </div>
                );
            case 2:
                return (
                    <div className="p-4">
                        <h2 className="text-2xl font-bold mb-4">Escolha sua Categoria</h2>
                        <p className="text-muted-foreground mb-6">
                            Isso nos ajuda a configurar o sistema ideal para você.
                        </p>
                        <CategoryStep workspaceId={workspace.id} onSuccess={() => setCurrentStep(3)} />
                    </div>
                );
            case 3:
                return (
                    <div className="p-4">
                        <h2 className="text-2xl font-bold mb-4">Personalize a Aparência</h2>
                        <p className="text-muted-foreground mb-6">
                            Deixe o sistema com a cara da sua empresa.
                        </p>
                        <ThemeStep workspaceId={workspace.id} onSuccess={() => setCurrentStep(4)} />
                    </div>
                );
            case 4:
                return (
                    <div className="p-4">
                        <h2 className="text-2xl font-bold mb-4">Ative suas Funcionalidades</h2>
                        <p className="text-muted-foreground mb-6">
                            Experimente tudo o que podemos oferecer (7 dias grátis).
                        </p>
                        <FeaturesStep workspaceId={workspace.id} onSuccess={() => setCurrentStep(5)} />
                    </div>
                );
            case 5:
                return (
                    <div className="p-4">
                        <h2 className="text-2xl font-bold mb-4">Adicione seu Primeiro Produto</h2>
                        <p className="text-muted-foreground mb-6">
                            Para finalizar, vamos criar um produto ou serviço de exemplo.
                        </p>
                        <ProductStep workspaceId={workspace.id} onSuccess={() => router.push(`/${workspace.slug}`)} />
                    </div>
                );
            default:
                return <div>Passo desconhecido</div>;
        }
    };

    return (
        <div className="max-w-3xl mx-auto py-8 px-4">
            {/* Header */}
            <div className="mb-8 text-center">
                <h1 className="text-3xl font-bold mb-2">Bem-vindo ao {workspace.name}!</h1>
                <p className="text-muted-foreground">
                    Vamos configurar seu ambiente em poucos passos.
                </p>
            </div>

            {/* Progress Bar */}
            <div className="mb-8">
                <div className="flex justify-between text-sm mb-2">
                    <span>Passo {currentStep} de {STEPS.length}</span>
                    <span>{Math.round(progressPercentage)}%</span>
                </div>
                <Progress value={progressPercentage} className="h-2" />

                {/* Steps Indicators */}
                <div className="flex justify-between mt-4 px-2">
                    {STEPS.map((step) => (
                        <div
                            key={step.id}
                            className={`flex flex-col items-center max-w-[80px] text-center ${step.id === currentStep
                                ? "text-primary font-medium"
                                : step.id < currentStep
                                    ? "text-primary/70"
                                    : "text-muted-foreground/50"
                                }`}
                        >
                            <div
                                className={`w-8 h-8 rounded-full flex items-center justify-center mb-2 border-2 transition-colors ${step.id === currentStep
                                    ? "border-primary bg-primary text-primary-foreground"
                                    : step.id < currentStep
                                        ? "border-primary bg-primary/20 text-primary"
                                        : "border-muted text-muted-foreground"
                                    }`}
                            >
                                {step.id < currentStep ? "✓" : step.id}
                            </div>
                            <span className="text-xs hidden sm:block">{step.title}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Main Content */}
            <Card className="min-h-[400px]">
                {renderStep()}
            </Card>

            {/* Tip/Footer */}
            <div className="mt-8 text-center text-sm text-muted-foreground">
                <p>Precisa de ajuda? Entre em contato com o suporte.</p>
            </div>
        </div>
    );
}
