import fs from "fs"
import path from "path"

const ROOT = process.cwd()
const OUTPUT_DIR = path.join(ROOT, "patterns")

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR)
}

// Classificação de arquivos por tipo e propósito
function classifyFile(filePath, fileName) {
  const ext = path.extname(fileName)
  const baseName = path.basename(fileName, ext)
  const dirPath = path.dirname(filePath).replace(ROOT, "").replace(/\\/g, "/")
  
  const classification = {
    type: "unknown",
    category: "misc",
    purpose: "implementation",
    layer: "unknown"
  }

  // Classificação por extensão
  if (ext === ".tsx" || ext === ".jsx") {
    classification.type = "component"
    if (fileName === "page.tsx" || fileName === "layout.tsx") {
      classification.type = "route"
      classification.purpose = "routing"
    } else if (fileName.includes("form") || fileName.includes("Form")) {
      classification.type = "form"
      classification.purpose = "data-entry"
    } else if (fileName.includes("table") || fileName.includes("list")) {
      classification.type = "data-display"
      classification.purpose = "data-visualization"
    }
  } else if (ext === ".ts" || ext === ".js") {
    if (fileName === "route.ts" || fileName === "route.js") {
      classification.type = "api-route"
      classification.purpose = "api-endpoint"
    } else if (fileName === "schema.ts") {
      classification.type = "schema"
      classification.purpose = "data-definition"
    } else if (fileName.includes("action") || fileName.includes("Action")) {
      classification.type = "action"
      classification.purpose = "business-logic"
    } else if (fileName.includes("client") || fileName.includes("Client")) {
      classification.type = "client"
      classification.purpose = "external-integration"
    } else if (fileName.includes("types") || fileName.includes("Types")) {
      classification.type = "types"
      classification.purpose = "type-definition"
    } else if (fileName.includes("context") || fileName.includes("Context")) {
      classification.type = "context"
      classification.purpose = "state-management"
    } else {
      classification.type = "utility"
      classification.purpose = "helper"
    }
  } else if (ext === ".sql") {
    classification.type = "migration"
    classification.purpose = "database-schema"
  } else if (ext === ".md") {
    classification.type = "documentation"
    classification.purpose = "knowledge"
  } else if (ext === ".json") {
    classification.type = "config"
    classification.purpose = "configuration"
  }

  // Classificação por camada/contexto
  if (dirPath.startsWith("/app/api")) {
    classification.layer = "api"
    classification.category = "backend"
  } else if (dirPath.startsWith("/app") && !dirPath.startsWith("/app/api")) {
    classification.layer = "pages"
    classification.category = "frontend"
  } else if (dirPath.startsWith("/components")) {
    classification.layer = "components"
    classification.category = "frontend"
  } else if (dirPath.startsWith("/lib")) {
    classification.layer = "lib"
    classification.category = "shared"
  } else if (dirPath.startsWith("/drizzle")) {
    classification.layer = "database"
    classification.category = "data"
  } else if (dirPath.startsWith("/hooks")) {
    classification.layer = "hooks"
    classification.category = "frontend"
  } else if (dirPath.startsWith("/scripts")) {
    classification.layer = "scripts"
    classification.category = "tooling"
  } else if (dirPath.startsWith("/docs")) {
    classification.layer = "docs"
    classification.category = "documentation"
  }

  return classification
}

// Estrutura de dados para árvore
function buildTree(dir, relativePath = "") {
  const entries = fs.readdirSync(dir, { withFileTypes: true })
  const tree = {
    path: relativePath || "/",
    type: "directory",
    nodeType: "directory",
    children: []
  }

  for (const entry of entries) {
    if (entry.name.startsWith(".") || entry.name === "node_modules") continue

    const fullPath = path.join(dir, entry.name)
    const relPath = path.join(relativePath, entry.name).replace(/\\/g, "/")

    if (entry.isDirectory()) {
      tree.children.push(buildTree(fullPath, relPath))
    } else {
      const classification = classifyFile(fullPath, entry.name)
      tree.children.push({
        path: relPath,
        name: entry.name,
        nodeType: "file",
        ...classification
      })
    }
  }

  return tree
}

