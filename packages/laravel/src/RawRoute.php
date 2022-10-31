<?php

namespace Navigare;

use Illuminate\Contracts\Support\Arrayable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Routing\Route;
use Illuminate\Support\Facades\Route as FacadesRoute;
use Illuminate\Support\Reflector;
use Illuminate\Support\Str;
use ReflectionClass;
use ReflectionMethod;

class RawRoute implements Arrayable
{
  public string $name;

  public string $uri;

  public array $methods;

  public array $wheres;

  public ?string $domain;

  public array $bindings;

  public array $components;

  public function __construct(public Route $route)
  {
    $this->name = $route->getName();
    $this->uri = $route->uri;
    $this->methods = $route->methods;
    $this->wheres = $route->wheres;
    $this->domain = $route->getDomain();
    $this->bindings = $this->resolveBindings();
    $this->components = $this->extractComponents();
  }

  /**
   * Create a new RawRoute instance from routable instance or string.
   *
   * @param  Route|string  $route
   * @return RawRoute
   */
  public static function fromRoute(Route|string $route): RawRoute
  {
    // Resolve route if name was passed
    if (is_string($route)) {
      if (!FacadesRoute::has($route)) {
        return null;
      }

      $route = app('router')
        ->getRoutes()
        ->getByName($route);
    }

    // Return instance of raw route
    return new RawRoute($route);
  }

  /**
   * Resolve route key names for any route parameters using Eloquent route model binding.
   *
   * @return array
   */
  private function resolveBindings(): array
  {
    $bindings = collect(
      $this->route->signatureParameters(/*UrlRoutable::class*/)
    )
      ->mapWithKeys(function ($parameter) {
        if (!in_array($parameter->getName(), $this->route->parameterNames())) {
          return [];
        }

        // Get type of parameter
        // In case it's not bound to a Model we simply return "true" to signal that any string can be passed
        $type = $parameter->getType()?->getName();
        if (!$type || is_string($type)) {
          return [
            $parameter->getName() => true,
          ];
        }

        // Otherwise we will try to identify the identifier
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

    if (!method_exists($this->route ?: '', 'bindingFields')) {
      return $bindings;
    }

    return array_merge($bindings, $this->route->bindingFields());
  }

  /**
   * Extract used fragments from method by inspecting its source code.
   *
   * @return array
   */
  private function extractComponents(): array
  {
    if (!is_string($this->route->action['uses'])) {
      return [];
    }

    // Get actual code of method
    $callback = Str::parseCallback($this->route->action['uses']);
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

  /**
   * Get the instance as an array.
   *
   * @return array
   */
  public function toArray()
  {
    return [
      'name' => $this->name,
      'uri' => $this->uri,
      'methods' => $this->methods,
      'wheres' => $this->wheres,
      'domain' => $this->domain,
      'bindings' => $this->bindings,
      'components' => $this->components,
    ];
  }
}
