<?php

namespace Navigare;

use Closure;
use Exception;
use GuzzleHttp\Promise\PromiseInterface;
use Illuminate\Contracts\Support\Arrayable;
use Illuminate\Contracts\Support\Responsable;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Http\Resources\Json\ResourceResponse;
use Illuminate\Support\Arr;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\App;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Response as ResponseFactory;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Str;
use Illuminate\Support\Traits\Macroable;
use Navigare\Router\RawRoute;
use Navigare\View\DeferredProperty;
use Navigare\View\LazyProperty;
use Navigare\View\Location;
use Navigare\View\Page;
use Navigare\View\Component;
use Navigare\View\Fragment;
use Navigare\View\Property;
use ReflectionParameter;
use WeakMap;

class Response implements Responsable
{
  use Macroable;

  private WeakMap $cache;

  public function __construct(
    protected Configuration $configuration,
    protected string $version = '',
    protected array $shares = [],
    protected ?Collection $properties = null,
    protected string $rootView = 'app',
    protected ?string $baseURL = null,
    protected ?string $layout = null,
    protected ?Collection $viewData = null,
    protected ?array $fragments = []
  ) {
    $this->properties = $properties ?? collect([]);
    $this->viewData = $viewData ?? collect([]);
    $this->cache = new WeakMap();
  }

  /**
   * Return fragment from response.
   *
   * @param  string  $name
   * @return Fragment
   */
  public function getFragment(string $name = 'default'): Fragment
  {
    $fragment = $this->fragments[$name];

    if (!$fragment) {
      throw new Exception("Fragment \"$name\" was not set before.");
    }

    return $fragment;
  }

  /**
   * @param  string|array  $key
   * @param  mixed|null  $value
   * @param  string  $fragmentName
   * @return $this
   */
  public function with($key, $value = null, ?string $fragmentName = null): self
  {
    $properties = $this->properties;
    if ($fragmentName) {
      $fragment = $this->getFragment($fragmentName);
      $properties = $fragment->properties;
    }

    if (is_array($key)) {
      $values = $key;

      foreach ($values as $key => $value) {
        $properties->put($key, $value);
      }
    } else {
      $properties->put($key, $value);
    }

    return $this;
  }

  /**
   * Add new fragment to response.
   *
   * @param  string  $fragmentName
   * @param  string|null  $componentName
   * @param  array|Arrayable|null  $properties
   * @return self
   */
  public function withFragment(
    string $fragmentName,
    string|null $componentName,
    array|Arrayable|null $properties = [],
    bool $fallback = false
  ): self {
    if ($fallback && Arr::exists($this->fragments, $fragmentName)) {
      return $this;
    }

    $this->fragments[$fragmentName] = is_null($componentName)
      ? null
      : new Fragment(
        name: $fragmentName,
        component: Component::fromName($componentName, $this->configuration),
        properties: collect($properties),
        fallback: $fallback
      );

    return $this;
  }

  /**
   * Add fallback fragment to response.
   *
   * @param  string  $fragmentName
   * @param  string|null  $componentName
   * @param  array|Arrayable|null  $properties
   * @return self
   */
  public function withFallbackFragment(
    string $fragmentName,
    string|null $componentName,
    array|Arrayable|null $properties = []
  ): self {
    return $this->withFragment(
      $fragmentName,
      $componentName,
      $properties,
      true
    );
  }

  /**
   * Extend data that will be passed to the view template.
   *
   * @param  string|array  $key
   * @param  mixed|null  $value
   * @return $this
   */
  public function withViewData($key, $value = null): self
  {
    if (is_array($key)) {
      $values = $key;

      foreach ($values as $key => $value) {
        $this->viewData->put($key, $value);
      }
    } else {
      $this->viewData->put($key, $value);
    }

    return $this;
  }

  /**
   * Set root view (i.e. the blade component) for the Navigare response.
   *
   * @param string $rootView
   * @return Response
   */
  public function rootView(string $rootView): self
  {
    $this->rootView = $rootView;

    return $this;
  }

  /**
   * Inherit from a base page (i.e. for modals the page that is in the background).
   *
   * @param string $baseURL
   * @return Response
   */
  public function extends(string $baseURL): self
  {
    $this->baseURL = $baseURL;

    return $this;
  }

  /**
   * Set layout.
   *
   * @param string $layout
   * @return Response
   */
  public function layout(string $layout): self
  {
    $this->layout = $layout;

    return $this;
  }

