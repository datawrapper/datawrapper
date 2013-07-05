<?php

/*
 * Recursively copies all the files in $source_path to $target_path
 * e.g. copy_recursively("/source/path", "/target/path");
 */
function copy_recursively($source_path, $target_path) {
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
        }
    }
}