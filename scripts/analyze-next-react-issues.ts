#!/usr/bin/env tsx
/**
 * Script para analisar problemas comuns de Next.js 16 e React 19
 * 
 * Uso: pnpm tsx scripts/analyze-next-react-issues.ts
 */

import { readFileSync, readdirSync, statSync } from "fs";
import { join } from "path";

interface Issue {
  file: string;
  line: number;
  type: "error" | "warning" | "info";
  message: string;
  suggestion?: string;
}

const issues: Issue[] = [];
const srcDir = join(process.cwd(), "src");

// Tipos que devem ser importados com 'import type'
const TYPE_ONLY_IMPORTS = [
  "ReactNode",
  "ReactElement",
  "ReactComponent",
  "MouseEventHandler",
  "ChangeEventHandler",
  "FormEventHandler",
  "KeyboardEventHandler",
  "RefObject",
  "MutableRefObject",
  "ComponentProps",
  "ComponentPropsWithoutRef",
  "ComponentPropsWithRef",
  "DragEndEvent",
  "DragStartEvent",
  "DragOverEvent",
  "Metadata",
  "Viewport",
];

function scanDirectory(dir: string, extensions: string[] = [".ts", ".tsx"]): string[] {
  const files: string[] = [];
  
  try {
    const entries = readdirSync(dir);
    
    for (const entry of entries) {
      // Ignorar node_modules, .next, etc
      if (entry.startsWith(".") || entry === "node_modules" || entry === ".next") {
        continue;
      }
      
      const fullPath = join(dir, entry);
      const stat = statSync(fullPath);
      
      if (stat.isDirectory()) {
        files.push(...scanDirectory(fullPath, extensions));
      } else if (extensions.some(ext => entry.endsWith(ext))) {
        files.push(fullPath);
      }
    }
  } catch (error) {
    console.error(`Error scanning ${dir}:`, error);
  }
  
  return files;
}

function analyzeFile(filePath: string): Issue[] {
  const fileIssues: Issue[] = [];
  const content = readFileSync(filePath, "utf-8");
  const lines = content.split("\n");
  const relativePath = filePath.replace(process.cwd() + "/", "");

  // 1. Verificar imports de tipos sem 'import type'
  lines.forEach((line, index) => {
    // Verificar imports do React
    if (line.includes("from \"react\"") || line.includes("from 'react'")) {
      TYPE_ONLY_IMPORTS.forEach((typeName) => {
        const regex = new RegExp(`import\\s+\\{[^}]*\\b${typeName}\\b[^}]*\\}\\s+from`);
        if (regex.test(line) && !line.includes("import type")) {
          fileIssues.push({
            file: relativePath,
            line: index + 1,
            type: "error",
            message: `'${typeName}' deve ser importado com 'import type'`,
            suggestion: `import type { ${typeName} } from "react";`,
          });
        }
      });
    }

    // Verificar imports de outras libs
    TYPE_ONLY_IMPORTS.forEach((typeName) => {
      const regex = new RegExp(`import\\s+\\{[^}]*\\b${typeName}\\b[^}]*\\}\\s+from`);
      if (regex.test(line) && !line.includes("import type") && !line.includes("from \"react\"")) {
        fileIssues.push({
          file: relativePath,
          line: index + 1,
          type: "warning",
          message: `'${typeName}' pode precisar de 'import type'`,
          suggestion: `Verificar se '${typeName}' é um tipo e usar 'import type'`,
        });
      }
    });
  });

  // 2. Verificar uso desnecessário de "use client"
  const hasUseClient = content.includes('"use client"') || content.includes("'use client'");
  if (hasUseClient) {
    const hasHooks = /use(State|Effect|Context|Reducer|Callback|Memo|Ref|ImperativeHandle|LayoutEffect|DebugValue)/.test(content);
    const hasEventHandlers = /on(Click|Change|Submit|Focus|Blur|KeyDown|KeyUp|MouseEnter|MouseLeave)/.test(content);
    const hasBrowserAPI = /(window|document|localStorage|sessionStorage|navigator)\./.test(content);
    const hasClientOnlyLib = /(framer-motion|react-spring|@tanstack\/react-query)/.test(content);

    if (!hasHooks && !hasEventHandlers && !hasBrowserAPI && !hasClientOnlyLib) {
      fileIssues.push({
        file: relativePath,
        line: 1,
        type: "warning",
        message: "Possível uso desnecessário de 'use client'",
        suggestion: "Verificar se o componente realmente precisa ser Client Component",
      });
    }
  }

  // 3. Verificar useEffect para hydration
  if (content.includes("useEffect") && content.includes("document.documentElement")) {
    const useEffectRegex = /useEffect\s*\([^)]*document\.documentElement[^)]*\)/g;
    if (useEffectRegex.test(content)) {
      fileIssues.push({
        file: relativePath,
        line: content.split("useEffect")[0].split("\n").length,
        type: "info",
        message: "useEffect para manipular DOM pode causar hydration mismatch",
        suggestion: "Considerar usar script no layout ou suppressHydrationWarning",
      });
    }
  }

  // 4. Verificar Timer type issues
  if (content.includes("NodeJS.Timer") || content.includes("NodeJS.Timeout")) {
    fileIssues.push({
      file: relativePath,
      line: content.split("NodeJS.Timer")[0].split("\n").length || content.split("NodeJS.Timeout")[0].split("\n").length,
      type: "error",
      message: "NodeJS.Timer pode causar conflitos de tipos",
      suggestion: "Usar 'ReturnType<typeof setTimeout>' ou 'number' (browser)",
    });
  }

  // 5. Verificar imports relativos incorretos
  const importRegex = /import\s+.*\s+from\s+['"](\.\.\/|\.\/|~\/)/g;
  let match;
  while ((match = importRegex.exec(content)) !== null) {
    const importPath = match[0].match(/['"]([^'"]+)['"]/)?.[1];
    if (importPath) {
      // Verificar se o caminho existe (simplificado)
      const fullImportPath = importPath.startsWith("~/")
        ? join(process.cwd(), "src", importPath.slice(2))
        : join(filePath, "..", importPath);
      
      // Não verificar existência aqui (muito lento), apenas reportar padrões suspeitos
      if (importPath.includes("_components") && !importPath.startsWith("~/")) {
        fileIssues.push({
          file: relativePath,
          line: content.substring(0, match.index).split("\n").length,
          type: "warning",
          message: `Import relativo pode estar incorreto: ${importPath}`,
          suggestion: "Verificar se o caminho está correto ou usar alias '~/'",
        });
      }
    }
  }

  return fileIssues;
}