  /**
   * Create an HTTP response that represents the object.
   *
   * @param  \Illuminate\Http\Request  $request
   * @return \Symfony\Component\HttpFoundation\Response
   */
  public function toResponse($request)
  {
    // Call extensions
    foreach ($this->shares as $share) {
      $sharedProperties = is_callable($share)
        ? $share($request, $this)
        : $share;

      if (!empty($sharedProperties)) {
        $this->with($sharedProperties);
      }
    }

    // Indicate start of response
    if (config('app.debug')) {
      Event::dispatch('navigare.start', []);
    }

    // Prepare page
    $route = $request->route();

    $rawRoute = RawRoute::fromRoute($request->route(), $this->configuration);

    $location = Location::fromRequest($request);

    $defaults = $this->getDefaults();

    $parameters = collect($request->query())->merge(
      collect($request->route()->signatureParameters())
        ->filter(function (ReflectionParameter $parameter) use ($route) {
          return in_array($parameter->getName(), $route->parameterNames());
        })
        ->mapWithKeys(function (ReflectionParameter $parameter) use ($route) {
          return [
            $parameter->getName() => $route->originalParameter(
              $parameter->getName()
            ),
          ];
        })
    );

    // Determine which properties are actually selected
    $requestedProperties = collect(
      explode(',', $request->header('X-Navigare-Properties', ''))
    )
      ->filter()
      ->map(function ($property) {
        return Property::fromString($property);
      });

    // Prepare fragments and their properties
    $fragments = collect($this->fragments)->map(function ($fragment) use (
      $requestedProperties,
      $request,
      $location
    ) {
      if (!$fragment) {
        return null;
      }

      $fragment->properties = $this->resolvePropertyInstances(
        $request,
        $this->filterProperties(
          $fragment->properties,
          $requestedProperties,
          $fragment
        ),
        $requestedProperties
      );
      $fragment->location = $location;

      return $fragment;
    });

    // Collect all information for page
    $page = new Page(
      rawRoute: $rawRoute,
      fragments: $fragments,
      properties: $this->resolvePropertyInstances(
        $request,
        $this->filterProperties($this->properties, $requestedProperties),
        $requestedProperties
      ),
      layout: $this->layout,
      version: $this->version,
      location: $location,
      defaults: $defaults,
      parameters: $parameters,
      csrf: csrf_token()
    );

    // Expose event for debugging
    if (config('app.debug')) {
      Event::dispatch('navigare.collect', [
        'page' => $page,
      ]);
    }

    // If the request was triggered by Navigare itself, we return the response in JSON format
    $response = null;
    if ($request->header('X-Navigare')) {
      $response = new JsonResponse($page, 200, ['X-Navigare' => 'true']);
    } else {
      // Get base page for first rendering and merge fragments
      if ($this->baseURL) {
        $basePage = $this->getBasePage($request);

        // Assign base page to actual requested page
        $page->base = $basePage;

        // Remove fallback fragments if they are defined on the base page
        foreach ($page->fragments as $fragmentName => $fragment) {
          if (!$fragment) {
            continue;
          }

          if (!$fragment->fallback) {
            continue;
          }

          if (!$basePage->fragments->keys()->contains($fragmentName)) {
            continue;
          }

          unset($page->fragments[$fragmentName]);
        }
      }

      $response = ResponseFactory::view(
        $this->rootView,
        $this->viewData->toArray() + ['page' => $page],
        200,
        [
          'X-Navigare' => true,
        ]
      );
    }

    // Expose page for debugging
    if (config('app.debug')) {
      Event::dispatch('navigare.response', [
        'page' => $page,
      ]);
    }

    return $response;
  }

  /**
   * In case the method name is not defined we assume it's the name of the fragment.
   *
   * @return Response
   */
  public function __call($method, $arguments): self
  {
    if (Str::startsWith($method, 'without')) {
      return $this->withFragment(
        Str::camel(Str::after($method, 'without')),
        null
      );
    }

    if (Str::startsWith($method, 'withFallback')) {
      $componentName = $arguments[0];
      $properties = $arguments[1] ?? [];

      return $this->withFallbackFragment(
        Str::camel(Str::after($method, 'withFallback')),
        $componentName,
        $properties
      );
    }

    if (Str::startsWith($method, 'with')) {
      $componentName = $arguments[0];
      $properties = $arguments[1] ?? [];

      return $this->withFragment(
        Str::camel(Str::after($method, 'with')),
        $componentName,
        $properties
      );
    }

    trigger_error(
      'Call to undefined method ' . __CLASS__ . '::' . $method . '()',
      E_USER_ERROR
    );
  }

