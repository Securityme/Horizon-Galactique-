import fs from "fs";
import path from "path";
import * as ts from "typescript";

interface StrataDefinition {
  pattern: RegExp;
  level: number;
  domain: string;
  description: string;
}

const STRATA_DEFINITIONS: StrataDefinition[] = [
  { pattern: /^scripts(\/.*)?$/, level: 6, domain: "Governance, AST & CI/CD", description: "Scripts d'analyse, synchronisation des manifestes et vérification AST." },
  { pattern: /^app(\/.*)?$/, level: 5, domain: "App Framework & Routing", description: "Next.js App Router, layouts et pages principales." },
  { pattern: /^src\/components\/views(\/.*)?$/, level: 4, domain: "UI Runtime & Bento Grid", description: "Vues de jeu Bento Grid (Sol, Orbite, Chronique, Stats)." },
  { pattern: /^src\/components\/layout(\/.*)?$/, level: 4, domain: "UI Runtime & Layout", description: "Composants de mise en page, barres d'outils et navigation." },
  { pattern: /^src\/components\/modals(\/.*)?$/, level: 3, domain: "Global UI Overlays & Modals", description: "Modales dynamiques, écrans de configuration et dialogues." },
  { pattern: /^src\/components\/setup(\/.*)?$/, level: 3, domain: "Setup & Onboarding Modals", description: "Écrans d'initialisation de partie et profils de leader." },
  { pattern: /^src\/components(\/.*)?$/, level: 4, domain: "General UI Components", description: "Composants réutilisables d'interface utilisateur." },
  { pattern: /^src\/styles(\/.*)?$/, level: 2, domain: "Design System & Tokens", description: "Tokens visuels, styles globaux et variables de thème." },
  { pattern: /^app\/api(\/.*)?$/, level: 1, domain: "Edge Handlers & Security", description: "Route Handlers Edge sécurisés et isolation IA." },
  { pattern: /^src\/store(\/.*)?$/, level: 0, domain: "Unified State Stores", description: "Gestion globale de l'état UI et simulation (Zustand)." },
  { pattern: /^src\/narrative(\/.*)?$/, level: -1, domain: "Statecharts & Narrative FSM", description: "Moteur narratif, journal des événements et PRNG déterministe." },
  { pattern: /^src\/statecharts(\/.*)?$/, level: -1, domain: "Statecharts & FSM Engine", description: "Machines à états finis des ères et quêtes." },
  { pattern: /^src\/services(\/.*)?$/, level: -2, domain: "Local-First & CRDT I/O", description: "Persistance IndexedDB, deltas et outbox pattern." },
  { pattern: /^src\/workers(\/.*)?$/, level: -3, domain: "Master Hypervisor Worker", description: "Boucle de calcul de tour hors-thread et patchs immuables." },
  { pattern: /^src\/lib(\/.*)?$/, level: -4, domain: "Contracts & Schema Validation", description: "Schémas Zod, contrats de données et utilitaires partagés." },
  { pattern: /^src\/types(\/.*)?$/, level: -4, domain: "Type Definitions & Interfaces", description: "Définitions de types TypeScript stricts." },
  { pattern: /^src\/simulation(\/.*)?$/, level: -5, domain: "Domain Simulation Engine", description: "Moteur de simulation de colonie, démographie et économie." },
  { pattern: /^src\/engine(\/.*)?$/, level: -5, domain: "Core Engine Logic", description: "Règles métier pures de calcul de cycle et résolutions." },
  { pattern: /^src\/domain(\/.*)?$/, level: -5, domain: "DDD Domain Aggregates", description: "Agrégats métier pures (Colonie, Dynastie, Économie)." },
  { pattern: /^src\/data(\/.*)?$/, level: -6, domain: "Kernel Math & Static Seeds", description: "Données statiques, tables de recherche et constantes immuables." },
];

