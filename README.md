# Històric de Rutes 🗺️

Una app web per veure **tot el teu històric d'activitats de Garmin Connect i Suunto** en un mapa del món, amb colors segons el tipus d'activitat. Funciona al mòbil i a l'ordinador, i les teves activitats es guarden al propi navegador (no s'envia res a cap servidor).

> **➡️ Obre l'app:** https://ignasimartin.github.io/Historic-rutes/
>
> _(Disponible un cop activada la publicació — mira [Activar la web](#activar-la-web-github-pages).)_

## Què fa

- Importa fitxers **`.gpx`, `.tcx` i `.fit`**, i també el **`.zip` sencer** de l'exportació de Garmin o Suunto (busca els tracks encara que hi hagi zips dins de zips).
- Els pinta al mapa amb un **color per tipus d'activitat**:

  | Color | Tipus |
  |-------|-------|
  | 🟢 Verd | Córrer / Caminar / Hiking |
  | 🔴 Vermell | Bici |
  | 🔵 Blau | Natació (aigües obertes) |
  | ⚪ Gris | Altres |

- **Només mostra les activitats amb coordenades GPS** (piscina, gimnàs, etc. s'ignoren soles).
- Els tracks es veuen fins i tot molt allunyats, gràcies a un **punt de color a l'inici** de cada activitat i a línies que s'adapten al zoom.
- **Memòria**: importes els fitxers un cop i queden desats al navegador; no cal tornar a carregar-los cada vegada. Si reimportes, no es dupliquen.
- Filtres per amagar o mostrar cada tipus d'activitat.

## Com s'utilitza

1. Obre l'app (l'enllaç de dalt, o el fitxer `index.html`).
2. Toca **"Importar activitats"** i selecciona el ZIP de Garmin/Suunto o els fitxers solts.
3. Ja tens tot l'històric al mapa. Al mòbil, pots fer **"Afegir a la pantalla d'inici"** perquè quedi com una app.

La guia completa (com exportar les dades de Garmin i Suunto) és a **[GUIA.md](GUIA.md)**.

## Activar la web (GitHub Pages)

Per tenir l'app en línia amb un enllaç propi:

1. Ves a **Settings** → **Pages** en aquest repositori de GitHub.
2. A **Source**, tria **Deploy from a branch**.
3. Branch: **`main`**, carpeta: **`/ (root)`**. Desa.
4. Al cap d'un o dos minuts, l'app estarà a `https://ignasimartin.github.io/Historic-rutes/`.

## Detalls tècnics

L'app és **un sol fitxer HTML autònom** (`index.html`) amb tot inclòs: no necessita servidor ni instal·lació. El mapa base ve d'[OpenStreetMap](https://www.openstreetmap.org) (cal connexió a internet per veure'l); les activitats es guarden amb IndexedDB al navegador.

El codi font per regenerar `index.html` és a la carpeta [`src/`](src/):

```bash
cd src
npm install
npm run build      # genera ../index.html a partir de template.html + app.js
```

El build agafa `template.html` i hi incrusta Leaflet (mapa), fflate (descompressió de zips) i un bundle de fit-file-parser (lectura de fitxers `.fit`), més la lògica de l'app (`app.js`).

## Llicència

[MIT](LICENSE) © 2026 Ignasi Martín