  /**
   * Return base page.
   *
   * @param  \Illuminate\Http\Request  $originalRequest
   * @return Page
   */
  public function getBasePage(Request $originalRequest): Page
  {
    if (config('app.debug')) {
      Event::dispatch('navigare.base.request', [
        'baseURL' => $this->baseURL,
      ]);
    }

    $request = Request::create(
      $this->baseURL,
      Request::METHOD_GET,
      $originalRequest->query->all(),
      $originalRequest->cookies->all(),
      $originalRequest->files->all(),
      $originalRequest->server->all() + [
        'HTTP_X_NAVIGARE' => true,
        'HTTP_X_NAVIGARE_VERSION' => $this->version,
      ],
      $originalRequest->getContent()
    );

    $request /*->setJson($request->json())
     ->setUserResolver(fn () => $request->getUserResolver())*/
      ->setLaravelSession($originalRequest->session());

    $response = Route::dispatch($request);

    if (!$response->headers->get('X-Navigare')) {
      throw new Exception('The base page must be a Navigare page.');
    }

    $page = $response->getOriginalContent();

    if (config('app.debug')) {
      Event::dispatch('navigare.base.response', [
        'baseURL' => $this->baseURL,
        'page' => $page,
      ]);
    }

    return $page;
  }

  /**
   * Return array of all the defaults that were set before.
   *
   * @param  \Illuminate\Http\Request  $request
   * @return Collection
   */
  public function getDefaults(): Collection
  {
    if (method_exists(app('url'), 'getDefaultParameters')) {
      return collect(app('url')->getDefaultParameters());
    }

    return collect([]);
  }

  /**
   * Resolve all necessary class instances in the given properties.
   *
   * @param  \Illuminate\Http\Request  $request
   * @param  Collection  $properties
   * @param  ?Fragment  $fragment
   * @return Collection
   */
  public function filterProperties(
    Collection $properties,
    Collection $requestedProperties,
    ?Fragment $fragment = null
  ): Collection {
    $rejectedProperties = $requestedProperties->filter(function (
      $selectedProperty
    ) {
      return $selectedProperty->negated;
    });
    $selectedProperties = $requestedProperties->filter(function (
      $selectedProperty
    ) {
      return !$selectedProperty->negated;
    });

    if ($selectedProperties->count() === 0) {
      $selectedProperties->push(new Property('*'));
    }

    return $properties
      ->filter(function ($value, $propertyName) use (
        $selectedProperties,
        $fragment
      ) {
        return $selectedProperties->some(
          fn($selectedProperty) => $selectedProperty->matches(
            $propertyName,
            $fragment
          )
        );
      })
      ->reject(function ($value, $propertyName) use (
        $rejectedProperties,
        $fragment
      ) {
        return $rejectedProperties->some(
          fn($rejectedProperty) => $rejectedProperty->matches(
            $propertyName,
            $fragment
          )
        );
      });
  }

  /**
   * Resolve all necessary class instances in the given properties.
   *
   * @param  \Illuminate\Http\Request  $request
   * @param  Collection  $properties
   * @param  ?Collection  $requestedProperties
   * @return Collection
   */
  public function resolvePropertyInstances(
    Request $request,
    Collection $properties,
    ?Collection $requestedProperties = null
  ): Collection {
    return $properties->map(function ($value) use (
      $request,
      $requestedProperties
    ) {
      $resolvedValue = null;

      // In case the property is wrapped in a function, we call the function to get the inner value
      if ($value instanceof Closure) {
        $value = App::call($value);
      } elseif ($value instanceof LazyProperty) {
        if ($requestedProperties?->count() > 0) {
          $value = App::call($value);
        }
      } elseif ($value instanceof DeferredProperty) {
        if ($requestedProperties?->count() > 0) {
          $value = App::call($value);
        } else {
          $resolvedValue = [
            '__deferred' => true,
          ];
        }
      }

      // Depending on the type of the value we resolve the actual output
      if ($resolvedValue) {
        // Value was resolved before
      } elseif (is_object($value) && isset($this->cache[$value])) {
        $resolvedValue = $this->cache[$value];
      } elseif ($value instanceof PromiseInterface) {
        $resolvedValue = $value->wait();
      } elseif (
        $value instanceof ResourceResponse ||
        $value instanceof JsonResource ||
        rescue(
          fn() => is_object($value) &&
            (get_class($value) === 'Spatie\LaravelData\DataCollection' ||
              in_array(
                'Spatie\LaravelData\DataCollection',
                class_parents($value)
              )),
          false
        )
      ) {
        $resolvedValue = $value->toResponse($request)->getData(true);
      } elseif (is_array($value) || $value instanceof Arrayable) {
        $resolvedValue = $this->resolvePropertyInstances(
          $request,
          collect($value)
        );
      } else {
        $resolvedValue = $value;
      }

      // Store result in cache
      if (is_object($value)) {
        $this->cache[$value] = $resolvedValue;
      }

      return $resolvedValue;
    });
  }
}
