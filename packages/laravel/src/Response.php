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
   * @param  Collection  $props
   * @param  string  $rootView
   * @param  ?string  $baseURL
   * @param  string  $version
   * @param  Collection  $shared
   * @param  array  $extensions
   */
  public function __construct(
    string $fragmentName,
    string $component,
    Collection $props,
    string $rootView = 'app',
    ?string $baseURL = null,
    string $version = '',
    Collection $shared,
    array $extensions = []
  ) {
    $this->addFragment($fragmentName, $component, $props);
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
   * Add new fragment to response.
   *
   * @param  string  $fragmentName
   * @param  string  $component
   * @param  array|Arrayable  $props
   * @return self
   */
  public function addFragment(
    string $fragmentName = 'default',
    string $component,
    array|Arrayable $props
  ): self {
    $this->fragments[$fragmentName] = new Fragment(
      $fragmentName,
      $component,
      collect($props)
    );

    return $this;
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
    $props = $fragment->props;

    if (is_array($key)) {
      $fragment->props->merge($key);
    } else {
      $fragment->props->put($key, $value);
    }

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
   * @deprecated
   * @param string $rootView
   * @return Response
   */
  public function rootView(string $rootView): self
  {
    return $this->setRootView($rootView);
  }

  /**
   * Set root view (i.e. the blade component) for the Navigare response.
   *
   * @param string $rootView
   * @return Response
   */
  public function setRootView(string $rootView): self
  {
    $this->rootView = $rootView;

    return $this;
  }

  /**
   * Set base URL of page (i.e. for modals the page that is in the background).
   *
   * @param string $rootView
   * @return Response
   */
  public function setBaseURL(string $baseURL): self
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
  public function setLayout(string $layout): self
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
    $rawRoute = Routes::getRoute($request->route());

    $location = $this->getLocation($request);

    $defaults = $this->getDefaults();

    $parameters = collect($request->route()->parameters())->filter(function (
      $value,
      $name
    ) use ($rawRoute) {
      return isset($rawRoute['bindings'][$name]);
    });

    // Parse "props" header into readable format
    $selectedProps = collect(
      explode(',', $request->header('X-Navigare-Props', ''))
    )
      ->filter()
      ->map(function ($prop) {
        if (Str::contains($prop, '/')) {
          [$fragmentName, $prop] = explode('/', $prop);

          return [
            'fragmentName' => $fragmentName,
            'name' => $prop,
          ];
        }

        return [
          'fragmentName' => 'default',
          'name' => $prop,
        ];
      });
    $selectedFragmentNames =
      $selectedProps->count() > 0
        ? collect($selectedProps)
          ->map(function ($selectedProp) {
            return $selectedProp['fragmentName'];
          })
          ->unique()
        : collect(array_keys($this->fragments));

    // Prepare fragments and their props
    $fragments = collect($this->fragments)
      ->filter(function ($fragment) use ($selectedFragmentNames) {
        return $selectedFragmentNames->contains($fragment->name);
      })
      ->map(function ($fragment) use (
        $selectedProps,
        $request,
        $rawRoute,
        $location,
        $defaults,
        $parameters
      ) {
        $props = collect(
          $selectedProps->count() > 0
            ? $fragment->props->only(
              $selectedProps
                ->filter(function ($selectedProp) use ($fragment) {
                  return $selectedProp['fragmentName'] === $fragment->name;
                })
                ->map(function ($selectedProp) {
                  return $selectedProp['name'];
                })
            )
            : $fragment->props->filter(function ($prop) {
              return !($prop instanceof LazyProp);
            })
        );

        return collect([
          'component' => $fragment->component,

          'props' => $this->resolvePropertyInstances($request, $props),

          'rawRoute' => $rawRoute,

          'location' => $location,

          'defaults' => $defaults,

          'parameters' => $parameters,
        ]);
      });

    // Collect all information for page
    $page = collect([
      'fragments' => $fragments,

      'props' => $this->resolvePropertyInstances($request, $this->shared),

      'layout' => $this->layout,

      'version' => $this->version,

      'rawRoute' => $rawRoute,

      'location' => $location,

      'defaults' => $defaults,

      'parameters' => $parameters,
    ]);

    // If the request was triggered by Navigare itself, we return the response
    // in JSON format
    if ($request->header('X-Navigare')) {
      return new JsonResponse($page, 200, ['X-Navigare' => 'true']);
    }

    // Get base page for first rendering and merge fragments
    if ($this->baseURL) {
      $basePage = $this->getBasePage($request);

      $page->put(
        'fragments',
        $basePage->get('fragments')->merge($page['fragments'])
      );
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
      $this->addFragment($method, $arguments[0], $arguments[1] ?? []);

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
   * @return array
   */
  public function getDefaults(): array
  {
    if (method_exists(app('url'), 'getDefaultParameters')) {
      return app('url')->getDefaultParameters();
    }

    return [];
  }

  /**
   * Return array that describes the location of the requested resource.
   * It resembles the one from JavaScript.
   *
   * @param  \Illuminate\Http\Request  $request
   * @return array
   */
  public function getLocation(Request $request): array
  {
    return [
      'href' => $request->fullUrl(),
      'host' => $request->getHost() . ':' . $request->getPort(),
      'hostname' => $request->getHost(),
      'origin' =>
        $request->getScheme() .
        '://' .
        $request->getHost() .
        ':' .
        $request->getPort(),
      'pathname' => $request->getRequestUri(),
      'port' => '' . $request->getPort(),
      'protocol' => $request->getScheme() . ':',
      'search' => $request->getQueryString()
        ? '?' . $request->getQueryString()
        : '',
      'hash' => '',
    ];
  }

  /**
   * Resolve all necessary class instances in the given props.
   *
   * @param  \Illuminate\Http\Request  $request
   * @param  Collection  $props
   * @return Collection
   */
  public function resolvePropertyInstances(
    Request $request,
    Collection $props
  ): Collection {
    return $props->map(function ($value) use ($request) {
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
