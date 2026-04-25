# Mode · Identität · Kommunikation — Analyse-Tool

PWA-fähiges Analyse-Tool für Mode, Identität und Kommunikation.

## Dateistruktur

```
fashion-identity-tool/
├── index.html          # App-Shell
├── manifest.json       # PWA-Manifest
├── sw.js               # Service Worker (Offline-Support)
├── README.md
├── icons/
│   ├── icon-192.svg
│   └── icon-512.svg
└── assets/
    ├── style.css
    └── app.js
```

## Auf GitHub Pages deployen

1. Repository auf GitHub erstellen (z. B. `fashion-identity-tool`)
2. Alle Dateien hochladen (Struktur beibehalten)
3. In den Repository-Einstellungen: **Settings → Pages → Source: Deploy from branch → main / (root)**
4. Die App ist dann erreichbar unter: `https://DEIN-USERNAME.github.io/fashion-identity-tool/`

## Als App auf dem Handy installieren

### iOS (Safari)
1. URL im Safari öffnen
2. Teilen-Symbol → „Zum Home-Bildschirm"

### Android (Chrome)
1. URL in Chrome öffnen
2. Menü (⋮) → „App installieren" oder Banner unten antippen

## Features

- **Element-Auswahl** nach 9 Kategorien (Form, Silhouette, Farbe, Material, Detail, Sprache, Gender, Kontext, Symbolik)
- **Analyse** mit Dominant-Wirkung, Radar-Chart (Wirkungsgruppen), Übersichtstabelle und Pie Chart
- **Undo / Redo** (Ctrl+Z / Ctrl+Y, auch Cmd+Z auf Mac)
- **Export / Import** als JSON — Daten sichern und zwischen Geräten übertragen
- **Bild-Upload** als Referenz
- **Mobile Stepper** — auf dem Handy zwischen den 3 Panels navigieren
- **Offline-fähig** — funktioniert ohne Internet nach erstem Laden
- **Admin-Bereich** — eigene Elemente, Effects und Kategorien anlegen

## Service Worker Cache aktualisieren

Wenn du Änderungen hochlädst, ändere in `sw.js` die Cache-Version:
```js
const CACHE_NAME = 'mik-tool-v2'; // v1 → v2 etc.
```
