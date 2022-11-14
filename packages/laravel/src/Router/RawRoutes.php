<?php

namespace Navigare\Router;

use Illuminate\Routing\Route;
use Illuminate\Support\Str;
use Navigare\Configuration;

class RawRoutes
{
  protected static mixed $cache = null;

  /**
   * Clear cache.
   */
  public static function clearCache()
  {
    static::$cache = null;
  }

  /**
   * Prepare route for output.
   *
   * @param Route|string $route
   * @param Configuration $configuration
   * @return RawRoute|null
   */
  public static function get(Route|string $route, Configuration $configuration)
  {
    return RawRoute::fromRoute($route, $configuration);
  }

  /**
   * Get a list of the application's named routes, keyed by their names.
   *
   * @param Configuration $configuration
   * @return Collection<string, RawRoute>
   */
  public static function getAll(Configuration $configuration)
  {
    // In case we loaded the cache before
    if (!is_null(static::$cache)) {
      return static::$cache;
    }

    // First we will see if we have a cache configuration file. If we do, we'll load
    // the configuration items from that file so that it is very quick. Otherwise
    // we will need to spin through all routes and load them all.
    $cachePath = base_path('bootstrap/cache/navigare.php');
    if (file_exists($cachePath)) {
      static::$cache = unserialize(file_get_contents($cachePath));

      return static::$cache;
    }

    // Collect all routes
    [$fallbacks, $routes] = collect(
      app('router')
        ->getRoutes()
        ->getRoutesByName()
    )
      ->reject(function ($route) {
        return Str::startsWith($route->getName(), 'generated::');
      })
      ->partition(function ($route) {
        return $route->isFallback;
      });

    // Instantiate raw routes
    $rawRoutes = $routes
      ->merge($fallbacks)
      ->map(function (Route $route) use ($configuration) {
        return RawRoutes::get($route, $configuration);
      })
      ->filter();

    return $rawRoutes;
  }
}
