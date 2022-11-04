<?php

namespace Navigare\View;

use Illuminate\Contracts\Support\Arrayable;
use Illuminate\Support\Str;
use Navigare\Configuration;
use Navigare\Exceptions\PageComponentNotFoundException;
use Navigare\Exceptions\PageComponentNotPublicException;
use Navigare\Navigare;
use Navigare\Support\Filesystem;

class PageComponent implements Arrayable
{
  public function __construct(public string $name, public string $path)
  {
  }

  /**
   * Get page component instance from name.
   *
   * @param string $name
   * @param Configuration $configuration
   * @return PageComponent
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

    $path = join(DIRECTORY_SEPARATOR, array_filter([$root, $directory, $file]));
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
    if (!in_array(realpath($absolutePath), $files)) {
      throw new PageComponentNotFoundException($name, $absolutePath);
    }

    return new PageComponent(name: $name, path: $path);
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
        throw new PageComponentNotFoundException(
          $this->name,
          $this->path,
          $manifest
        );
      }

      $path = join(DIRECTORY_SEPARATOR, [$manifest->getPrefix(), $path]);
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
    $path = $this->path;

    if ($manifest = $configuration->getClientManifest()) {
      $path = $manifest->resolve($this->path);

      if (!$path) {
        throw new PageComponentNotFoundException(
          $this->name,
          $this->path,
          $manifest
        );
      }

      // Generate absolute HTTP link
      if (Str::startsWith($manifest->getPrefix(), 'http')) {
        return $manifest->getPrefix() . '/' . $path;
      }

      // Generate relative public link
      $absolutePath = join(DIRECTORY_SEPARATOR, [
        $manifest->getPrefix(),
        $path,
      ]);
      if (!Str::startsWith($absolutePath, public_path())) {
        throw new PageComponentNotPublicException(
          $this,
          $absolutePath,
          $manifest
        );
      }

      Filesystem::makePathRelative();
      return 'fsdfsdf';
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
      'path' => $this->path,
      'url' => $ssr
        ? $this->resolveSSRPath($configuration)
        : $this->resolveClientPath($configuration),
    ];
  }
}
