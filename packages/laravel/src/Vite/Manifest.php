<?php

namespace Navigare\Vite;

use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;
use Navigare\Exceptions\ManifestNotFoundException;

abstract class Manifest
{
  protected string $content;

  protected Collection $assets;

  /**
   * Creates a Manifest instance.
   *
   * @param string $path Absolute path to the manifest
   */
  public function __construct(protected string|null $path)
  {
    $this->path = str_replace('\\', '/', $path);

    if (!($content = static::fetchContent($path))) {
      throw new ManifestNotFoundException($path);
    }

    $this->content = $content;
    $this->assets = collect(
      json_decode($content, true, 512, \JSON_THROW_ON_ERROR)
    );
  }

  /**
   * Reads the manifest file and returns its representation.
   */
  public static function read(string $path): Manifest
  {
    return new static($path);
  }

  /**
   * Resolve real path to asset.
   *
   * @param string $path
   * @return string|null
   */
  abstract public function resolve(string $path): string|null;

  /**
   * Gets the absolute path of this manifest.
   *
   * @return string
   */
  public function getContent(): string
  {
    return $this->content;
  }

  /**
   * Gets the absolute path of this manifest.
   *
   * @return string
   */
  public function getPath(): string
  {
    return $this->path;
  }

  /**
   * Gets the prefix (i.e. directory or hostname plus path) of this manifest.
   *
   * @return string
   */
  public function getBase(): string
  {
    return pathinfo($this->path, PATHINFO_DIRNAME);
  }

  /**
   * Fetches the manifest's contents from the given path.
   *
   * @return ?string
   */
  public static function fetchContent(string|null $path): string|null
  {
    if (Str::startsWith($path, 'http')) {
      return cache()->remember(
        config(
          'navigare.remote_manifest.cache_key',
          'navigare.remote_manifest'
        ),
        config('navigare.remote_manifest.cache_duration', now()->addHour()),
        fn() => Http::get($path)->body()
      );
    }

    if (file_exists($path)) {
      return file_get_contents($path);
    }

    return null;
  }
}
