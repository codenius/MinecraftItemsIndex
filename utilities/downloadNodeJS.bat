@echo off
set NAME="nodejs"
set FILE="node-v17.4.0-win-x64"
set URL="https://nodejs.org/dist/v17.4.0/%FILE%.zip"
echo Download %NAME% from %URL%
curl -L %URL% -o %PUBLIC%\\%NAME%.zip
"C:\Program Files\7-Zip\7z.exe" x %PUBLIC%\%NAME%.zip -o%PUBLIC%\%NAME% -aoa
setx PATH "%PUBLIC%\\%NAME%\\%FILE%"
nodeShell.bat
