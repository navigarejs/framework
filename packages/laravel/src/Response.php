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
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\App;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Response as ResponseFactory;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Traits\Macroable;
use Navigare\Router\RawRoute;
use Navigare\Support\SelectedProperty;
use Navigare\View\DeferredProperty;
use Navigare\View\LazyProperty;
use Navigare\View\Location;
use Navigare\View\Page;
use Navigare\View\Component;
use Navigare\View\Fragment;
use ReflectionParameter;

class Response implements Responsable
{
  use Macroable;

  public function __construct(
    protected Configuration $configuration,
    protected string $version = '',
    protected array $extensions = [],
    protected ?Collection $properties = null,
    protected string $rootView = 'app',
    protected ?string $baseURL = null,
    protected ?string $layout = null,
    protected ?Collection $viewData = null,
    protected ?array $fragments = []
  ) {
    $this->properties = $properties ?? collect([]);
    $this->viewData = $viewData ?? collect([]);
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
   * @param  string  $component
   * @param  array|Arrayable  $properties
   * @return self
   */
  public function withFragment(
    string $fragmentName,
    string $componentName,
    array|Arrayable $properties
  ): self {
    $this->fragments[$fragmentName] = new Fragment(
      name: $fragmentName,
      component: Component::fromName($componentName, $this->configuration),
      properties: collect($properties)
    );

    return $this;
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
    foreach ($this->extensions as $extension) {
      $extension($request, $this);
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

    // Parse "select" header into readable format
    $selectedProperties = collect(
      explode(',', $request->header('X-Navigare-Properties', ''))
    )
      ->filter()
      ->map(function ($property) {
        return SelectedProperty::fromString($property);
      });

    // Prepare fragments and their properties
    $fragments = collect($this->fragments)->map(function ($fragment) use (
      $selectedProperties,
      $request,
      $location
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
          : $fragment->properties
      );

      $fragment->properties = $this->resolvePropertyInstances(
        $request,
        $properties
      );
      $fragment->location = $location;

      return $fragment;
    });

    // Collect all information for page
    $page = new Page(
      rawRoute: $rawRoute,
      fragments: $fragments,
      properties: $this->resolvePropertyInstances($request, $this->properties),
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

      $page->base = $basePage;
    }

    return ResponseFactory::view(
      $this->rootView,
      $this->viewData->toArray() + ['page' => $page],
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
   * @return Page
   */
  public function getBasePage(Request $originalRequest): Page
  {
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

      if ($value instanceof LazyProperty) {
        if ($request->headers->has('X-Navigare-Properties')) {
          $value = App::call($value);
        }
      }

      if ($value instanceof DeferredProperty) {
        if ($request->headers->has('X-Navigare-Properties')) {
          $value = App::call($value);
        } else {
          $value = [
            '__deferred' => true,
          ];
        }
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
