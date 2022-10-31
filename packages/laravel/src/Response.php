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
use Illuminate\Support\Carbon;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\App;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Response as ResponseFactory;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Str;
use Illuminate\Support\Traits\Macroable;
use ReflectionParameter;

class Response implements Responsable
{
  use Macroable;

  protected string $rootView;

  protected string $version;

  protected ?string $baseURL = null;

  protected ?string $layout = null;

  protected array $viewData = [];

  protected array $fragments = [];

  protected Collection $shared;

  protected array $extensions = [];

  /**
   * @param  string  $fragmentName
   * @param  string  $component
   * @param  Collection  $properties
   * @param  string  $rootView
   * @param  ?string  $baseURL
   * @param  string  $version
   * @param  Collection  $shared
   * @param  array  $extensions
   */
  public function __construct(
    string $fragmentName,
    string $component,
    Collection $properties,
    string $rootView = 'app',
    ?string $baseURL = null,
    string $version = '',
    Collection $shared,
    array $extensions = []
  ) {
    $this->withFragment($fragmentName, $component, $properties);
    $this->rootView = $rootView;
    $this->baseURL = $baseURL;
    $this->version = $version;
    $this->shared = $shared;
    $this->extensions = $extensions;
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
  public function with(
    $key,
    $value = null,
    string $fragmentName = 'default'
  ): self {
    $fragment = $this->getFragment($fragmentName);
    $properties = $fragment->properties;

    if (is_array($key)) {
      $fragment->properties->merge($key);
    } else {
      $fragment->properties->put($key, $value);
    }

    return $this;
  }

  /**
   * Add new fragment to response.
   *
   * @param  string  $fragmentName
   * @param  string  $component
   * @param  array|Arrayable  $properties
   * @return self
   */
  public function withFragment(
    string $fragmentName = 'default',
    string $component,
    array|Arrayable $properties
  ): self {
    $this->fragments[$fragmentName] = new PageFragment(
      name: $fragmentName,
      component: $component,
      properties: collect($properties)
    );

    return $this;
  }

  /**
   * @param  string|array  $key
   * @param  mixed|null  $value
   * @return $this
   */
  public function withViewData($key, $value = null): self
  {
    if (is_array($key)) {
      $this->viewData = array_merge($this->viewData, $key);
    } else {
      $this->viewData[$key] = $value;
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
   * Extend a base page (i.e. for modals the page that is in the background).
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
    foreach ($this->extensions as $extension) {
      $extension($request, $this);
    }

    // Prepare page
    $rawRoute = RawRoute::fromRoute($request->route());

    $location = Location::fromRequest($request);

    $defaults = $this->getDefaults();

    $parameters = collect($request->route()->parameters())->filter(function (
      $value,
      $name
    ) use ($rawRoute) {
      return isset($rawRoute->bindings[$name]);
    });

    // Parse "properties" header into readable format
    $selectedProperties = collect(
      explode(',', $request->header('X-Navigare-Properties', ''))
    )
      ->filter()
      ->map(function ($property) {
        return SelectedProperty::fromString($property);
      });
    $selectedFragmentNames =
      $selectedProperties->count() > 0
        ? collect($selectedProperties)
          ->map(function ($selectedProp) {
            return $selectedProp->fragmentName;
          })
          ->unique()
        : collect(array_keys($this->fragments));

    // Prepare fragments and their properties
    $fragments = collect($this->fragments)
      ->filter(function ($fragment) use ($selectedFragmentNames) {
        return $selectedFragmentNames->contains($fragment->name);
      })
      ->map(function ($fragment) use (
        $selectedProperties,
        $request,
        $rawRoute,
        $location,
        $defaults,
        $parameters
      ) {
        $properties = collect(
          $selectedProperties->count() > 0
            ? $fragment->properties->only(
              $selectedProperties
                ->filter(function ($selectedProperty) use ($fragment) {
                  return $selectedProperty->fragmentName === $fragment->name;
                })
                ->map(function ($selectedProperty) {
                  return $selectedProperty->name;
                })
            )
            : $fragment->properties->filter(function ($property) {
              return !($property instanceof LazyProp);
            })
        );

        $fragment->properties = $this->resolvePropertyInstances(
          $request,
          $fragment->properties
        );
        $fragment->rawRoute = $rawRoute;
        $fragment->location = $location;
        $fragment->defaults = $defaults;
        $fragment->parameters = $parameters;

        return $fragment;
      });

    // Collect all information for page
    $page = new Page(
      rawRoute: $rawRoute,
      fragments: $fragments,
      properties: $this->resolvePropertyInstances($request, $this->shared),
      layout: $this->layout,
      version: $this->version,
      location: $location,
      defaults: $defaults,
      parameters: $parameters,
      csrf: csrf_token()
    );

    // Expose page for debugging
    if (config('app.debug')) {
      Event::dispatch('navigare.response', [$page]);
    }

    // If the request was triggered by Navigare itself, we return the response
    // in JSON format
    if ($request->header('X-Navigare')) {
      return new JsonResponse($page, 200, ['X-Navigare' => 'true']);
    }

    // Get base page for first rendering and merge fragments
    if ($this->baseURL) {
      $basePage = $this->getBasePage($request);

      $page->mergeFragments($basePage->fragments);
    }

    return ResponseFactory::view(
      $this->rootView,
      $this->viewData + ['page' => $page],
      200,
      [
        'X-Navigare' => true,
      ]
    );
  }

  /**
   * In case the method name is not defined we assume it's the name of the fragment.
   *
   * @return Response
   */
  public function __call($method, $arguments): self
  {
    if (isset($arguments[0]) && is_string($arguments[0])) {
      $this->withFragment($method, $arguments[0], $arguments[1] ?? []);

      return $this;
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
   * @return Collection
   */
  public function getBasePage(Request $originalRequest): Collection
  {
    $request = Request::create(
      $this->baseURL,
      Request::METHOD_GET,
      $originalRequest->query->all(),
      $originalRequest->cookies->all(),
      $originalRequest->files->all(),
      $originalRequest->server->all() + [
        'HTTP_X_NAVIGARE' => true,
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
   * @return Collection
   */
  public function resolvePropertyInstances(
    Request $request,
    Collection $properties
  ): Collection {
    return $properties->map(function ($value) use ($request) {
      if ($value instanceof Closure) {
        $value = App::call($value);
      }

      if ($value instanceof LazyProp) {
        $value = App::call($value);
      }

      if ($value instanceof PromiseInterface) {
        $value = $value->wait();
      }

      if (
        $value instanceof ResourceResponse ||
        $value instanceof JsonResource
      ) {
        $value = $value->toResponse($request)->getData(true);
      }

      if ($value instanceof Arrayable) {
        $value = $value->toArray();
      }

      if (is_array($value) || $value instanceof Collection) {
        $value = $this->resolvePropertyInstances($request, collect($value));
      }

      return $value;
    });
  }
}
