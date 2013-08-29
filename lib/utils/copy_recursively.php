<?php

/*
 * Recursively copies all the files in $source_path to $target_path
 * e.g. copy_recursively("/source/path", "/target/path");
 */
function copy_recursively($source_path, $target_path) {
    $files_copied = array();
    $iterator = new RecursiveIteratorIterator(
        new RecursiveDirectoryIterator(
            $source_path,
            RecursiveDirectoryIterator::SKIP_DOTS
        ),
        RecursiveIteratorIterator::SELF_FIRST
    );
    foreach ($iterator as $item) {
        $path = $target_path . DIRECTORY_SEPARATOR . $iterator->getSubPathName();
        if ($item->isDir()) {
            if (!file_exists($path)) mkdir($path);
        } else {
            copy($item, $path);
            $files_copied[] = ltrim(str_replace($target_path, '', $path), DIRECTORY_SEPARATOR);
        }
    }
    return $files_copied;
}


/*
 * takes a given path and creates directories
 */
function create_missing_directories($path) {
    $missing = array();
    if (!is_dir($path)) $path = dirname($path);
    while (!file_exists($path)) {
        $missing[] = $path;
        $path = dirname($path);
    }
    while ($path = array_pop($missing)) {
        mkdir($path);
    }
}