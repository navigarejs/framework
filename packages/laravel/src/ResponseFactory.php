<?php

namespace Jaulz\Navigare;

use Closure;
use Illuminate\Contracts\Support\Arrayable;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\App;
use Illuminate\Support\Facades\Request;
use Illuminate\Support\Facades\Response as BaseResponse;
use Illuminate\Support\Traits\Macroable;

class ResponseFactory
{
  use Macroable;

  protected string $rootView = 'app';

  protected ?string $baseURL = null;

  protected array $sharedProps = [];

  protected array $extensions = [];

  /** @var Closure|string|null */
  protected $version;

  /**
   * Set root view (i.e. the blade component) for the Navigare response.
   *
   * @param  string $rootView
   */
  public function setRootView(string $rootView): void
  {
    $this->rootView = $rootView;
  }

  /**
   * Set base URL of page (i.e. for modals the page that is in the background).
   *
   * @param  string $baseURL
   */
  public function setBaseURL(string $baseURL): void
  {
    $this->baseURL = $baseURL;
  }

  /**
   * Share props.
   *
   * @param  string|array|Arrayable  $key
   * @param  mixed|null  $value
   */
  public function share($key, $value = null): void
  {
    if (is_array($key)) {
      $this->sharedProps = array_merge($this->sharedProps, $key);
    } elseif ($key instanceof Arrayable) {
      $this->sharedProps = array_merge($this->sharedProps, $key->toArray());
    } else {
      Arr::set($this->sharedProps, $key, $value);
    }
  }

  /**
   * Return shared props.
   *
   * @param  string|null  $key
   * @param  null|mixed  $default
   * @return mixed
   */
  public function getShared(string $key = null, $default = null)
  {
    if ($key) {
      return Arr::get($this->sharedProps, $key, $default);
    }

    return $this->sharedProps;
  }

  /**
   * Clear shared props.
   */
  public function flushShared(): void
  {
    $this->sharedProps = [];
  }

  /**
   * Set version.
   *
   * @param  Closure|string|null  $version
   */
  public function version($version): void
  {
    $this->setVersion($version);
  }

  /**
   * Set version.
   *
   * @param  Closure|string|null  $version
   */
  public function setVersion($version): void
  {
    $this->version = $version;
  }

  /**
   * Return version by resolving the version that was set before.
   *
   * @return  string
   */
  public function getVersion(): string
  {
    $version =
      $this->version instanceof Closure
        ? App::call($this->version)
        : $this->version;

    return (string) $version;
  }

  /**
   * Add extension to Inertia response which allows customizations before
   * it is turned into a Laravel response.
   *
   * @param  Closure  $extension
   */
  public function extend(Closure $extension): void
  {
    array_push($this->extensions, $extension);
  }

  /**
   * Create instance of LazyProp.
   *
   * @param  Closure  $callback
   * @return LazyProp
   */
  public function lazy(Closure $callback): LazyProp
  {
    return new LazyProp($callback);
  }

  /**
   * Render component with props to fragment.
   *
   * @param  string  $component
   * @param  array|Arrayable  $props
   * @param  ?string  $fragmentName
   * @return Response
   */
  public function render(
    string $component,
    array|Arrayable $props = [],
    string $fragmentName = 'default'
  ): Response {
    return new Response(
      $fragmentName,
      $component,
      collect($props),
      $this->rootView,
      $this->baseURL,
      $this->getVersion(),
      collect($this->sharedProps),
      $this->extensions
    );
  }

  /**
   * In case the method name is not defined we assume it's the name of the fragment.
   *
   * @return Response
   */
  public function __call($method, $arguments)
  {
    if (isset($arguments[0]) && is_string($arguments[0])) {
      return $this->render($arguments[0], $arguments[1] ?? [], $method);
    }

    trigger_error(
      'Call to undefined method ' . __CLASS__ . '::' . $method . '()',
      E_USER_ERROR
    );
  }

  /**
   * Trigger redirect.
   *
   * @param  string|RedirectResponse  $url
   */
  public function location($url): \Symfony\Component\HttpFoundation\Response
  {
    if ($url instanceof RedirectResponse) {
      $url = $url->getTargetUrl();
    }

    if (Request::navigare()) {
      return BaseResponse::make('', 409, ['x-navigare-location' => $url]);
    }

    return new RedirectResponse($url);
  }
}
