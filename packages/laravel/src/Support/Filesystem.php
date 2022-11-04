<?php

namespace Navigare\Support;

class Filesystem
{
  /**
   * Given an existing path, convert it to a path relative to a given starting path.
   *
   * @param string $endPath   Absolute path of target
   * @param string $startPath Absolute path where traversal begins
   *
   * @return string Path of target relative to starting path
   */
  public static function makePathRelative($endPath, $startPath)
  {
    // Normalize separators on Windows
    if ('\\' === DIRECTORY_SEPARATOR) {
      $endPath = str_replace('\\', '/', $endPath);
      $startPath = str_replace('\\', '/', $startPath);
    }

    // Split the paths into arrays
    $startPathArr = explode('/', trim($startPath, '/'));
    $endPathArr = explode('/', trim($endPath, '/'));

    // Find for which directory the common path stops
    $index = 0;
    while (
      isset($startPathArr[$index]) &&
      isset($endPathArr[$index]) &&
      $startPathArr[$index] === $endPathArr[$index]
    ) {
      ++$index;
    }

    // Determine how deep the start path is relative to the common path (ie, "web/bundles" = 2 levels)
    $depth = count($startPathArr) - $index;

    // Repeated "../" for each level need to reach the common path
    $traverser = str_repeat('../', $depth);

    $endPathRemainder = implode('/', array_slice($endPathArr, $index));

    // Construct $endPath from traversing to the common path, then to the remaining $endPath
    $relativePath =
      $traverser . ('' !== $endPathRemainder ? $endPathRemainder . '/' : '');

    return '' === $relativePath ? './' : $relativePath;
  }
}
