<?php

namespace Navigare;

use Closure;
use Illuminate\Contracts\Support\Arrayable;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\App;
use Illuminate\Support\Facades\Request;
use Illuminate\Support\Facades\Response as BaseResponse;
use Illuminate\Support\Traits\Macroable;

class NavigareFactory
{
  use Macroable;

  protected string $rootView = 'app';

  protected ?Configuration $configuration = null;

  protected ?string $parentURL = null;

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
   * Set configuration for the Navigare response.
   *
   * @param  Configuration $configuration
   */
  public function setConfiguration(Configuration $configuration): void
  {
    $this->configuration = $configuration;
  }

  /**
   * Get configuration for the Navigare response.
   *
   * @return ?Configuration
   */
  public function getConfiguration(): ?Configuration
  {
    return $this->configuration ??= Configuration::read();
  }

  /**
   * Set parent URL of page (i.e. for modals the page that is in the background).
   *
   * @param  string $parentURL
   */
  public function extends(string $parentURL): void
  {
    $this->parentURL = $parentURL;
  }

  /**
   * Set version.
   *
   * @param  Closure|string|null  $version
   */
  public function setVersion(Closure|string|null $version): void
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
   * Render component with properties to fragment.
   *
   * @param  string  $componentName
   * @param  array|Arrayable  $properties
   * @param  ?string  $fragmentName
   * @return Response
   */
  public function render(
    string $componentName,
    array|Arrayable $properties = [],
    string $fragmentName = 'default'
  ): Response {
    $response = new Response(
      rootView: $this->rootView,
      configuration: $this->getConfiguration(),
      parentURL: $this->parentURL,
      version: $this->getVersion(),
      extensions: $this->extensions
    );
    $response->withFragment($fragmentName, $componentName, $properties);

    return $response;
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
      return BaseResponse::make('', 409, ['X-Navigare-Location' => $url]);
    }

    return new RedirectResponse($url);
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
}
