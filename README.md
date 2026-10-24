# ClickTracker – Website

Kleine Website (4 Seiten: Start, Funktionen, Download, Team) zum Veröffentlichen des Installers.

## Starten

Doppelklick auf **`Website starten.bat`** → öffnet http://localhost:8080 im Browser.

- **Über IP:** Andere PCs im selben Netz erreichen die Website über `http://<IP-Adresse>:8080`.
  Die Adresse(n) stehen beim Start im Fenster. Fragt die Windows-Firewall nach, auf „Zugriff zulassen“ klicken.
- Nur auf diesem PC (nicht über IP): `Website starten.bat --local`
- Anderer Port: `Website starten.bat --port 9000`
- Beenden: Fenster schliessen oder `Strg+C`

Braucht nur Python (keine zusätzlichen Pakete).

## Installer wechseln

1. Neue Setup-Datei (z.B. `ClickTracker-Setup-0.3.5.exe`) in den Ordner **`downloads/`** legen.
2. Fertig – die Website zeigt automatisch die höchste Version an (Version, Grösse und Datum werden aus der Datei gelesen).

Eine bestimmte Version erzwingen: in **`config.js`** statt `"auto"` den Dateinamen eintragen.
Alte Versionen im Ordner `downloads/` erscheinen auf der Download-Seite unter „Ältere Versionen“
(abschaltbar mit `showOlderVersions: false`).

## Ordner

| Datei / Ordner | Inhalt |
|---|---|
| `index.html`, `funktionen.html`, `download.html`, `team.html` | die vier Seiten |
| `config.js` | welcher Installer angeboten wird |
| `downloads/` | Setup-Dateien |
| `css/style.css`, `js/main.js` | Design und Logik (Animationen, Menü, Download-Knopf) |
| `img/` | Logo und Brainstorming-Bild (Kopien aus dem Projekt) |
| `server.py` | lokaler Webserver |
