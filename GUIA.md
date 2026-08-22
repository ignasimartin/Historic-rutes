# Els Meus Tracks — Guia d'ús

App per veure tot el teu històric de Garmin i Suunto en un mapa del món, amb colors per tipus d'activitat. Tot es guarda **només al teu telèfon**; no s'envia res enlloc.

Tens **un sol fitxer**: `Els-Meus-Tracks.html`. No cal instal·lar res ni programar.

---

## Pas 1 — Descarrega el teu històric de Garmin

Garmin no té una manera automàtica per treure tots els tracks, així que has de demanar l'exportació del compte (només es fa un cop):

1. Entra a **https://www.garmin.com/account/datamanagement/** (o cerca "Garmin Export Your Data") i inicia sessió amb el teu compte de Garmin Connect.
2. Tria **"Export Your Data"** / **"Exporta les teves dades"**.
3. Garmin et prepara un fitxer i **t'envia un correu amb un enllaç de descàrrega** (pot trigar des d'uns minuts fins a uns dies).
4. Descarrega el ZIP. A dins hi ha, entre altres coses, els teus fitxers d'activitat (`.fit`), sovint dins de sub-carpetes o zips més petits com `DI-Connect-Fitness`.

> No cal que descomprimeixis res: l'app accepta el **ZIP sencer** i ja busca els tracks a dins (fins i tot zips dins de zips).

Alternativa ràpida (poques activitats): a Garmin Connect, obre una activitat → menú (⚙️ o els tres punts) → **Exporta com a GPX**.

---

## Pas 2 — Descarrega el teu històric de Suunto

1. A l'app de Suunto o a **https://www.suunto.com** entra al teu compte.
2. Busca la secció de **privacitat / dades personals** i demana l'**exportació de dades** (GDPR). Rebràs un enllaç per descarregar els teus workouts en `.fit`/`.gpx`.
3. Alternativa per activitat: a l'app Suunto obre una activitat → **Comparteix / Exporta → GPX**.

Guarda aquests fitxers (o el ZIP) junts amb els de Garmin.

---

## Pas 3 — Posa l'app al mòbil (Android)

1. Passa el fitxer `Els-Meus-Tracks.html` al telèfon: per exemple envia-te'l per correu, o puja'l a Google Drive i descarrega'l al mòbil.
2. Obre el fitxer amb **Chrome** (des de Descàrregues, toca el fitxer i tria obrir amb Chrome).
3. Menú de Chrome (⋮) → **"Afegeix a la pantalla d'inici"**. Així et queda una icona com si fos una app.

> Els mateixos fitxers d'exportació també els pots passar al telèfon i importar-los des de l'app (Pas 4). Si et va més còmode, pots fer tot el procés a l'ordinador primer i després passar-ho al mòbil.

---

## Pas 4 — Importa els tracks

1. Obre l'app i toca **"Importar activitats"** (o el menú ☰ → "Importar fitxers").
2. Selecciona el **ZIP de Garmin**, el **de Suunto**, o els fitxers `.gpx`/`.fit`/`.tcx` solts. Pots seleccionar-ne molts alhora.
3. L'app processa i guarda tot. Quan acabis, veuràs les activitats al mapa.

Detalls:
- Només es mostren les activitats **amb coordenades GPS**. Les de piscina, gimnàs, etc. (sense GPS) s'ignoren automàticament.
- Si importes dues vegades el mateix, **no es duplica**.
- Més endavant, per afegir activitats noves, només cal importar els fitxers nous: els que ja hi eren no es tornen a comptar.

**No has de tornar a importar cada vegada** — un cop importat, queda desat al telèfon i s'obre a l'instant.

---

## Colors de les activitats

| Color | Tipus |
|-------|-------|
| 🟢 Verd | Córrer / Caminar / Hiking |
| 🔴 Vermell | Bici |
| 🔵 Blau | Natació (aigües obertes) |
| ⚪ Gris | Altres |

Amb els interruptors del menú (☰ → "Mostrar al mapa") pots amagar o mostrar cada tipus.

---

## El mapa

- El **mapa de fons** es carrega d'internet (OpenStreetMap), així que per veure'l necessites connexió.
- Les **teves activitats** sí que es guarden al telèfon: un cop importades, s'obren a l'instant sense tornar a carregar res.

---

## Preguntes ràpides

**On es guarden les dades?** Les activitats es guarden només al teu telèfon, dins del navegador. Si esborres les dades de Chrome per aquesta pàgina, es perden (pots tornar a importar els fitxers).

**Funciona a iPhone?** Sí, obrint el fitxer amb Safari i "Afegir a la pantalla d'inici", tot i que l'has demanat per Android.

**El mapa de fons no es veu (surt fosc).** És que en aquell moment no hi ha connexió a internet. Connecta't i ja es veurà.

**Vull que l'app tingui icona pròpia "de veritat".** Es pot penjar aquest mateix fitxer a un allotjament web gratuït i quedaria com una app instal·lable. M'ho dius i t'ho munto.
