"use client";

import { useState, useEffect } from "react";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { useToast } from "~/hooks/use-toast";
import { Check, Download, ExternalLink, QrCode, Globe } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";

interface App {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  route: string;
  category: string;
  installed?: boolean;
}

const availableApps: App[] = [
  {
    id: "worlds",
    name: "Worlds",
    description:
      "Gerador de QR Code para WhatsApp. Crie links wa.me profissionais com formatação E.164.",
    icon: <QrCode className="h-6 w-6" />,
    route: "/apps/worlds",
    category: "Utilidades",
  },
];

export default function AppsPage() {
  const params = useParams();
  const locale = params.locale as string;
  const { toast } = useToast();
  const [installedApps, setInstalledApps] = useState<string[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem("seumei-installed-apps");
    if (saved) {
      try {
        setInstalledApps(JSON.parse(saved));
      } catch (error) {
        console.error("Erro ao carregar apps instalados:", error);
      }
    }
  }, []);

  const isInstalled = (appId: string) => installedApps.includes(appId);

  const handleInstall = (app: App) => {
    if (isInstalled(app.id)) {
      toast({
        title: "App já instalado",
        description: `${app.name} já está instalado.`,
        variant: "default",
      });
      return;
    }

    const newInstalled = [...installedApps, app.id];
    setInstalledApps(newInstalled);
    localStorage.setItem("seumei-installed-apps", JSON.stringify(newInstalled));

    toast({
      title: "✅ App instalado!",
      description: `${app.name} foi instalado com sucesso.`,
      duration: 3000,
    });
  };

  const appsWithStatus = availableApps.map((app) => ({
    ...app,
    installed: isInstalled(app.id),
  }));

  const installedAppsList = appsWithStatus.filter((app) => app.installed);
  const availableAppsList = appsWithStatus.filter((app) => !app.installed);

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="mb-2 text-4xl font-bold">Apps</h1>
          <p className="text-muted-foreground">
            Instale e gerencie seus aplicativos favoritos
          </p>
        </div>

        {/* Installed Apps Section */}
        {installedAppsList.length > 0 && (
          <div className="mb-12">
            <h2 className="mb-4 flex items-center gap-2 text-2xl font-semibold">
              <Check className="h-5 w-5 text-green-500" />
              Apps Instalados
            </h2>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {installedAppsList.map((app) => (
                <Card
                  key={app.id}
                  className="transition-shadow hover:shadow-lg"
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="bg-primary/10 text-primary rounded-lg p-2">
                          {app.icon}
                        </div>
                        <div>
                          <CardTitle className="text-lg">{app.name}</CardTitle>
                          <Badge variant="secondary" className="mt-1">
                            {app.category}
                          </Badge>
                        </div>
                      </div>
                      <Badge
                        variant="outline"
                        className="bg-green-500/10 text-green-600 dark:text-green-400"
                      >
                        <Check className="mr-1 h-3 w-3" />
                        Instalado
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardDescription>{app.description}</CardDescription>
                  </CardContent>
                  <CardFooter>
                    <Link href={`/${locale}${app.route}`} className="w-full">
                      <Button className="w-full" variant="default">
                        <ExternalLink className="mr-2 h-4 w-4" />
                        Abrir App
                      </Button>
                    </Link>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Available Apps Section */}
        <div>
          <h2 className="mb-4 flex items-center gap-2 text-2xl font-semibold">
            <Globe className="h-5 w-5" />
            Apps Disponíveis
          </h2>
          {availableAppsList.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">
                  Todos os apps disponíveis já estão instalados!
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {availableAppsList.map((app) => (
                <Card
                  key={app.id}
                  className="transition-shadow hover:shadow-lg"
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="bg-primary/10 text-primary rounded-lg p-2">
                          {app.icon}
                        </div>
                        <div>
                          <CardTitle className="text-lg">{app.name}</CardTitle>
                          <Badge variant="secondary" className="mt-1">
                            {app.category}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardDescription>{app.description}</CardDescription>
                  </CardContent>
                  <CardFooter>
                    <Button
                      className="w-full"
                      onClick={() => handleInstall(app)}
                      variant="default"
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Instalar
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Empty State */}
        {installedAppsList.length === 0 && availableAppsList.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              <Globe className="text-muted-foreground mx-auto mb-4 h-12 w-12" />
              <p className="text-muted-foreground">
                Nenhum app disponível no momento.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
