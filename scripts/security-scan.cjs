const fs = require("node:fs");
const path = require("node:path");
const { execSync } = require("node:child_process");

console.log("🔒 [Security Scanner] Starting comprehensive security scan for AccessGraph...");

const rootDir = path.resolve(__dirname, "..");
const distDir = path.join(rootDir, "dist");

const violations = [];
let historyScannedCount = 0;
let filesScannedCount = 0;

const SECRET_PATTERNS = [
  {
    name: "Private Key Assignment",
    regex: /(?:PRIVATE_KEY|private_key|secret_key|seed_key)\s*[:=]\s*["']?(?:0x)?[a-fA-F0-9]{64}["']?/gi,
  },
  {
    name: "GitHub Personal Access Token",
    regex: /ghp_[a-zA-Z0-9]{36}/g,
  },
  {
    name: "AWS Access Key",
    regex: /AKIA[0-9A-Z]{16}/g,
  },
];

function scanText(content, sourceLabel) {
  for (const { name, regex } of SECRET_PATTERNS) {
    let match;
    const re = new RegExp(regex.source, regex.flags);
    while ((match = re.exec(content)) !== null) {
      const snippet = match[0];
      const preview = snippet.includes(":") || snippet.includes("=")
        ? snippet.split(/[:=]/)[0].trim()
        : snippet.slice(0, 4) + "…";
      violations.push(`Potential ${name} detected in ${sourceLabel} under '${preview}' [VALUE REDACTED]`);
    }
  }
}

// 1. Git History Scan
console.log("🔍 [1/3] Scanning Git commit history...");
try {
  const isShallow = execSync("git rev-parse --is-shallow-repository", {
    cwd: rootDir,
    encoding: "utf8",
  }).trim() === "true";

  if (isShallow) {
    violations.push("Repository clone is shallow (is-shallow-repository: true). Full-history scanning cannot be verified on shallow clones. Ensure 'fetch-depth: 0' in CI.");
  }

  const revListOutput = execSync("git rev-list --all", {
    cwd: rootDir,
    encoding: "utf8",
    maxBuffer: 10 * 1024 * 1024,
  });
  const commits = revListOutput.split("\n").map((c) => c.trim()).filter(Boolean);

  for (const commitHash of commits) {
    historyScannedCount++;
    try {
      const diffOutput = execSync(`git show -p --format="" ${commitHash}`, {
        cwd: rootDir,
        encoding: "utf8",
        maxBuffer: 10 * 1024 * 1024,
      });
      scanText(diffOutput, `commit ${commitHash.slice(0, 8)}`);
    } catch (diffErr) {
      violations.push(`Failed to read git commit diff for ${commitHash.slice(0, 8)}: ${diffErr.message || diffErr}`);
    }
  }
} catch (gitErr) {
  violations.push(`Critical failure during git history inspection: ${gitErr.message || gitErr}`);
}

// 2. Working Tree Scan
console.log("🔍 [2/3] Scanning working tree (tracked and unignored files)...");
try {
  const trackedOutput = execSync("git ls-files", { cwd: rootDir, encoding: "utf8" });
  const trackedFiles = trackedOutput.split("\n").map((f) => f.trim()).filter(Boolean);

  const untrackedOutput = execSync("git ls-files --others --exclude-standard", { cwd: rootDir, encoding: "utf8" });
  const untrackedFiles = untrackedOutput.split("\n").map((f) => f.trim()).filter(Boolean);

  const allFiles = Array.from(new Set([...trackedFiles, ...untrackedFiles]));

  for (const relPath of allFiles) {
    filesScannedCount++;
    const base = path.basename(relPath);

    if (base === ".env.example") continue;
    if (base === ".env" || (base.startsWith(".env.") && base !== ".env.example") || base.endsWith(".pem") || base.endsWith(".key") || base === "id_rsa") {
      violations.push(`Sensitive credential file found in working tree: ${relPath}`);
      continue;
    }

    if (/\.(png|jpe?g|webp|ico|woff2?|ttf|eot)$/i.test(relPath)) continue;

    const fullPath = path.join(rootDir, relPath);
    if (fs.existsSync(fullPath)) {
      try {
        const content = fs.readFileSync(fullPath, "utf8");
        scanText(content, `file ${relPath}`);
      } catch (readErr) {
        violations.push(`Failed to read file ${relPath}: ${readErr.message || readErr}`);
      }
    }
  }
} catch (fileErr) {
  violations.push(`Critical failure during working tree inspection: ${fileErr.message || fileErr}`);
}

// 3. Dist Bundle Scan (if dist exists)
console.log("🔍 [3/3] Inspecting production dist bundle...");
if (fs.existsSync(distDir)) {
  function scanDir(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        scanDir(fullPath);
      } else if (entry.isFile()) {
        const rel = path.relative(rootDir, fullPath);
        if (rel.endsWith(".map")) {
          violations.push(`Public sourcemap found in dist bundle: ${rel}`);
        }
        try {
          const content = fs.readFileSync(fullPath, "utf8");
          if (/(?:PRIVATE_KEY|SECRET_KEY)\b/i.test(content)) {
            violations.push(`Secret reference found in bundle artifact: ${rel}`);
          }
        } catch (e) {
          violations.push(`Failed to read bundle artifact ${rel}: ${e.message || e}`);
        }
      }
    }
  }
  scanDir(distDir);
} else {
  console.log("   (dist/ does not exist yet; skip bundle inspection)");
}

// Write machine-readable audit report
const auditReport = {
  timestamp: new Date().toISOString(),
  commitSha: execSync("git rev-parse HEAD", { cwd: rootDir, encoding: "utf8" }).trim(),
  historyScannedCount,
  filesScannedCount,
  violationsCount: violations.length,
  violations,
  status: violations.length === 0 ? "PASS" : "FAIL",
};
const docsDir = path.join(rootDir, "docs");
if (!fs.existsSync(docsDir)) {
  fs.mkdirSync(docsDir, { recursive: true });
}
fs.writeFileSync(path.join(docsDir, "security-audit.json"), JSON.stringify(auditReport, null, 2), "utf8");

// Final Verdict
if (violations.length > 0) {
  console.error("\n❌ [Security Scanner] SECURITY VIOLATIONS DETECTED (Exit 1):");
  for (const v of violations) {
    console.error(`  - ${v}`);
  }
  process.exit(1);
} else {
  console.log("\n✅ [Security Scanner] All security checks passed.");
  console.log(`   - Scanned ${historyScannedCount} commits in full Git history: 0 exposed secrets.`);
  console.log(`   - Scanned ${filesScannedCount} working tree files: 0 exposed secrets.`);
  console.log("   - Dist bundle: 0 sourcemap leaks, 0 credential leaks.");
  console.log(`   - Audit written to docs/security-audit.json`);
}
