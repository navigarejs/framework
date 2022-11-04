<?php

namespace Navigare\Exceptions;

use Navigare\Vite\Manifest;

final class PageComponentNotFoundException extends Exception
{
  public function __construct(
    protected string $name,
    protected string $absolutePath,
    ?Manifest $manifest = null
  ) {
    if ($manifest) {
      $this->message =
        'The component "' .
        $name .
        '" (resolved to "' .
        $absolutePath .
        '") doesn\'t exist in manifest "' .
        $manifest->getPath() .
        '".';
    } else {
      $this->message =
        'The component "' .
        $name .
        '" (resolved to "' .
        $absolutePath .
        '") doesn\'t seem to exist.';
    }
  }
}
