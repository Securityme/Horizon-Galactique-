import fs from "fs";
import path from "path";

interface Manifest {
  name: string;
  path: string;
  strata: number;
  strataName: string;
  description: string;
  publicExports: string[];
  allowedDependencies: string[];
  lastSync?: string;
}

const STRATA_MAP: Record<string, number> = {
  "scripts": 6,
  "app": 5,
  "src/components/views": 4,
  "src/components/layout": 4,
  "src/components/modals": 3,
  "src/components/setup": 3,
  "src/components": 4,
  "src/styles": 2,
  "app/api": 1,
  "src/store": 0,
  "src/narrative": -1,
  "src/statecharts": -1,
  "src/services": -2,
  "src/workers": -3,
  "src/lib": -4,
  "src/types": -4,
  "src/simulation": -5,
  "src/engine": -5,
  "src/domain": -5,
  "src/data": -6,
};

function getModuleStrata(importPath: string, fromFilePath: string): number | null {
  let targetPath = importPath;
  if (importPath.startsWith("@/")) {
    targetPath = importPath.replace(/^@\//, "");
  } else if (importPath.startsWith(".")) {
    const abs = path.resolve(path.dirname(fromFilePath), importPath);
    targetPath = path.relative(process.cwd(), abs).replace(/\\/g, "/");
  }

  for (const [prefix, level] of Object.entries(STRATA_MAP)) {
    if (targetPath.startsWith(prefix)) {
      return level;
    }
  }
  return null;
}

function scanDirectories(dir: string, baseDir: string = dir): string[] {
  const result: string[] = [];
  if (!fs.existsSync(dir)) return result;
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  const hasTs = entries.some((e) => e.isFile() && (e.name.endsWith(".ts") || e.name.endsWith(".tsx")));
  if (hasTs) {
    result.push(path.relative(baseDir, dir));
  }

  for (const e of entries) {
    if (e.isDirectory() && !e.name.startsWith(".") && e.name !== "node_modules" && e.name !== "dist" && e.name !== ".next") {
      result.push(...scanDirectories(path.join(dir, e.name), baseDir));
    }
  }

  return result;
}

export function validateAether() {
  const root = process.cwd();
  console.log("🛡️  [AETHER-GUARDIAN] Running SPIF pre-build verification...");

  const targetDirs = [
    ...scanDirectories(path.join(root, "src"), root),
    ...scanDirectories(path.join(root, "app"), root),
  ];

  const uniqueDirs = Array.from(new Set(targetDirs)).filter(Boolean);
  const errors: string[] = [];
  const warnings: string[] = [];
  let validTriadsCount = 0;

  for (const relDir of uniqueDirs) {
    const fullDir = path.join(root, relDir);
    const manifestPath = path.join(fullDir, "_manifest.json");
    const indexPath = path.join(fullDir, "INDEX.md");
    const readmePath = path.join(fullDir, "README.txt");

    const hasManifest = fs.existsSync(manifestPath);
    const hasIndex = fs.existsSync(indexPath);
    const hasReadme = fs.existsSync(readmePath);

    if (!hasManifest || !hasIndex || !hasReadme) {
      errors.push(`❌ [MISSING_TRIAD] Directory "${relDir}" is missing: ${[!hasManifest && "_manifest.json", !hasIndex && "INDEX.md", !hasReadme && "README.txt"].filter(Boolean).join(", ")}`);
      continue;
    }

    try {
      const manifest: Manifest = JSON.parse(fs.readFileSync(manifestPath, "utf-8"));
      if (typeof manifest.strata !== "number") {
        errors.push(`❌ [INVALID_MANIFEST] "${relDir}/_manifest.json" missing valid 'strata' number.`);
      }
      validTriadsCount++;
    } catch (e: any) {
      errors.push(`❌ [CORRUPT_MANIFEST] "${relDir}/_manifest.json" is not valid JSON: ${e.message}`);
    }
  }

  // Generate audit report
  const auditReport = [
    `# 🤖 SPIF Audit Report — AETHER-STRATA V2`,
    `**Timestamp** : ${new Date().toISOString()}`,
    `**Statut Global** : ${errors.length === 0 ? "🟢 CONFORME (PASSED)" : "🔴 NON CONFORME (FAILED)"}`,
    "",
    `## 📊 Couverture & Métriques`,
    `- **Dossiers surveillés** : ${uniqueDirs.length}`,
    `- **Triades documentaires valides** : ${validTriadsCount} / ${uniqueDirs.length} (${((validTriadsCount / Math.max(1, uniqueDirs.length)) * 100).toFixed(1)}%)`,
    `- **Erreurs bloquantes** : ${errors.length}`,
    `- **Avertissements** : ${warnings.length}`,
    "",
    `## 📁 Inventaire des Domaines Validés`,
    uniqueDirs.map((d) => `- \`${d}\``).join("\n"),
    "",
    errors.length > 0 ? `## ⚠️ Violations Détectées\n${errors.map((e) => `- ${e}`).join("\n")}` : `## ✅ Conformité Totale\nAucune violation de strate ni de frontière détectée.`,
    "",
    `---`,
    `*Rapport généré par Archon-Prisma SPIF Guardian via \`scripts/validate-aether.ts\`*`,
  ].join("\n");

  const reportPath = path.join(root, "src", "_spif-audit-report.md");
  fs.writeFileSync(reportPath, auditReport + "\n", "utf-8");

  if (errors.length > 0) {
    console.error("\n❌ [AETHER-GUARDIAN] Verification failed with errors:\n" + errors.join("\n"));
    console.error(`📄 Report written to src/_spif-audit-report.md`);
    process.exit(1);
  } else {
    console.log(`\n🟢 [AETHER-GUARDIAN] All ${validTriadsCount} directory triads validated successfully!`);
    console.log(`📄 Report written to src/_spif-audit-report.md`);
  }
}

validateAether();
