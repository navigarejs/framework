<?php

namespace Navigare\Exceptions;

use Navigare\View\PageComponent;
use Navigare\Vite\Manifest;

final class PageComponentNotPublicException extends Exception
{
  public function __construct(
    protected PageComponent $pageComponent,
    string $absolutePath,
    ?Manifest $manifest = null
  ) {
    $this->message =
      'The component "' .
      $pageComponent->name .
      '" (resolved to "' .
      $absolutePath .
      '") doesn\'t seem to be public.';
  }
}
