<?php

namespace Navigare\Router;

use Illuminate\Contracts\Support\Arrayable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Routing\Route;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Route as FacadesRoute;
use Illuminate\Support\Reflector;
use Illuminate\Support\Str;
use Navigare\Configuration;
use Navigare\Exceptions\ComponentNotFoundException;
use Navigare\Navigare;
use Navigare\View\Component;
use ReflectionClass;
use ReflectionFunction;
use ReflectionMethod;

class RawRoute implements Arrayable
{
  public function __construct(
    public string $name,
    public string $uri,
    public array $methods,
    public array $wheres,
    public ?string $domain,
    public array $bindings,
    public Collection $components
  ) {
  }

  /**
   * Create a new RawRoute instance from routable instance or string.
   *
   * @param  Route|string  $route
   * @param Configuration $configuration
   * @return RawRoute
   */
  public static function fromRoute(
    Route|string $route,
    Configuration $configuration
  ): RawRoute {
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
    return new RawRoute(
      name: $route->getName(),
      uri: $route->uri,
      methods: $route->methods,
      wheres: $route->wheres,
      domain: $route->getDomain(),
      bindings: static::resolveBindings($route),
      components: static::extractComponents($route, $configuration)
    );
  }

  /**
   * Resolve route key names for any route parameters using Eloquent route model binding.
   *
   * @param Route $route
   * @return array
   */
  public static function resolveBindings(Route $route): array
  {
    $bindings = collect($route->signatureParameters(/*UrlRoutable::class*/))
      ->mapWithKeys(function ($parameter) use ($route) {
        if (!in_array($parameter->getName(), $route->parameterNames())) {
          return [];
        }

        // Get type of parameter
        // In case it's not bound to a Model we simply return "true" to signal that any string can be passed
        $type = $parameter->getType()?->getName();
        if (!$type || !class_exists($type)) {
          return [
            $parameter->getName() => true,
          ];
        }

        // Otherwise we will try to identify the identifier
        $model = class_exists(Reflector::class)
          ? Reflector::getParameterClassName($parameter)
          : $type;
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
   *
   * @param Route $route
   * @param Configuration $configuration
   * @return Collection
   */
  public static function extractComponents(
    Route $route,
    Configuration $configuration
  ): Collection {
    // Get actual code of method
    $uses = $route->action['uses'];
    if (is_string($uses)) {
      $callback = Str::parseCallback($uses);
      $method = new ReflectionMethod($callback[0], $callback[1]);
    } else {
      $method = new ReflectionFunction($uses);
    }

    $file = file($method->getFileName());
    $source = implode(
      '',
      array_slice(
        $file,
        $method->getStartLine() - 1,
        $method->getEndLine() - $method->getStartLine()
      )
    );

    // Parse strings from code
    if (!preg_match_all('/([\'"`])(.+)(\1)/', $source, $matches)) {
      return collect([]);
    }

    // Check if any of the strings matches a component file
    return collect($matches[2])
      ->unique()
      ->map(function ($match) use ($configuration) {
        try {
          return Component::fromName($match, $configuration);
        } catch (ComponentNotFoundException $exception) {
          return null;
        }
      })
      ->filter()
      ->values();
  }

  /**
   * Get the instance as an array.
   *
   * @param ?bool $ssr
   * @param ?Configuration $configuration
   * @return array
   */
  public function toArray(
    bool $ssr = false,
    Configuration $configuration = null
  ) {
    $configuration = $configuration ?? Navigare::getConfiguration();

    return [
      'name' => $this->name,
      'uri' => $this->uri,
      'methods' => $this->methods,
      'wheres' => (array) $this->wheres,
      'domain' => $this->domain,
      'bindings' => (array) $this->bindings,
      'components' => $this->components
        ->map(function ($component) use ($ssr, $configuration) {
          return $component->toArray($ssr, $configuration);
        })
        ->toArray(),
    ];
  }
}
