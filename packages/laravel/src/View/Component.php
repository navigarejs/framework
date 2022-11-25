<?php

namespace Navigare\View;

use Illuminate\Contracts\Support\Arrayable;
use Illuminate\Support\Carbon;
use Illuminate\Support\Str;
use Navigare\Configuration;
use Navigare\Exceptions\ComponentNotFoundException;
use Navigare\Exceptions\ComponentNotPublicException;
use Navigare\Navigare;
use Navigare\Support\Filesystem;

class Component implements Arrayable
{
  public function __construct(public string $id, public string $path)
  {
  }

  /**
   * Get page component instance from name.
   *
   * @param string $name
   * @param Configuration $configuration
   * @return Component
   */
  public static function fromName(
    string $name,
    Configuration $configuration
  ): self {
    $root = $configuration->get('components.path') ?? '';
    $defaultExtension =
      $configuration->get('components.default_extension') ?? '.ts';
    $pathinfo = pathinfo($name);
    $extension = $pathinfo['extension'] ?? $defaultExtension;
    $directory = $pathinfo['dirname'] === '.' ? '' : $pathinfo['dirname'];
    $basename = $pathinfo['basename'];
    $file = $basename . '.' . $extension;

    $id = join(DIRECTORY_SEPARATOR, array_filter([$directory, $file]));
    $path = join(DIRECTORY_SEPARATOR, array_filter([$root, $id]));
    $absolutePath = join(
      DIRECTORY_SEPARATOR,
      array_filter([base_path(), $path])
    );

    // Use glob-way to ensure case-sensitive existence of file names
    $files = glob(
      join(DIRECTORY_SEPARATOR, [
        realpath(join(DIRECTORY_SEPARATOR, [base_path($root), $directory])),
        '*.' . $extension,
      ])
    );
    if (
      !realpath($absolutePath) ||
      !in_array(realpath($absolutePath), $files)
    ) {
      throw new ComponentNotFoundException($name, $absolutePath ?: $path);
    }

    return new Component(id: $id, path: $path);
  }

  /**
   * Resolve SSR path.
   *
   * @param Configuration $configuration
   * @return string
   */
  public function resolveSSRPath(Configuration $configuration): string
  {
    $path = join(DIRECTORY_SEPARATOR, array_filter([base_path(), $this->path]));

    if ($manifest = $configuration->getSSRManifest()) {
      $path = $manifest->resolve($this->path);

      if (!$path) {
        throw new ComponentNotFoundException($this->id, $this->path, $manifest);
      }

      $path = join(DIRECTORY_SEPARATOR, [$manifest->getBase(), $path]);
    }

    return $path;
  }

  /**
   * Resolve client path.
   *
   * @return string
   */
  public function resolveClientPath(Configuration $configuration): string
  {
    $path = $this->path . '?timestamp=' . Carbon::now()->timestamp;

    if ($manifest = $configuration->getClientManifest()) {
      $path = $manifest->resolve($this->path);

      if (!$path) {
        throw new ComponentNotFoundException($this->id, $this->path, $manifest);
      }
    }

    return $path;
  }

  /**
   * Get the instance as an array.
   *
   * @param bool $ssr
   * @param ?Configuration $configuration
   * @return array
   */
  public function toArray(
    bool $ssr = false,
    Configuration $configuration = null
  ) {
    $configuration = $configuration ?? Navigare::getConfiguration();

    return [
      'id' => $this->id,
      'path' => $ssr
        ? $this->resolveSSRPath($configuration)
        : $this->resolveClientPath($configuration),
    ];
  }
}
