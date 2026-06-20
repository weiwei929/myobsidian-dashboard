import { copyFileSync, mkdirSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

const VAULT_PLUGIN_DIR = process.env.MYOBSIDIAN_VAULT_PLUGIN_DIR;
if (!VAULT_PLUGIN_DIR) {
  console.error("MYOBSIDIAN_VAULT_PLUGIN_DIR environment variable is required.");
  console.error("Example: MYOBSIDIAN_VAULT_PLUGIN_DIR=\"D:/YourVault/.obsidian/plugins/myobsidian-dashboard\"");
  process.exit(1);
}

const files = ["main.js", "manifest.json", "styles.css"];

mkdirSync(VAULT_PLUGIN_DIR, { recursive: true });

for (const file of files) {
  const src = join(root, file);
  if (!existsSync(src)) {
    console.error(`Missing build artifact: ${src}`);
    console.error("Run npm run build first.");
    process.exit(1);
  }
  copyFileSync(src, join(VAULT_PLUGIN_DIR, file));
  console.log(`Copied ${file} -> ${VAULT_PLUGIN_DIR}`);
}

console.log("Install complete.");
