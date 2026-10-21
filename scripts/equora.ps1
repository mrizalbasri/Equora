[CmdletBinding()]
param(
    [Parameter(Position = 0)]
    [ValidateSet('help', 'dev', 'frontend', 'backend', 'check', 'test', 'openapi')]
    [string]$Task = 'help'
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'
$RepoRoot = Split-Path -Parent $PSScriptRoot
$BackendDirectory = Join-Path $RepoRoot 'backend'
$FrontendDirectory = Join-Path $RepoRoot 'frontend'

function Resolve-RepoTool {
    param([string]$Name)

    if ($Name -eq 'uv') {
        foreach ($relativePath in @('.venv/Scripts/uv.exe', '.venv/bin/uv')) {
            $localTool = Join-Path $BackendDirectory $relativePath
            if (Test-Path -LiteralPath $localTool -PathType Leaf) {
                return $localTool
            }
        }
    }

    $command = Get-Command -Name $Name -CommandType Application -ErrorAction SilentlyContinue |
        Select-Object -First 1
    if ($null -eq $command) {
        throw "Tool '$Name' tidak ditemukan. Ikuti petunjuk instalasi di README proyek."
    }
    return $command.Source
}

function Invoke-RepoCommand {
    param(
        [string]$Directory,
        [string]$Tool,
        [string[]]$CommandArguments
    )

    $executable = Resolve-RepoTool -Name $Tool
    Push-Location -LiteralPath $Directory
    try {
        & $executable @CommandArguments
        if ($LASTEXITCODE -ne 0) {
            throw "Perintah '$Tool $($CommandArguments -join ' ')' gagal (exit $LASTEXITCODE)."
        }
    }
    finally {
        Pop-Location
    }
}

function Invoke-Backend {
    param([string[]]$CommandArguments)
    Invoke-RepoCommand -Directory $BackendDirectory -Tool 'uv' `
        -CommandArguments (@('run', '--locked', '--extra', 'dev') + $CommandArguments)
}

function Invoke-Frontend {
    param([string[]]$CommandArguments)
    Invoke-RepoCommand -Directory $FrontendDirectory -Tool 'pnpm' `
        -CommandArguments $CommandArguments
}

function Start-Backend {
    Invoke-RepoCommand -Directory $BackendDirectory -Tool 'docker' `
        -CommandArguments @('compose', 'up', '--build', '-d', 'api')
}

switch ($Task) {
    'help' {
        Write-Output @'
Equora: .\scripts\equora.ps1 <perintah>

dev       Jalankan API Docker, lalu frontend lokal di terminal ini.
frontend  Jalankan frontend lokal dengan pnpm dev.
backend   Jalankan API melalui backend/compose.yaml.
check     Periksa lint, format, dokumentasi, tipe dan kontrak API.
test      Jalankan pytest, Vitest, build dan tes HTTP Playwright.
openapi   Ekspor OpenAPI dan buat ulang tipe TypeScript.

Ctrl+C menghentikan frontend; API Docker tetap berjalan.
Tidak ada pembuatan database atau migrasi otomatis.
'@
    }
    'dev' {
        $null = Resolve-RepoTool -Name 'pnpm'
        Start-Backend
        Invoke-Frontend -CommandArguments @('dev')
    }
    'frontend' {
        Invoke-Frontend -CommandArguments @('dev')
    }
    'backend' {
        Start-Backend
    }
    'check' {
        Invoke-Backend -CommandArguments @('ruff', 'check', '.', '../scripts/export_openapi.py', '../scripts/test_postgres.py')
        Invoke-Backend -CommandArguments @('ruff', 'format', '--check', '.', '../scripts/export_openapi.py', '../scripts/test_postgres.py')
        Invoke-Backend -CommandArguments @('python', '../scripts/check_docs.py')
        Invoke-Frontend -CommandArguments @('check')
        Invoke-Frontend -CommandArguments @('check:api')
        Invoke-RepoCommand -Directory $RepoRoot -Tool 'git' -CommandArguments @('diff', '--check')
    }
    'test' {
        Invoke-Backend -CommandArguments @('pytest')
        Invoke-Frontend -CommandArguments @('test')
        Invoke-Frontend -CommandArguments @('build')
        Invoke-Frontend -CommandArguments @('test:e2e')
    }
    'openapi' {
        Invoke-Backend -CommandArguments @('python', '../scripts/export_openapi.py')
        Invoke-Frontend -CommandArguments @('generate:api')
        Invoke-Frontend -CommandArguments @('check:api')
    }
}
