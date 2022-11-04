<?php

namespace Navigare\Exceptions;

use Navigare\View\PageComponent;
use Navigare\Vite\Manifest;

final class AssetNotPublicException extends Exception
{
  public function __construct(string $path, ?Manifest $manifest = null)
  {
    $this->message = 'The asset "' . $path . '" doesn\'t seem to be public.';
  }
}
