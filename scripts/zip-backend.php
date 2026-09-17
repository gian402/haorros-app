<?php
// This tool packages only the staging folder passed by package-backend.ps1.
$root = realpath($argv[1] ?? '');
if (!$root || !isset($argv[2])) throw new RuntimeException('Missing staging path or ZIP destination');
$zip = new ZipArchive;
if ($zip->open($argv[2], ZipArchive::CREATE | ZipArchive::OVERWRITE) !== true) {
    throw new RuntimeException('Cannot create archive');
}
$iterator = new RecursiveIteratorIterator(new RecursiveDirectoryIterator($root, FilesystemIterator::SKIP_DOTS));
foreach ($iterator as $file) {
    $relative = str_replace(DIRECTORY_SEPARATOR, '/', substr($file->getPathname(), strlen($root) + 1));
    if ($relative === '.env' || (str_starts_with($relative, '.env.') && $relative !== '.env.example')) continue;
    if (preg_match('#^bootstrap/cache/.*\\.php$#', $relative)) continue;
    $zip->addFile($file->getPathname(), $relative);
}
foreach (['storage/framework/cache/data', 'storage/framework/sessions', 'storage/framework/views', 'storage/logs', 'bootstrap/cache'] as $dir) {
    $zip->addEmptyDir($dir);
}
$zip->close();
echo 'Production ZIP created without .env or compiled configuration.'.PHP_EOL;
