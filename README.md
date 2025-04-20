# Monorepo CLI Tool

This repository contains the source code for the `create-monorepo` command-line interface (CLI) tool.

The purpose of this tool is to simplify the setup process for the `szig83/monorepo` project by providing an interactive wizard that guides the user through the initial configuration steps.

## Features

*   Interactive prompts for project configuration (database details, authentication providers, package manager, etc.).
*   Clones the `szig83/monorepo` repository.
*   Generates necessary environment files (e.g., `.env.database.local`).
*   Installs project dependencies using the selected package manager (npm, bun, pnpm).
*   Runs database initialization scripts (`db:seed` or `db:restore`) via Turbo.
*   Multi-language support (English and Hungarian) via the `-l` or `--lang` flag.
*   Standard CLI flags like `--version` and `--help`.

## Usage

```bash
node create-monorepo.js [options]
```

Run the script without options to start the interactive setup wizard.

**Options:**

*   `-l, --lang <language>`: Specify the language (`en` or `hu`, default: `en`).
*   `-V, --version`: Show the version number.
*   `-h, --help`: Display the help message.

---

# Monorepo CLI Eszköz

Ez a repository a `create-monorepo` parancssori (CLI) eszköz forráskódját tartalmazza.

Az eszköz célja, hogy leegyszerűsítse a `szig83/monorepo` projekt telepítési folyamatát egy interaktív varázsló segítségével, amely végigvezeti a felhasználót a kezdeti konfigurációs lépéseken.

## Funkciók

*   Interaktív kérdések a projekt konfigurálásához (adatbázis adatok, authentikációs providerek, csomagkezelő stb.).
*   Leklónozza a `szig83/monorepo` repository-t.
*   Legenerálja a szükséges környezeti fájlokat (pl. `.env.database.local`).
*   Telepíti a projekt függőségeit a kiválasztott csomagkezelővel (npm, bun, pnpm).
*   Futtatja az adatbázis inicializáló scripteket (`db:seed` vagy `db:restore`) a Turbo segítségével.
*   Többnyelvű támogatás (angol és magyar) a `-l` vagy `--lang` kapcsolóval.
*   Szabványos CLI kapcsolók, mint a `--version` és `--help`.

## Használat

```bash
npm install -g .
create-monorepo [opciók]

# Vagy telepítés nélkül:
node create-monorepo.js [opciók]
```

Futtasd a szkriptet opciók nélkül az interaktív telepítő varázsló indításához.

**Opciók:**

*   `-l, --lang <language>`: A használt nyelv megadása (`en` vagy `hu`, alapértelmezett: `en`).
*   `-V, --version`: Az aktuális verziószám kiírása.
*   `-h, --help`: A súgó üzenet megjelenítése.
