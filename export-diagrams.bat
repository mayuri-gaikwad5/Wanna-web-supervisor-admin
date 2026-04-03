@echo off
echo ========================================
echo WANA Architecture Diagram Exporter
echo ========================================
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Node.js is not installed!
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

echo [1/3] Checking for Mermaid CLI...
where mmdc >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo Mermaid CLI not found. Installing...
    call npm install -g @mermaid-js/mermaid-cli
    if %ERRORLEVEL% NEQ 0 (
        echo ERROR: Failed to install Mermaid CLI
        pause
        exit /b 1
    )
)

echo [2/3] Creating output directory...
if not exist "architecture-diagrams" mkdir architecture-diagrams

echo [3/3] Generating diagrams...
echo.

REM Extract and generate each diagram
node generate-diagrams.js

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================
    echo SUCCESS! All diagrams generated.
    echo ========================================
    echo.
    echo Location: architecture-diagrams\
    echo.
    echo Files generated:
    dir /b architecture-diagrams\*.png
    echo.
    echo Opening folder...
    start architecture-diagrams
) else (
    echo.
    echo ERROR: Failed to generate diagrams
    echo Please check the error messages above
)

echo.
pause
