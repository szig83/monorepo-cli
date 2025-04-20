# Monorepo CLI Tool

This repository contains the source code for the `create-monorepo` command-line interface (CLI) tool.

The purpose of this tool is to simplify the setup process for the `szig83/monorepo` project by providing an interactive wizard that guides the user through the initial configuration steps.

## Requirements

- **Node.js:** Version 18 or higher.
- **Bun:** (Optional) If Bun is installed, the tool will automatically use it for faster execution. If not, it will fall back to Node.js.

## Features

- Interactive prompts for project configuration (database details, authentication providers, package manager, etc.).
- Clones the `szig83/monorepo` repository.
- Generates necessary environment files (e.g., `.env.database.local`).
- Installs project dependencies using the selected package manager (npm, bun, pnpm).
- Runs database initialization scripts (`db:seed` or `db:restore`) via Turbo.
- Multi-language support (English and Hungarian) via the `-l` or `--lang` flag.
- Standard CLI flags like `--version` and `--help`.

## Usage

This tool requires either **Node.js (>= 18)** or **Bun** to be installed on your system. It will automatically detect and use `bun` if available for potentially faster execution, otherwise it will use `node`.

1. Clone this repository:
   ```bash
   git clone https://github.com/szig83/monorepo-cli.git
   cd monorepo-cli
   ```
2. (Optional) Make the command globally available:
   If you want to run the `create-monorepo` command from any directory, run the following command inside the cloned `monorepo-cli` directory:
   ```bash
   npm link
   ```
   This will allow you to simply type `create-monorepo` in your terminal anywhere.
3. Run the script:
   - If you ran `npm link`, you can use: `create-monorepo [options]`
   - Otherwise, run directly using node: `node create-monorepo.js [options]`

Run the script without options to start the interactive setup wizard.

**Options:**

- `-l, --lang <language>`: Specify the language (`en` or `hu`, default: `en`).
- `-V, --version`: Show the version number.
- `-h, --help`: Display the help message.

---

# Monorepo CLI Eszköz

Ez a repository a `create-monorepo` parancssori (CLI) eszköz forráskódját tartalmazza.

Az eszköz célja, hogy leegyszerűsítse a `szig83/monorepo` projekt telepítési folyamatát egy interaktív varázsló segítségével, amely végigvezeti a felhasználót a kezdeti konfigurációs lépéseken.

## Követelmények

- **Node.js:** 18-as vagy magasabb verzió.
- **Bun:** (Opcionális) Ha a Bun telepítve van, az eszköz automatikusan azt fogja használni a gyorsabb futás érdekében. Ha nincs, akkor a Node.js-t használja.

## Funkciók

- Interaktív kérdések a projekt konfigurálásához (adatbázis adatok, authentikációs providerek, csomagkezelő stb.).
- Leklónozza a `szig83/monorepo` repository-t.
- Legenerálja a szükséges környezeti fájlokat (pl. `.env.database.local`).
- Telepíti a projekt függőségeit a kiválasztott csomagkezelővel (npm, bun, pnpm).
- Futtatja az adatbázis inicializáló scripteket (`db:seed` vagy `db:restore`) a Turbo segítségével.
- Többnyelvű támogatás (angol és magyar) a `-l` vagy `--lang` kapcsolóval.
- Szabványos CLI kapcsolók, mint a `--version` és `--help`.

## Használat

Az eszköz futtatásához **Node.js (>= 18)** vagy **Bun** telepítése szükséges a rendszereden. Az eszköz automatikusan észleli és használja a `bun`-t, ha elérhető (a potenciálisan gyorsabb végrehajtás érdekében), egyébként a `node`-ot fogja használni.

1. Klónozd ezt a repository-t:
   ```bash
   git clone https://github.com/szig83/monorepo-cli.git
   cd monorepo-cli
   ```
2. (Opcionális) Tedd a parancsot globálisan elérhetővé:
   Ha szeretnéd a `create-monorepo` parancsot bármely könyvtárból futtatni, futtasd a következő parancsot a klónozott `monorepo-cli` könyvtáron belül:
   ```bash
   npm link
   ```
   Ez lehetővé teszi, hogy egyszerűen a `create-monorepo` parancsot gépeld be bárhol a terminálodban.
3. Futtasd a szkriptet:
   - Ha futtattad az `npm link`-et: `create-monorepo [opciók]`
   - Egyébként futtasd közvetlenül a node segítségével: `node create-monorepo.js [opciók]`

Futtasd a szkriptet opciók nélkül az interaktív telepítő varázsló indításához.

**Opciók:**

- `-l, --lang <language>`: A használt nyelv megadása (`en` vagy `hu`, alapértelmezett: `en`).
- `-V, --version`: Az aktuális verziószám kiírása.
- `-h, --help`: A súgó üzenet megjelenítése.
