@echo off
rem Startet die ClickTracker-Website auf http://localhost:8080
rem Andere PCs im Netz: http://<IP-Adresse>:8080 (Adresse steht im Fenster)
rem Nur auf diesem PC:  "Website starten.bat" --local
cd /d "%~dp0"
title ClickTracker-Website

if exist "..\.venv\Scripts\python.exe" (
    "..\.venv\Scripts\python.exe" server.py %*
    goto :end
)
where py >nul 2>nul && ( py -3 server.py %* & goto :end )
where python >nul 2>nul && ( python server.py %* & goto :end )

echo Python wurde nicht gefunden: https://www.python.org/downloads/
:end
pause
