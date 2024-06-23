import fs from 'fs';
import path from 'path';
import { exit } from 'process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const packagePath = path.join(__dirname, 'package.json');
const versionFilePath = path.join(__dirname, 'src', 'version.ts');
const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));

// Leer la versión actual y el número de compilación
const mainVersion = packageJson.version;

// Mainversion tiene la forma X.Y.Z

// Tomo el build del archivio version.ts
const versionFile = fs.readFileSync(versionFilePath, 'utf8');
const versionMatch = versionFile.match(/export const version = '(\d+\.\d+\.\d+)\+(\d+)';/);
if (!versionMatch) {
  console.error('No se pudo encontrar la versión en src/version.ts');
  exit(1);
}
const buildNumber = versionMatch[2];
const newBuildNumber = parseInt(buildNumber) + 1;
const newVersion = `${mainVersion}+${newBuildNumber}`;

// Escribir la versión completa en src/version.ts
const versionFileContent = `export const version = '${newVersion}';\n`;
fs.writeFileSync(versionFilePath, versionFileContent);

console.log(`Versión actualizada a ${newVersion} en src/version.ts`);