# Històric de Rutes 🗺️

Mostra **tot el teu històric d'activitats de Garmin i Suunto en un sol mapa del món**, amb un color per cada tipus d'activitat. Funciona al mòbil i a l'ordinador, i les teves activitats es guarden al propi navegador: les importes un cop i sempre les tens a mà.

> ### ▶️ Obre l'aplicació: https://ignasimartin.github.io/Historic-rutes/

## Què pots fer

- Veure totes les teves rutes alhora sobre el mapa i navegar-hi lliurement (zoom, moure't, tocar una ruta per veure'n el detall).
- **Colors per tipus d'activitat:**

  | Color | Tipus |
  |-------|-------|
  | 🟢 Verd | Córrer / Caminar / Hiking |
  | 🔴 Vermell | Bici |
  | 🔵 Blau | Natació (aigües obertes) |
  | ⚪ Gris | Altres |

- **Filtrar per tipus** i **filtrar per any** des del menú lateral, per mostrar només el que t'interessi.
- Cada ruta té un punt de color a l'inici, així la veus fins i tot quan allunyes molt el mapa.

## Com fer-la servir

1. **Obre l'aplicació** amb l'enllaç de dalt (o el fitxer `index.html`).
2. Toca **"Importar activitats"** i selecciona el ZIP que has exportat de Garmin o Suunto, o fitxers `.gpx` / `.fit` / `.tcx` solts. Accepta fins i tot el ZIP sencer de l'exportació, amb tot a dins.
3. Ja tens tot l'històric al mapa. Fes servir el menú **☰** per filtrar per tipus i per any.

Al mòbil, des del menú del navegador pots fer **"Afegir a la pantalla d'inici"** perquè quedi com una aplicació més.

Només es mostren les activitats **amb coordenades GPS** (les de piscina, gimnàs, etc. s'ignoren automàticament), i si importes dues vegades el mateix no es duplica.

## D'on surten les dades

Cal exportar el teu històric des de Garmin i Suunto (es fa un sol cop). Tens els passos detallats a la **[guia d'ús →](GUIA.md)**.

## Les teves dades són teves

Tot es guarda **només al teu navegador**, al teu dispositiu. Res s'envia a cap servidor. L'única cosa que ve d'internet és el mapa de fons ([OpenStreetMap](https://www.openstreetmap.org)), que necessita connexió per veure's.

---

<sub>Vols muntar la teva pròpia còpia? El codi font és a [`src/`](src/): amb `cd src && npm install && npm run build` es regenera l'`index.html`. Per tenir-la en línia, activa GitHub Pages a la configuració del repositori (*Settings → Pages*), triant la branca `main` i la carpeta arrel. · Llicència [MIT](LICENSE) © 2026 Ignasi Martín.</sub>
