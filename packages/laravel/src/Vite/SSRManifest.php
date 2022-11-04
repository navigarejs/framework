<?php

namespace Navigare\Vite;

class SSRManifest extends Manifest
{
  /**
   * Resolve real path to asset.
   *
   * @param string $path
   * @return string|null
   */
  public function resolve(string $path): string|null
  {
    if (!$this->assets->has($path)) {
      return null;
    }

    $asset = $this->assets->get($path);

    if (!$asset) {
      return null;
    }

    $path = $asset['file'];

    return $path;
  }
}
