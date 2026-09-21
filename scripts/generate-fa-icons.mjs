/**
 * Pravi src/assets/fa-icons.json: spisak svih besplatnih Font Awesome ikona,
 * za ponudu pri izboru ikone (meni, podredjene tabele...).
 * Pokretanje: npm run icons  (posle svakog azuriranja @fortawesome/fontawesome-free)
 * Drugi izlazni fajl, npr. za back-end: npm run icons -- ../Formuvia/resources/fa-icons.json
 */
import { readFileSync, writeFileSync } from "node:fs";

const METADATA = "node_modules/@fortawesome/fontawesome-free/metadata/icon-families.json";
const OUTPUT = process.argv[2] ?? "src/assets/fa-icons.json";
const MAX_TERMS = 6;

const families = JSON.parse(readFileSync(METADATA, "utf8"));
const icons = [];

for (const [name, icon] of Object.entries(families)) {
  const styles = (icon.familyStylesByLicense?.free ?? []).map((item) => item.style);
  if (!styles.length) {
    continue;
  }
  icons.push({
    name,
    label: icon.label,
    // "fa-solid fa-user-shield" - tacno onako kako se upisuje u menu.xml
    classes: styles.map((style) => `fa-${style} fa-${name}`),
    terms: (icon.search?.terms ?? []).slice(0, MAX_TERMS),
  });
}

icons.sort((a, b) => a.name.localeCompare(b.name));
writeFileSync(OUTPUT, JSON.stringify(icons));
console.log(`${OUTPUT}: ${icons.length} ikona, ${Math.round(JSON.stringify(icons).length / 1024)} kB`);
