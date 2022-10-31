<?php

namespace Navigare;

use Illuminate\Routing\Route;
use Illuminate\Support\Str;

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
   * @return RawRoute|null
   */
  public static function get(Route|string $route)
  {
    return RawRoute::fromRoute($route);
  }

  /**
   * Get a list of the application's named routes, keyed by their names.
   *
   * @return Collection<string, RawRoute>
   */
  public static function getAll()
  {
    if (!is_null(static::$cache)) {
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
      ->map(function (Route $route) {
        return RawRoutes::get($route);
      })
      ->filter();

    // Store routes in cache
    static::$cache = $routes;

    return $rawRoutes;
  }
}
