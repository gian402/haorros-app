$ErrorActionPreference = 'Stop'
$repoPath = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..'))
$sourcePath = Join-Path $repoPath 'backend'
$artifactPath = Join-Path $repoPath '.artifacts'
$stagePath = Join-Path $artifactPath ('backend-' + [Guid]::NewGuid().ToString('N'))
[IO.Directory]::CreateDirectory($stagePath) | Out-Null

# Copy sources to an isolated staging directory; remove it after packaging.
Get-ChildItem -LiteralPath $sourcePath -Recurse -File -Force | ForEach-Object {
    $relativePath = $_.FullName.Substring($sourcePath.Length + 1)
    if ($relativePath -match '^(vendor|node_modules|tests|\.git)[\\/]' -or
        ($relativePath -match '^\.env($|\.)' -and $relativePath -ne '.env.example') -or
        $relativePath -match '^\.phpunit' -or
        $relativePath -match '^storage[\\/](logs|framework)[\\/].*(?<!\.gitignore)$' -or
        $relativePath -match '^bootstrap[\\/]cache[\\/].*\.php$' -or
        $relativePath -match '\.sqlite$') { return }
    $destinationPath = Join-Path $stagePath $relativePath
    [IO.Directory]::CreateDirectory([IO.Path]::GetDirectoryName($destinationPath)) | Out-Null
    Copy-Item -LiteralPath $_.FullName -Destination $destinationPath
}
Push-Location $stagePath
try {
    composer install --no-dev --prefer-dist --no-interaction --optimize-autoloader
    if ($LASTEXITCODE -ne 0) { throw 'No se pudieron instalar las dependencias de produccion.' }
    php (Join-Path $PSScriptRoot 'zip-backend.php') $stagePath (Join-Path $artifactPath 'haorros-backend-cpanel.zip')
    if ($LASTEXITCODE -ne 0) { throw 'No se pudo crear el ZIP.' }
} finally {
    Pop-Location
    $resolvedStage = [IO.Path]::GetFullPath($stagePath)
    $allowedRoot = [IO.Path]::GetFullPath($artifactPath).TrimEnd([IO.Path]::DirectorySeparatorChar) + [IO.Path]::DirectorySeparatorChar
    if (-not $resolvedStage.StartsWith($allowedRoot, [StringComparison]::OrdinalIgnoreCase) -or
        [IO.Path]::GetFileName($resolvedStage) -notmatch '^backend-[a-f0-9]{32}$') {
        throw 'Unsafe staging path; cleanup stopped.'
    }
    if (Test-Path -LiteralPath $resolvedStage) { Remove-Item -LiteralPath $resolvedStage -Recurse -Force }
}
Write-Output (Join-Path $artifactPath 'haorros-backend-cpanel.zip')
