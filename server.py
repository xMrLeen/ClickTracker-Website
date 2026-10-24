"""Kleiner lokaler Webserver für die ClickTracker-Website.

    python server.py              -> http://localhost:8080 und http://<IP-Adresse>:8080
    python server.py --port 9000  -> anderer Port
    python server.py --local      -> nur auf diesem PC erreichbar (nicht über IP)

Zusätzlich zu den statischen Dateien liefert er /api/installers:
eine Liste aller Setup-Dateien in downloads/, neueste Version zuerst.
"""

import argparse
import json
import re
import socket
import webbrowser
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

ROOT = Path(__file__).resolve().parent
DOWNLOADS = ROOT / "downloads"
VERSION_RE = re.compile(r"(\d+(?:\.\d+)+)")


def version_key(name):
    match = VERSION_RE.search(name)
    return tuple(int(p) for p in match.group(1).split(".")) if match else ()


def list_installers():
    files = [f for f in DOWNLOADS.glob("*") if f.suffix.lower() in (".exe", ".msi", ".zip")]
    files.sort(key=lambda f: (version_key(f.name), f.stat().st_mtime), reverse=True)
    result = []
    for f in files:
        match = VERSION_RE.search(f.name)
        stat = f.stat()
        result.append({
            "file": f.name,
            "version": match.group(1) if match else None,
            "size": stat.st_size,
            "modified": int(stat.st_mtime * 1000),
        })
    return result


class Handler(SimpleHTTPRequestHandler):
    extensions_map = {**SimpleHTTPRequestHandler.extensions_map,
                      ".exe": "application/octet-stream", ".js": "text/javascript"}

    def do_GET(self):
        if self.path.split("?")[0].rstrip("/") == "/api/installers":
            body = json.dumps(list_installers()).encode("utf-8")
            self.send_response(200)
            self.send_header("Content-Type", "application/json; charset=utf-8")
            self.send_header("Cache-Control", "no-store")
            self.send_header("Content-Length", str(len(body)))
            self.end_headers()
            self.wfile.write(body)
            return
        super().do_GET()

    def end_headers(self):
        # Setup-Dateien immer herunterladen statt anzeigen
        if self.path.split("?")[0].startswith("/downloads/"):
            self.send_header("Content-Disposition", "attachment")
        super().end_headers()


def lan_ips():
    """Alle IPv4-Adressen dieses PCs (ohne 127.x), die bevorzugte zuerst."""
    ips = []
    with socket.socket(socket.AF_INET, socket.SOCK_DGRAM) as s:
        try:
            s.connect(("10.255.255.255", 1))
            ips.append(s.getsockname()[0])
        except OSError:
            pass
    try:
        for info in socket.getaddrinfo(socket.gethostname(), None, socket.AF_INET):
            ips.append(info[4][0])
    except OSError:
        pass
    return [ip for ip in dict.fromkeys(ips) if not ip.startswith("127.")]


def main():
    parser = argparse.ArgumentParser(description="ClickTracker-Website lokal starten")
    parser.add_argument("--port", type=int, default=8080)
    parser.add_argument("--local", action="store_true", help="nur auf diesem PC erreichbar (nicht über IP)")
    parser.add_argument("--lan", action="store_true", help=argparse.SUPPRESS)  # alt, ist jetzt Standard
    parser.add_argument("--no-browser", action="store_true", help="Browser nicht automatisch öffnen")
    args = parser.parse_args()

    DOWNLOADS.mkdir(exist_ok=True)
    host = "127.0.0.1" if args.local else "0.0.0.0"
    try:
        server = ThreadingHTTPServer((host, args.port), partial(Handler, directory=str(ROOT)))
    except OSError:
        print(f"Port {args.port} ist schon belegt. Anderen Port wählen, z.B.:  server.py --port 9000")
        return
    url = f"http://localhost:{args.port}"

    installers = list_installers()
    print("ClickTracker-Website läuft:")
    print(f"  Dieser PC:     {url}")
    if not args.local:
        ips = lan_ips()
        for i, ip in enumerate(ips):
            label = "Über IP:" if i == 0 else "Weitere IP:"
            print(f"  {label:<14} http://{ip}:{args.port}")
        if not ips:
            print("  (Keine Netzwerk-Adresse gefunden – ist der PC mit einem Netz verbunden?)")
        print("  Fragt die Windows-Firewall nach, auf \"Zugriff zulassen\" klicken.")
    print(f"Installer: {installers[0]['file'] if installers else 'KEINER in downloads/ gefunden!'}")
    print("Beenden mit Strg+C.")

    if not args.no_browser:
        webbrowser.open(url)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nServer beendet.")


if __name__ == "__main__":
    main()