// Gera índice por categoria
function generateIndex(tree, index = {}) {
  if (tree.nodeType === "file") {
    const cat = tree.category || "misc"
    const layer = tree.layer || "unknown"
    const fileType = tree.type || "unknown"
    
    if (!index[cat]) index[cat] = {}
    if (!index[cat][layer]) index[cat][layer] = {}
    if (!index[cat][layer][fileType]) index[cat][layer][fileType] = []
    
    index[cat][layer][fileType].push({
      path: tree.path,
      name: tree.name,
      purpose: tree.purpose
    })
  } else if (tree.children) {
    tree.children.forEach(child => generateIndex(child, index))
  }
  return index
}

// Formato ultra-compacto para LLMs
function formatForLLM(tree, index, depth = 0) {
  const indent = "  ".repeat(depth)
  let output = ""

  if (depth === 0) {
    // Header mínimo: apenas legenda abreviada
    output += `# SYSTEM STRUCTURE\n`
    output += `T:type L:layer C:cat | T:r(oute),c(omp),a(pi),s(chema),x(action),t(ypes),u(til),m(ig) | L:a(pi),p(ages),c(omp),l(ib),d(b),h(ooks) | C:fe,be,sh,da,to\n\n`
  }

  if (tree.type === "directory" || tree.nodeType === undefined) {
    const dirName = path.basename(tree.path) || "ROOT"
    if (dirName === "ROOT" && depth === 0) {
      // Não imprime ROOT, começa direto
    } else {
      output += `${indent}${dirName}/\n`
    }
    if (tree.children && tree.children.length > 0) {
      tree.children.forEach(child => {
        output += formatForLLM(child, index, depth + 1)
      })
    }
  } else if (tree.nodeType === "file") {
    // Formato: nome[T:t,L:l,C:c] - tudo em uma linha
    const parts = []
    if (tree.type !== "unknown") {
      const typeMap = { route: "r", component: "c", "api-route": "a", schema: "s", action: "x", types: "t", utility: "u", migration: "m", form: "f", "data-display": "d" }
      parts.push(`T:${typeMap[tree.type] || tree.type.substring(0, 1)}`)
    }
    if (tree.layer !== "unknown") {
      const layerMap = { api: "a", pages: "p", components: "c", lib: "l", database: "d", hooks: "h" }
      parts.push(`L:${layerMap[tree.layer] || tree.layer.substring(0, 1)}`)
    }
    if (tree.category !== "misc") {
      const catMap = { frontend: "fe", backend: "be", shared: "sh", data: "da", tooling: "to" }
      parts.push(`C:${catMap[tree.category] || tree.category.substring(0, 2)}`)
    }
    
    const metaStr = parts.length > 0 ? `[${parts.join(",")}]` : ""
    output += `${indent}${tree.name}${metaStr}\n`
  }

  return output
}

// Versão visual simples (mantida para compatibilidade)
function readTree(dir, prefix = "") {
  const entries = fs.readdirSync(dir, { withFileTypes: true })

  let lines = []

  for (const entry of entries) {
    if (entry.name.startsWith(".") || entry.name === "node_modules") continue

    const fullPath = path.join(dir, entry.name)
    const line = `${prefix}${entry.isDirectory() ? "📁" : "📄"} ${entry.name}`
    lines.push(line)

    if (entry.isDirectory()) {
      lines = lines.concat(readTree(fullPath, prefix + "  "))
    }
  }

  return lines
}

// Gera ambas as versões
const tree = buildTree(ROOT)
const index = generateIndex(tree)
const treeVisual = readTree(ROOT).join("\n")

// Versão Zara (agentes/LLMs) - Estruturada
const zaraOutput = formatForLLM(tree, index)

// Versão Tai (humanos) - Visual
const taiOutput = `
# SYSTEM MAP (HUMAN VIEW)

How to read:
📁 = domain boundary
📄 = implementation detail

This map shows WHERE things live,
not HOW they are implemented.

Structure:
${treeVisual}

Notes:
- db/schema = source of truth
- migrations = history
- lib = usage
`

fs.writeFileSync(path.join(OUTPUT_DIR, "pattern_zara.md"), zaraOutput)
fs.writeFileSync(path.join(OUTPUT_DIR, "pattern_tai.md"), taiOutput)

console.log("Patterns generated in /patterns")
console.log("- pattern_zara.md: Structured format for LLMs/Agents")
console.log("- pattern_tai.md: Visual format for humans")
