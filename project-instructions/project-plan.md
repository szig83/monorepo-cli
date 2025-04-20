# AI Feladatleírás: Monorepo CLI Telepítő Készítése

## 1. Cél

Hozz létre egy parancssori (CLI) alkalmazást Node.js segítségével, amely képes futni mind Node.js, mind Bun futtatási környezetben. A CLI célja, hogy egy előre definiált monorepo projektet inicializáljon a felhasználó által megadott konfiguráció alapján.

## 2. Futtatási Környezet és Csomagok

* **Futtatás:** Node.js (ajánlott verzió: >= 18) és Bun.
* **Kódolási stílus:** Használj modern JavaScript szintaxist (ESM modulok, `async/await`).
* **Fő Csomagok:**
    * `commander`: A CLI argumentumok és opciók kezelésére (bár a fő interakció most `inquirer`-rel történik, a jövőbeli bővíthetőséghez hasznos lehet).
    * `inquirer`: Interaktív parancssori kérdések feltételére a felhasználónak.
    * `fs-extra`: Robusztus fájlrendszer műveletekhez (könyvtár létrehozása, fájl írása, törlés hibakezelésnél).
    * `chalk`: Színes és stílusos kimenet biztosítására a terminálban ("modern" UI).
* **Kimenet:** Egyetlen futtatható JavaScript fájl (pl. `create-monorepo.js`), amely tartalmazza a teljes logikát. Az elejére kerüljön `#!/usr/bin/env node` shebang.

## 3. Interaktív Bekérési Folyamat (`inquirer` használatával)

A CLI indításakor tedd fel sorban a következő kérdéseket:

1.  **Projekt neve:**
    * Típus: `input`
    * Üzenet: "Mi legyen a projekt neve? (Hagyd üresen az aktuális könyvtárhoz)"
    * Alapértelmezett (placeholder): `my-project`
    * Funkció: Ez lesz a célkönyvtár neve. Ha a felhasználó értéket ad meg, hozd létre ezt a könyvtárat. Ha üresen hagyja, az aktuális munkakönyvtárat (`process.cwd()`) használd célként.
2.  **Adatbázis típus:**
    * Típus: `list` (egyetlen választás)
    * Üzenet: "Válassz adatbázis típust:"
    * Opciók: `['postgresql']` (Megjegyzés: későbbi bővítésre előkészítve `mysql`-el)
    * Validáció: Legalább egy opció legyen kiválasztva.
3.  **Adatbázis host:**
    * Típus: `input`
    * Üzenet: "Adatbázis host:"
    * Alapértelmezett: `localhost`
4.  **Adatbázis felhasználónév:**
    * Típus: `input`
    * Üzenet: "Adatbázis felhasználónév:"
    * Validáció: Nem lehet üres.
5.  **Adatbázis jelszó:**
    * Típus: `password` (maszkolt bevitel)
    * Üzenet: "Adatbázis jelszó:"
6.  **Adatbázis név:**
    * Típus: `input`
    * Üzenet: "Adatbázis név:"
    * Validáció: Nem lehet üres.
7.  **Adatbázis port:**
    * Típus: `input`
    * Üzenet: "Adatbázis port:"
    * Alapértelmezett: `5432` (Dinamikusan állítsd be ezt, ha a 2. kérdésre a 'postgresql' a válasz. Később más típusokhoz más default port is lehet.)
    * Validáció: Érvényes szám legyen.
8.  **Alkalmazás authentikációs providerek:**
    * Típus: `checkbox` (több választás)
    * Üzenet: "Válassz authentikációs providereket (space a kijelöléshez, enter a továbbhaladáshoz):"
    * Opciók: `['google', 'facebook', 'github']`
9.  **Adatbázis inicializálás típus:**
    * Típus: `list` (egyetlen választás)
    * Üzenet: "Hogyan inicializáljuk az adatbázist?"
    * Opciók: `['sql fájl alapján', 'seed folyamattal']`
10. **Minta felhasználók száma (feltételes kérdés):**
    * Csak akkor tedd fel, ha a 9. kérdésre a válasz `'seed folyamattal'`.
    * Típus: `input`
    * Üzenet: "Hány minta felhasználót hozzunk létre?"
    * Alapértelmezett: `10`
    * Validáció: Érvényes pozitív egész szám legyen.
11. **Csomagkezelő:**
    * Típus: `list` (egyetlen választás)
    * Üzenet: "Melyik csomagkezelőt használjuk?"
    * Opciók: `['npm', 'bun', 'pnpm']`

## 4. Végrehajtandó Feladatok Sorozata

