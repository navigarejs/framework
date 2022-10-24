<?php

namespace Jaulz\Navigare;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Routing\Route;
use Illuminate\Support\Facades\Route as FacadesRoute;
use Illuminate\Support\Reflector;
use Illuminate\Support\Str;
use ReflectionClass;
use ReflectionMethod;

class Routes
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
   */
  public static function getRoute(Route|string $route)
  {
    // Resolve route if passed as name
    if (is_string($route)) {
      if (!FacadesRoute::has($route)) {
        return null;
      }

      $route = route($route);
    }

    // Prefer cache
    $name = $route->getName();
    if (static::$cache?->has($name)) {
      return static::$cache->get($name);
    }

    // Otherwise initialize cache and store route
    if (is_null(static::$cache)) {
      static::$cache = collect();
    }

    // Assemble raw route
    $rawRoute = collect($route)
      ->only(['uri', 'methods', 'wheres'])
      ->put('name', $name)
      ->put('domain', $route->domain())
      ->put('bindings', static::resolveBindings($route) ?? [])
      ->put('components', static::extractComponents($route));

    // Store route in cache
    static::$cache->put($name, $rawRoute);

    return $rawRoute;
  }

  /**
   * Get a list of the application's named routes, keyed by their names.
   */
  public static function getRoutes()
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

    $routes = $routes->merge($fallbacks)->map(function (Route $route) {
      return Routes::getRoute($route);
    });

    // Store routes in cache
    static::$cache = $routes;

    return $routes;
  }

  /**
   * Resolve route key names for any route parameters using Eloquent route model binding.
   */
  private static function resolveBindings(Route $route): array
  {
    $bindings = collect($route->signatureParameters(/*UrlRoutable::class*/))
      ->mapWithKeys(function ($parameter) use ($route) {
        if (!in_array($parameter->getName(), $route->parameterNames())) {
          return [];
        }

        $type = $parameter->getType()->getName();
        if (is_string($type)) {
          return [
            $parameter->getName() => true,
          ];
        }

        $model = class_exists(Reflector::class)
          ? Reflector::getParameterClassName($parameter)
          : $parameter->getType()->getName();
        $override =
          (new ReflectionClass($model))->isInstantiable() &&
          (new ReflectionMethod($model, 'getRouteKeyName'))->class !==
            Model::class;

        // Avoid booting this model if it doesn't override the default route key name
        return [
          $parameter->getName() => $override
            ? app($model)->getRouteKeyName()
            : 'id',
        ];
      })
      ->filter()
      ->toArray();

    if (!method_exists($route ?: '', 'bindingFields')) {
      return $bindings;
    }

    return array_merge($bindings, $route->bindingFields());
  }

  /**
   * Extract used fragments from method by inspecting its source code.
   */
  private static function extractComponents(Route $route): array
  {
    if (!is_string($route->action['uses'])) {
      return [];
    }

    // Get actual code of method
    $callback = Str::parseCallback($route->action['uses']);
    $method = new ReflectionMethod($callback[0], $callback[1]);

    $file = file($method->getFileName());
    $source = implode(
      '',
      array_slice(
        $file,
        $method->getStartLine() - 1,
        $method->getEndLine() - $method->getStartLine()
      )
    );

    // Parse pages from code
    if (
      !preg_match_all(
        '/Navigare::render\((["\'])([^"\']+)\1/m',
        $source,
        $matches
      )
    ) {
      return [];
    }

    return array_unique($matches[2]);
  }
}