function getStrata(relPath: string): { level: number; domain: string; description: string } {
  const normalized = relPath.replace(/\\/g, "/").replace(/^\.\//, "");
  for (const def of STRATA_DEFINITIONS) {
    if (def.pattern.test(normalized)) {
      return { level: def.level, domain: def.domain, description: def.description };
    }
  }
  return { level: 0, domain: "General Domain", description: "Module applicatif standard." };
}

function analyzeDirectoryAST(dirPath: string) {
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  const tsFiles = entries.filter((e) => e.isFile() && (e.name.endsWith(".ts") || e.name.endsWith(".tsx")));

  const publicExports: string[] = [];
  const dependencies: Set<string> = new Set();
  const fileSummaries: { file: string; exports: string[]; imports: string[] }[] = [];

  for (const f of tsFiles) {
    const filePath = path.join(dirPath, f.name);
    const content = fs.readFileSync(filePath, "utf-8");
    const sourceFile = ts.createSourceFile(
      f.name,
      content,
      ts.ScriptTarget.Latest,
      true,
      f.name.endsWith(".tsx") ? ts.ScriptKind.TSX : ts.ScriptKind.TS
    );

    const fileExports: string[] = [];
    const fileImports: string[] = [];

    function visit(node: ts.Node) {
      if (ts.isExportDeclaration(node)) {
        if (node.exportClause && ts.isNamedExports(node.exportClause)) {
          node.exportClause.elements.forEach((el) => {
            fileExports.push(el.name.text);
          });
        }
      } else if (ts.isExportAssignment(node)) {
        fileExports.push("default");
      } else if (ts.isFunctionDeclaration(node) || ts.isClassDeclaration(node) || ts.isInterfaceDeclaration(node) || ts.isTypeAliasDeclaration(node) || ts.isEnumDeclaration(node)) {
        const isExported = node.modifiers?.some((m) => m.kind === ts.SyntaxKind.ExportKeyword);
        if (isExported && node.name) {
          fileExports.push(node.name.text);
        }
      } else if (ts.isVariableStatement(node)) {
        const isExported = node.modifiers?.some((m) => m.kind === ts.SyntaxKind.ExportKeyword);
        if (isExported) {
          node.declarationList.declarations.forEach((decl) => {
            if (ts.isIdentifier(decl.name)) {
              fileExports.push(decl.name.text);
            }
          });
        }
      } else if (ts.isImportDeclaration(node)) {
        const moduleSpecifier = node.moduleSpecifier;
        if (ts.isStringLiteral(moduleSpecifier)) {
          dependencies.add(moduleSpecifier.text);
          fileImports.push(moduleSpecifier.text);
        }
      }
      ts.forEachChild(node, visit);
    }

    visit(sourceFile);
    fileExports.forEach((exp) => {
      if (!publicExports.includes(exp)) publicExports.push(exp);
    });

    fileSummaries.push({
      file: f.name,
      exports: fileExports,
      imports: fileImports,
    });
  }

  return { publicExports, dependencies: Array.from(dependencies).sort(), fileSummaries };
}

function processDirectory(workspaceRoot: string, relDir: string) {
  const fullDir = path.join(workspaceRoot, relDir);
  if (!fs.existsSync(fullDir)) return;

  const strata = getStrata(relDir);
  const ast = analyzeDirectoryAST(fullDir);
  const dirName = path.basename(relDir);

  // 1. _manifest.json
  const manifestPath = path.join(fullDir, "_manifest.json");
  const manifestData = {
    name: dirName,
    path: relDir.replace(/\\/g, "/"),
    strata: strata.level,
    strataName: strata.domain,
    description: strata.description,
    publicExports: ast.publicExports,
    allowedDependencies: ast.dependencies,
    lastSync: new Date().toISOString(),
  };
  fs.writeFileSync(manifestPath, JSON.stringify(manifestData, null, 2) + "\n", "utf-8");

  // 2. INDEX.md (AI Semantic Map)
  const indexPath = path.join(fullDir, "INDEX.md");
  const indexContent = [
    `# 📜 Sémantique de Domaine : ${dirName}`,
    `**Strate AETHER** : \`${strata.level}\` — *${strata.domain}*`,
    `**Chemin relatif** : \`${relDir.replace(/\\/g, "/")}\``,
    "",
    `## 🎯 Responsabilité`,
    strata.description,
    "",
    `## 📦 Exports Publics (${ast.publicExports.length})`,
    ast.publicExports.length > 0
      ? ast.publicExports.map((e) => `- \`${e}\``).join("\n")
      : "_Aucun export nommé direct._",
    "",
    `## 🔗 Dépendances Externes & Modules Importés`,
    ast.dependencies.length > 0
      ? ast.dependencies.map((d) => `- \`${d}\``).join("\n")
      : "_Module autonome sans imports externes._",
    "",
    `## 📁 Fichiers Source Détectés`,
    ast.fileSummaries.length > 0
      ? ast.fileSummaries
          .map(
            (f) =>
              `- **\`${f.file}\`** (${f.exports.length} exports)\n  - Exports : ${
                f.exports.length ? f.exports.map((e) => `\`${e}\``).join(", ") : "aucun"
              }`
          )
          .join("\n")
      : "_Aucun fichier TypeScript dans ce répertoire._",
    "",
    `---`,
    `*Généré automatiquement par AST Hypervisor via \`scripts/sync-manifests.ts\`*`,
  ].join("\n");
  fs.writeFileSync(indexPath, indexContent + "\n", "utf-8");

  // 3. README.txt (Low-token fallback)
  const readmePath = path.join(fullDir, "README.txt");
  const readmeContent = [
    `DOMAINE: ${dirName}`,
    `STRATE: ${strata.level} (${strata.domain})`,
    `DESC: ${strata.description}`,
    `EXPORTS: ${ast.publicExports.join(", ") || "none"}`,
    `DEPS: ${ast.dependencies.join(", ") || "none"}`,
  ].join("\n");
  fs.writeFileSync(readmePath, readmeContent + "\n", "utf-8");
}

function scanAllDirectories(dir: string, baseDir: string = dir): string[] {
  const result: string[] = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  const hasTs = entries.some((e) => e.isFile() && (e.name.endsWith(".ts") || e.name.endsWith(".tsx")));
  if (hasTs) {
    result.push(path.relative(baseDir, dir));
  }

  for (const e of entries) {
    if (e.isDirectory() && !e.name.startsWith(".") && e.name !== "node_modules" && e.name !== "dist" && e.name !== ".next") {
      result.push(...scanAllDirectories(path.join(dir, e.name), baseDir));
    }
  }

  return result;
}

export function syncAllManifests() {
  const root = process.cwd();
  console.log("🔄 [MANIFESTS-SYNC] Starting AST analysis across codebase...");

  const targetDirs = [
    ...scanAllDirectories(path.join(root, "src"), root),
    ...scanAllDirectories(path.join(root, "app"), root),
  ];

  const uniqueDirs = Array.from(new Set(targetDirs)).filter(Boolean);

  for (const relDir of uniqueDirs) {
    processDirectory(root, relDir);
    console.log(`  ✓ Synced triad in: ${relDir}`);
  }

  console.log(`🟢 [MANIFESTS-SYNC] Successfully synchronized ${uniqueDirs.length} triads across AETHER-STRATA.`);
}

syncAllManifests();
