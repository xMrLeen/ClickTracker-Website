/*
 * ============================================================
 *  INSTALLER WECHSELN – nur diese Datei anpassen
 * ============================================================
 *
 *  1. Neue Setup-Datei in den Ordner  website/downloads/  legen.
 *  2. Fertig! Mit  installer: "auto"  wird automatisch die Datei
 *     mit der höchsten Versionsnummer angeboten.
 *
 *  Eine bestimmte Version erzwingen? Dateinamen eintragen, z.B.:
 *     installer: "ClickTracker-Setup-0.3.3.exe",
 *
 *  Hinweis: "auto" funktioniert nur, wenn die Website über
 *  "Website starten.bat" (server.py) läuft. Sonst wird
 *  fallbackFile verwendet.
 */
window.CLICKTRACKER = {
  installer: "auto",
  fallbackFile: "ClickTracker-Setup-0.3.4.exe",

  // Ältere Versionen aus downloads/ auf der Download-Seite anzeigen?
  showOlderVersions: true,
};
