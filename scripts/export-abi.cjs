// CommonJS script — run after `npm run compile`
const fs = require("fs");
const path = require("path");

function exportAbi() {
  const artifactPath = path.join(
    __dirname,
    "..",
    "artifacts",
    "contracts",
    "ForgeEscrow.sol",
    "ForgeEscrow.json"
  );

  if (!fs.existsSync(artifactPath)) {
    console.error(
      "Artifact not found. Run `npm run compile` first."
    );
    process.exit(1);
  }

  const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));
  const abi = artifact.abi;

  // Write to src/abi/ for frontend import
  const abiDir = path.join(__dirname, "..", "src", "abi");
  if (!fs.existsSync(abiDir)) {
    fs.mkdirSync(abiDir, { recursive: true });
  }

  const abiJsonPath = path.join(abiDir, "ForgeEscrow.json");
  fs.writeFileSync(abiJsonPath, JSON.stringify(abi, null, 2));
  console.log(`ABI exported to src/abi/ForgeEscrow.json (${abi.length} entries)`);

  // Also write a TypeScript file for typed imports
  const abiTsContent = `// Auto-generated from artifacts — do not edit manually
export const FORGE_ESCROW_ABI = ${JSON.stringify(abi, null, 2)} as const;
`;
  const abiTsPath = path.join(abiDir, "ForgeEscrow.ts");
  fs.writeFileSync(abiTsPath, abiTsContent);
  console.log(`ABI exported to src/abi/ForgeEscrow.ts`);
}

module.exports = exportAbi;

if (require.main === module) {
  exportAbi();
}
