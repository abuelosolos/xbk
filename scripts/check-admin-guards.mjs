// Fails when an admin page, route handler or exported server action doesn't call requireAdmin().
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

const ROOT = process.env.GUARD_ROOT ?? "src/app/admin";
const problems = [];

function walk(dir) {
  return readdirSync(dir).flatMap((n) => {
    const p = join(dir, n);
    return statSync(p).isDirectory() ? walk(p) : [p];
  });
}

for (const file of walk(ROOT)) {
  const src = readFileSync(file, "utf8");
  const base = file.split("/").pop();
  if (base === "actions.ts") {
    // each `export async function name(...)` must open with `await requireAdmin(`
    for (const m of src.matchAll(/export async function (\w+)\s*\(/g)) {
      let i = m.index + m[0].length;
      for (let depth = 1; i < src.length && depth > 0; i++) depth += src[i] === "(" ? 1 : src[i] === ")" ? -1 : 0; // params may contain ")"
      const open = src.indexOf("{", i); // skips a `: Promise<Foo>` return type
      const first = src.slice(open + 1).replace(/^(\s*\/\/[^\n]*\n)*\s*/, "").split("\n")[0];
      if (!first.includes("requireAdmin(")) problems.push(`${file}: ${m[1]}() does not start with await requireAdmin()`);
    }
    if (!/export async function/.test(src)) problems.push(`${file}: no exported actions found (check the script)`);
  } else if (base === "page.tsx" || base === "route.ts") {
    if (!src.includes("requireAdmin(")) problems.push(`${file}: missing requireAdmin()`);
  } else if (base === "layout.tsx" && !src.includes("requireAdmin(")) {
    problems.push(`${file}: missing requireAdmin()`);
  }
}

if (problems.length) {
  console.error(problems.join("\n"));
  process.exit(1);
}
console.log("Admin guards OK");