1.  **Célkönyvtár Előkészítése:**
    * A 1. prompt válasza alapján határozd meg a célkönyvtár elérési útját.
    * Ha a válasz nem üres, hozd létre a könyvtárat (`fs-extra.ensureDir`). Ha már létezik és nem üres, jelezz hibát és állj le.
    * Ha a válasz üres, használd az aktuális könyvtárat. Ellenőrizd, hogy üres-e. Ha nem, jelezz hibát és állj le.
    * Használj `chalk`-ot a felhasználó tájékoztatására (pl. "Célkönyvtár létrehozása: <útvonal>...").
2.  **Monorepo Letöltése:**
    * Klónozd a `https://github.com/szig83/monorepo` repository tartalmát a célkönyvtárba. Használj egy megbízható módszert (pl. `git clone` parancs futtatása `child_process.execSync` vagy hasonlóval).
    * Adj visszajelzést a klónozás állapotáról (`chalk`, esetleg egy spinner mint `ora` - opcionális).
3.  **Konfigurációs Fájl Létrehozása:**
    * A célkönyvtáron belül keresd meg az `envs` alkönyvtárat.
    * Ebben az `envs` könyvtárban hozz létre egy `.env.database.local` nevű fájlt (`fs-extra.writeFile`).
    * A fájl tartalma legyen a következő, ahol az értékek a 3-7. prompt válaszaiból származnak:
        ```dotenv
        DB_HOST={prompt_3_válasz}
        DB_USER={prompt_4_válasz}
        DB_PASSWORD={prompt_5_válasz}
        DB_NAME={prompt_6_válasz}
        DB_PORT={prompt_7_válasz}
        ```
    * Adj visszajelzést a fájl létrehozásáról.
4.  **Függőségek Telepítése:**
    * A célkönyvtár gyökerében futtasd a megfelelő telepítési parancsot a 11. promptban kiválasztott csomagkezelő alapján:
        * `npm`: `npm install`
        * `bun`: `bun install`
        * `pnpm`: `pnpm install`
    * Használj `child_process`-t a parancs futtatásához. Jelenítsd meg a kimenetet, vagy használj spinnert a folyamat jelzésére.
5.  **Adatbázis Inicializáló Scriptek Futtatása:**
    * A célkönyvtár gyökerében futtasd a megfelelő `turbo run` parancsot a 9. prompt válasza alapján:
        * Ha a válasz `'seed folyamattal'`:
            * Futtasd: `{csomagkezelő_prefix} turbo run db:seed`
            * A parancs futtatásakor add át a 10. promptban megadott értéket környezeti változóként. Definiáljuk a környezeti változó nevét: `SEED_USER_COUNT`. Példa (`npm` esetén): `SEED_USER_COUNT={prompt_10_válasz} npx turbo run db:seed`. A `{csomagkezelő_prefix}` legyen `npx`, `bunx`, vagy `pnpm` a 11. prompt alapján.
        * Ha a válasz `'sql fájl alapján'`:
            * Futtasd: `{csomagkezelő_prefix} turbo run db:restore`
    * Használj `child_process`-t, és adj visszajelzést a futtatás sikerességéről/hibájáról.

## 5. Hibakezelés és Tisztítás

* Minden lépésnél (könyvtár létrehozás, klónozás, fájl írás, parancsok futtatása) ellenőrizd a művelet sikerességét.
* Bármelyik lépés hibája esetén:
    * Írj ki egyértelmű hibaüzenetet `chalk.red()` használatával, megnevezve a sikertelen lépést és lehetőség szerint a hiba okát.
    * **Fontos:** Ha a CLI *létrehozta* a célkönyvtárat (azaz a 1. prompt válasza nem volt üres), akkor hiba esetén kíséreld meg a létrehozott célkönyvtár teljes tartalmának eltávolítását (`fs-extra.remove`). Írj üzenetet a takarításról.
    * Állítsd le a CLI futását hiba kóddal (`process.exit(1)`).

## 6. Felhasználói Élmény (UI/UX)

* Használj `chalk`-ot a különböző típusú üzenetek megkülönböztetésére (pl. `chalk.blue` információkhoz, `chalk.green` sikeres műveletekhez, `chalk.yellow` figyelmeztetésekhez, `chalk.red` hibákhoz).
* Adj egyértelmű visszajelzést minden főbb lépés megkezdéséről és befejezéséről.
* Opcionálisan használj spinnereket (`ora` csomag) a hosszabb ideig tartó műveletek (klónozás, telepítés, scriptek futtatása) alatt a felhasználói élmény javítására.
