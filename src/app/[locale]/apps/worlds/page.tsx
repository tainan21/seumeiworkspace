"use client";

import { useState, useEffect, useCallback, useMemo, type JSX } from "react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Label } from "~/components/ui/label";
import { Alert, AlertDescription } from "~/components/ui/alert";
import { Badge } from "~/components/ui/badge";
import { Separator } from "~/components/ui/separator";
import {
  Copy,
  ExternalLink,
  Trash2,
  Info,
  Eye,
  EyeOff,
  History,
  Clock,
} from "lucide-react";
import { QRCodeGenerator } from "~/app/[locale]/apps/worlds/_componentes/qr-code-generator";
import { useToast } from "~/hooks/use-toast";
import Image from "next/image";

interface ValidationError {
  field: string;
  message: string;
}

interface GeneratedLink {
  e164: string;
  encodedMessage: string;
  waLink: string;
  timestamp: number;
  preview: string;
}

interface HistoryItem {
  e164: string;
  message: string;
  waLink: string;
  timestamp: number;
}

export default function WhatsAppLinkGenerator(): JSX.Element {
  const [countryCode, setCountryCode] = useState("55");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [message, setMessage] = useState("");
  const [generatedLink, setGeneratedLink] = useState<GeneratedLink | null>(
    null
  );
  const [errors, setErrors] = useState<ValidationError[]>([]);
  const [showRules, setShowRules] = useState(false);
  const [showEncodedLink, setShowEncodedLink] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    const savedHistory = localStorage.getItem("whatsapp-link-history");
    if (savedHistory) {
      try {
        setHistory(JSON.parse(savedHistory));
      } catch (error) {
        console.error("Erro ao carregar histórico:", error);
      }
    }
  }, []);

  const saveToHistory = useCallback(
    (link: GeneratedLink) => {
      const newItem: HistoryItem = {
        e164: link.e164,
        message: message.trim(),
        waLink: link.waLink,
        timestamp: Date.now(),
      };

      setHistory((prev) => {
        const filtered = prev.filter((item) => item.waLink !== newItem.waLink);
        const newHistory = [newItem, ...filtered].slice(0, 5);
        localStorage.setItem(
          "whatsapp-link-history",
          JSON.stringify(newHistory)
        );
        return newHistory;
      });
    },
    [message]
  );

  const formatPhoneDisplay = (value: string): string => {
    const numbers = value.replace(/\D/g, "");
    if (numbers.length <= 2) return numbers;
    if (numbers.length <= 6)
      return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
    if (numbers.length <= 10)
      return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 6)}-${numbers.slice(6)}`;
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`;
  };

  const sanitizeNumber = (number: string): string => {
    return number.replace(/\D+/g, "");
  };

  const realTimeE164 = useMemo(() => {
    const sanitizedCountryCode = sanitizeNumber(countryCode || "55");
    const sanitizedNumber = sanitizeNumber(phoneNumber);

    if (!sanitizedNumber) return "";

    let finalNumber = sanitizedNumber;
    if (!sanitizedNumber.startsWith(sanitizedCountryCode)) {
      finalNumber = sanitizedCountryCode + sanitizedNumber;
    }

    const countryCodeLength = sanitizedCountryCode.length;
    const nationalPart = finalNumber.substring(countryCodeLength);
    const cleanNationalPart = nationalPart.replace(/^0+/, "");
    return sanitizedCountryCode + cleanNationalPart;
  }, [countryCode, phoneNumber]);

  const linkPreview = useMemo(() => {
    if (!realTimeE164) return "";
    const trimmedMessage = message.trim();
    return trimmedMessage
      ? `https://wa.me/${realTimeE164}?text=${trimmedMessage}`
      : `https://wa.me/${realTimeE164}`;
  }, [realTimeE164, message]);

  const validateAndFormatNumber = (
    countryCode: string,
    phoneNumber: string
  ): { isValid: boolean; e164?: string; errors: ValidationError[] } => {
    const errors: ValidationError[] = [];

    const sanitizedCountryCode = sanitizeNumber(countryCode);
    if (!sanitizedCountryCode || isNaN(Number(sanitizedCountryCode))) {
      errors.push({
        field: "countryCode",
        message: "⚠️ Código do país inválido — use apenas números, ex: 55.",
      });
    }

    const sanitizedNumber = sanitizeNumber(phoneNumber);
    if (!sanitizedNumber) {
      errors.push({
        field: "phoneNumber",
        message:
          "⚠️ Número inválido — remova letras/símbolos e verifique o DDD.",
      });
      return { isValid: false, errors };
    }

    let finalNumber = sanitizedNumber;
    if (!sanitizedNumber.startsWith(sanitizedCountryCode)) {
      finalNumber = sanitizedCountryCode + sanitizedNumber;
    }

    const countryCodeLength = sanitizedCountryCode.length;
    const nationalPart = finalNumber.substring(countryCodeLength);
    const cleanNationalPart = nationalPart.replace(/^0+/, "");
    finalNumber = sanitizedCountryCode + cleanNationalPart;

    if (finalNumber.length < 7) {
      errors.push({
        field: "phoneNumber",
        message:
          "⚠️ Número muito curto após formatação — verifique DDD e número.",
      });
    } else if (finalNumber.length > 15) {
      errors.push({
        field: "phoneNumber",
        message: "⚠️ Número muito longo — E.164 permite até 15 dígitos.",
      });
    }

    return {
      isValid: errors.length === 0,
      e164: finalNumber,
      errors,
    };
  };

  const processMessage = (
    message: string
  ): {
    processedMessage: string;
    encodedMessage: string;
    warnings: ValidationError[];
  } => {
    const warnings: ValidationError[] = [];
    const trimmed = message.trim().replace(/\s+/g, " ");

    if (trimmed.length > 4096) {
      warnings.push({
        field: "message",
        message: "⚠️ Mensagem muito longa — limite 4096 caracteres.",
      });
    }

    const encoded = trimmed ? encodeURIComponent(trimmed) : "";

    return {
      processedMessage: trimmed,
      encodedMessage: encoded,
      warnings,
    };
  };

  const generateLink = () => {
    setErrors([]);

    const numberValidation = validateAndFormatNumber(
      countryCode || "55",
      phoneNumber
    );
    const messageProcessing = processMessage(message);

    const allErrors = [
      ...numberValidation.errors,
      ...messageProcessing.warnings,
    ];

    if (numberValidation.isValid && numberValidation.e164) {
      const waLink = messageProcessing.encodedMessage
        ? `https://wa.me/${numberValidation.e164}?text=${messageProcessing.encodedMessage}`
        : `https://wa.me/${numberValidation.e164}`;

      const newLink: GeneratedLink = {
        e164: numberValidation.e164,
        encodedMessage: messageProcessing.encodedMessage,
        waLink,
        timestamp: Date.now(),
        preview: linkPreview,
      };

      setGeneratedLink(newLink);
      saveToHistory(newLink);

      toast({
        title: "✅ Link gerado com sucesso!",
        description: `Número formatado: +${numberValidation.e164}`,
        duration: 3000,
      });
    }

    if (allErrors.length > 0) {
      setErrors(allErrors);
    }
  };

  const copyToClipboard = async () => {
    if (generatedLink) {
      try {
        await navigator.clipboard.writeText(generatedLink.waLink);
        toast({
          title: "📋 Link copiado!",
          description: "O link foi copiado para sua área de transferência",
          duration: 2000,
        });
      } catch (err) {
        toast({
          title: "❌ Erro ao copiar",
          description: "Não foi possível copiar o link",
          variant: "destructive",
          duration: 3000,
        });
      }
    }
  };

  const openWhatsApp = () => {
    if (generatedLink) {
      window.open(generatedLink.waLink, "_blank");
    }
  };

  const clearForm = () => {
    setCountryCode("55");
    setPhoneNumber("");
    setMessage("");
    setGeneratedLink(null);
    setErrors([]);
    setShowEncodedLink(false);
  };

  const useHistoryItem = (item: HistoryItem) => {
    const parts = item.e164.match(/^(\d{1,3})(.+)$/);
    if (parts) {
      setCountryCode(parts[1]);
      setPhoneNumber(parts[2]);
    }
    setMessage(item.message);
    setShowHistory(false);
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem("whatsapp-link-history");
    toast({
      title: "🗑️ Histórico limpo",
      description: "Todos os links foram removidos do histórico",
      duration: 2000,
    });
  };

  const isFormValid = countryCode.trim() && phoneNumber.trim();

  return (
    <div className="min-h-screen p-4">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="mb-2 text-3xl font-bold">Gerador de link WhatsApp</h1>
          <p className="text-muted-foreground text-sm">
            Crie links wa.me profissionais com formatação E.164
          </p>
          <div className="mt-4 flex justify-center gap-2">
            <Badge variant="secondary">100% Client-side</Badge>
            <Badge variant="secondary">E.164 Compliant</Badge>
            <Badge variant="secondary">QR Code</Badge>
          </div>
        </div>

        {/* Main Card */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Gerador de Link</span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowHistory(!showHistory)}
                >
                  <History className="mr-2 h-4 w-4" />
                  Histórico
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowRules(!showRules)}
                >
                  <Info className="mr-2 h-4 w-4" />
                  Regras
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Rules Panel */}
            {showRules && (
              <Alert>
                <AlertDescription>
                  <strong>Regras de formatação:</strong>
                  <ul className="mt-2 space-y-1 text-sm">
                    <li>
                      • Números são sanitizados (removidos caracteres especiais)
                    </li>
                    <li>• Formato E.164: 7-15 dígitos após formatação</li>
                    <li>• Zeros à esquerda são removidos da parte nacional</li>
                    <li>
                      • Mensagens são codificadas preservando acentos e emojis
                    </li>
                    <li>• Código padrão: 55 (Brasil)</li>
                  </ul>
                </AlertDescription>
              </Alert>
            )}

            {/* History Panel */}
            {showHistory && (
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">
                      Histórico (últimos 5)
                    </CardTitle>
                    {history.length > 0 && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={clearHistory}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Limpar
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {history.length === 0 ? (
                    <p className="text-muted-foreground py-4 text-center text-sm">
                      Nenhum link gerado ainda
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {history.map((item, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between rounded-lg border bg-transparent p-3"
                        >
                          <div className="min-w-0 flex-1">
                            <div className="text-sm font-medium">
                              +{item.e164}
                            </div>
                            {item.message && (
                              <div className="text-muted-foreground truncate text-sm">
                                {item.message}
                              </div>
                            )}
                            <div className="text-muted-foreground mt-1 flex items-center text-xs">
                              <Clock className="mr-1 h-3 w-3" />
                              {new Date(item.timestamp).toLocaleString("pt-BR")}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => useHistoryItem(item)}
                            >
                              Usar
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                setHistory((prev) =>
                                  prev.filter((i) => i !== item)
                                )
                              }
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Preview em tempo real */}
            {realTimeE164 && (
              <div className="rounded-lg border bg-transparent p-4">
                <div className="mb-2 text-sm font-medium">
                  📱 Preview em tempo real:
                </div>
                <div className="text-sm">
                  <strong>E.164:</strong> +{realTimeE164}
                </div>
                {linkPreview && (
                  <div className="mt-1 text-xs break-all">
                    <strong>Link:</strong> {linkPreview}
                  </div>
                )}
              </div>
            )}

            {/* Form Fields */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div>
                <Label htmlFor="countryCode">Código do país</Label>
                <Input
                  id="countryCode"
                  type="text"
                  placeholder="55"
                  value={countryCode}
                  onChange={(e) => setCountryCode(e.target.value)}
                  className="mt-1"
                  aria-describedby="country-code-help"
                />
                <div
                  id="country-code-help"
                  className="text-muted-foreground mt-1 text-xs"
                >
                  Ex: 55 (Brasil), 1 (EUA)
                </div>
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="phoneNumber">Número de telefone</Label>
                <Input
                  id="phoneNumber"
                  type="text"
                  placeholder="(11) 3774-7148 ou +551137747148"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="mt-1"
                  aria-describedby="phone-help"
                />
                <div
                  id="phone-help"
                  className="text-muted-foreground mt-1 text-xs"
                >
                  {phoneNumber &&
                    `Formatado: ${formatPhoneDisplay(phoneNumber)}`}
                </div>
              </div>
            </div>

            <div>
              <Label htmlFor="message">Mensagem (opcional)</Label>
              <Textarea
                id="message"
                placeholder="Ex: Olá, tenho interesse no seu produto"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="mt-1 min-h-[100px]"
                maxLength={4096}
                aria-describedby="message-counter"
              />
              <div
                id="message-counter"
                className="mt-1 flex justify-between text-sm"
              >
                <span className="text-muted-foreground text-sm">
                  {message.length}/4096 caracteres
                </span>
                {message.length > 3900 && (
                  <span className="text-warning font-medium">
                    ⚠️ Próximo do limite
                  </span>
                )}
              </div>
            </div>

            {/* Error Messages */}
            {errors.length > 0 && (
              <div className="space-y-2" role="alert" aria-live="polite">
                {errors.map((error, index) => (
                  <Alert key={index} variant="destructive">
                    <AlertDescription>{error.message}</AlertDescription>
                  </Alert>
                ))}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3">
              <Button onClick={generateLink} disabled={!isFormValid}>
                Gerar link
              </Button>
              <Button variant="outline" onClick={clearForm}>
                <Trash2 className="mr-2 h-4 w-4" />
                Limpar
              </Button>
            </div>
            {!isFormValid && (
              <div id="generate-help" className="text-muted-foreground text-xs">
                Preencha o código do país e número para gerar o link
              </div>
            )}
          </CardContent>
        </Card>

        {/* Generated Link Result */}
        {generatedLink && (
          <Card>
            <CardHeader>
              <CardTitle>Link gerado</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Link Display */}
              <div className="rounded-lg border bg-transparent p-4">
                <div className="mb-2 text-sm font-medium">🔗 Link legível:</div>
                <code className="text-sm break-all">
                  {generatedLink.preview}
                </code>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowEncodedLink(!showEncodedLink)}
                >
                  {showEncodedLink ? (
                    <EyeOff className="mr-2 h-4 w-4" />
                  ) : (
                    <Eye className="mr-2 h-4 w-4" />
                  )}
                  {showEncodedLink ? "Ocultar" : "Ver"} link codificado
                </Button>
              </div>

              {showEncodedLink && (
                <div className="rounded-lg border bg-transparent p-4">
                  <div className="mb-2 text-sm font-medium">
                    🔐 Link codificado (real):
                  </div>
                  <code className="text-xs break-all">
                    {generatedLink.waLink}
                  </code>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3">
                <Button variant="outline" size="sm" onClick={copyToClipboard}>
                  <Copy className="mr-2 h-4 w-4" />
                  Copiar link
                </Button>
                <Button variant="outline" size="sm" onClick={openWhatsApp}>
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Abrir no WhatsApp
                </Button>
              </div>

              <Separator />

              {/* QR Code */}
              <QRCodeGenerator url={generatedLink.waLink} />

              {/* JSON Output */}
              <details className="mt-4">
                <summary className="cursor-pointer text-sm font-medium">
                  Ver JSON (para integrações)
                </summary>
                <pre className="mt-2 overflow-x-auto rounded border bg-transparent p-3 text-xs">
                  {JSON.stringify(
                    {
                      e164: generatedLink.e164,
                      encodedMessage: generatedLink.encodedMessage,
                      waLink: generatedLink.waLink,
                    },
                    null,
                    2
                  )}
                </pre>
              </details>
            </CardContent>
          </Card>
        )}

        {/* Footer */}
        <div className="text-muted-foreground mt-8 text-center text-sm">
          <p>
            Acentos e emojis serão preservados e codificados automaticamente.
          </p>
          <p className="mt-1">
            <strong>Exemplo:</strong> (11) 3774-7148 + "olá" →
            https://wa.me/551137747148?text=ol%C3%A1
          </p>
        </div>
      </div>
    </div>
  );
}
