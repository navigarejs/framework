<?php

namespace Navigare\Vite;

use Illuminate\Support\Str;
use Navigare\Exceptions\AssetNotPublicException;
use Navigare\Support\Filesystem;

class ClientManifest extends Manifest
{
  /**
   * Gets the prefix (i.e. directory or hostname plus path) of this manifest.
   *
   * @return string
   */
  public function getBase(): string
  {
    $base = pathinfo($this->path, PATHINFO_DIRNAME);

    if (Str::startsWith($base, 'http')) {
      return $base;
    }

    return '/' . Filesystem::makePathRelative($base, public_path());
  }

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

    // Check if the component is public
    if (Str::startsWith($this->getBase(), '/.')) {
      throw new AssetNotPublicException($path, $this);
    }

    return $path;
  }
}
