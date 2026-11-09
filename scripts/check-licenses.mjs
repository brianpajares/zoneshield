import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const root = process.cwd();
const nodeModules = path.join(root, "node_modules");
const allowlist = JSON.parse(await readFile(path.join(root, "data/license-allowlist.json"), "utf8"));
const allowed = new Set(allowlist.allowed);
const unusedOptional = new Set(allowlist.unused_optional_image_packages ?? []);
const issues = [];

async function visit(directory) {
  let entries;
  try {
    entries = await readdir(directory, { withFileTypes: true });
  } catch {
    return;
  }
  for (const entry of entries) {
    if (entry.name.startsWith(".")) continue;
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory() && entry.name.startsWith("@")) {
      await visit(fullPath);
    } else if (entry.isDirectory() && entry.name !== "node_modules") {
      const packagePath = path.join(fullPath, "package.json");
      try {
        const pkg = JSON.parse(await readFile(packagePath, "utf8"));
        if (unusedOptional.has(pkg.name)) continue;
        const value =
          pkg.license ?? (Array.isArray(pkg.licenses) ? pkg.licenses.map((item) => item.type).join(" OR ") : null);
        if (!value) {
          issues.push(`${pkg.name ?? entry.name}: license metadata missing`);
          continue;
        }
        const tokens = String(value)
          .replace(/[()]/g, " ")
          .split(/\s+(?:OR|AND)\s+|\s*\|\|\s*|\s*&&\s*/i)
          .map((item) => item.trim())
          .filter(Boolean);
        const blocked = tokens.find((license) =>
          allowlist.blocked.some((prefix) => license.toUpperCase().startsWith(prefix)),
        );
        if (blocked) issues.push(`${pkg.name ?? entry.name}: blocked license ${blocked}`);
        else if (tokens.some((license) => !allowed.has(license) && !/^SEE LICENSE IN /i.test(license)))
          issues.push(`${pkg.name ?? entry.name}: review license ${value}`);
        else if (tokens.some((license) => /^SEE LICENSE IN /i.test(license)))
          issues.push(`${pkg.name ?? entry.name}: license is declared in a separate file (${value})`);
      } catch (error) {
        if (error?.code !== "ENOENT") throw error;
      }
      await visit(path.join(fullPath, "node_modules"));
    }
  }
}

await visit(nodeModules);
if (issues.length) {
  console.error(`License review needed for ${issues.length} package(s):`);
  for (const issue of issues) console.error(`- ${issue}`);
  process.exitCode = 1;
} else {
  console.log("All installed package licenses are in the project allowlist.");
}