// Executar análise
console.log("🔍 Analisando arquivos...\n");

const files = scanDirectory(srcDir);
console.log(`📁 Encontrados ${files.length} arquivos TypeScript/TSX\n`);

files.forEach((file) => {
  const fileIssues = analyzeFile(file);
  issues.push(...fileIssues);
});

// Relatório
console.log("=".repeat(80));
console.log("📊 RELATÓRIO DE ANÁLISE\n");

const errors = issues.filter((i) => i.type === "error");
const warnings = issues.filter((i) => i.type === "warning");
const infos = issues.filter((i) => i.type === "info");

console.log(`❌ Erros: ${errors.length}`);
console.log(`⚠️  Avisos: ${warnings.length}`);
console.log(`ℹ️  Informações: ${infos.length}`);
console.log(`\n📋 Total: ${issues.length} problemas encontrados\n`);

if (errors.length > 0) {
  console.log("=".repeat(80));
  console.log("❌ ERROS CRÍTICOS\n");
  errors.forEach((issue) => {
    console.log(`📄 ${issue.file}:${issue.line}`);
    console.log(`   ${issue.message}`);
    if (issue.suggestion) {
      console.log(`   💡 Sugestão: ${issue.suggestion}`);
    }
    console.log();
  });
}

if (warnings.length > 0) {
  console.log("=".repeat(80));
  console.log("⚠️  AVISOS\n");
  warnings.slice(0, 20).forEach((issue) => {
    console.log(`📄 ${issue.file}:${issue.line}`);
    console.log(`   ${issue.message}`);
    if (issue.suggestion) {
      console.log(`   💡 Sugestão: ${issue.suggestion}`);
    }
    console.log();
  });
  
  if (warnings.length > 20) {
    console.log(`... e mais ${warnings.length - 20} avisos\n`);
  }
}

if (infos.length > 0) {
  console.log("=".repeat(80));
  console.log("ℹ️  INFORMAÇÕES\n");
  infos.slice(0, 10).forEach((issue) => {
    console.log(`📄 ${issue.file}:${issue.line}`);
    console.log(`   ${issue.message}`);
    if (issue.suggestion) {
      console.log(`   💡 Sugestão: ${issue.suggestion}`);
    }
    console.log();
  });
}

console.log("=".repeat(80));
console.log("\n✅ Análise concluída!");
console.log("\n📖 Consulte doc/PLANO-CORRECOES-NEXT-REACT.md para o plano completo de correções.\n");

// Exit code baseado em erros
process.exit(errors.length > 0 ? 1 : 0);
