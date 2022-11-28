<?php

namespace Navigare;

use Closure;
use Illuminate\Contracts\Support\Arrayable;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\App;
use Illuminate\Support\Facades\Request;
use Illuminate\Support\Facades\Response as BaseResponse;
use Illuminate\Support\Str;
use Illuminate\Support\Traits\Macroable;
use Navigare\View\DeferredProperty;
use Navigare\View\LazyProperty;

class ResponseFactory
{
  use Macroable;

  protected string $rootView = 'app';

  protected ?string $layout = null;

  protected ?Configuration $configuration = null;

  protected ?string $baseURL = null;

  protected array $shares = [];

  /** @var Closure|string|null */
  protected $version;

  /**
   * Set root view (i.e. the blade component) for the Navigare response.
   *
   * @param  string $name
   * @return self
   */
  public function setRootView(string $name): self
  {
    $this->rootView = $name;

    return $this;
  }

  /**
   * Set root view (i.e. the blade component) for the Navigare response.
   *
   * @param  string $name
   * @return self
   */
  public function rootView(string $name): self
  {
    return $this->setRootView($name);
  }

  /**
   * Set layout for the Navigare response.
   *
   * @param  string $name
   * @return self
   */
  public function setLayout(string $name): self
  {
    $this->layout = $name;

    return $this;
  }

  /**
   * Set layout for the Navigare response.
   *
   * @param  string $name
   * @return self
   */
  public function layout(string $name): self
  {
    return $this->setLayout($name);
  }

  /**
   * Set configuration for the Navigare response.
   *
   * @param  Configuration $configuration
   * @return self
   */
  public function setConfiguration(Configuration $configuration): self
  {
    $this->configuration = $configuration;

    return $this;
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
   * @param  string $url
   * @return self
   */
  public function extends(string $url): self
  {
    $this->baseURL = $url;

    return $this;
  }

  /**
   * Set version.
   *
   * @param  Closure|string|null  $version
   * @return self
   */
  public function setVersion(Closure|string|null $version): self
  {
    $this->version = $version;

    return $this;
  }

  /**
   * Set version.
   *
   * @param  Closure|string|null  $version
   * @return self
   */
  public function version(Closure|string|null $version): self
  {
    return $this->setVersion($version);
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
   * Add extension to Navigare response which allows customizations before
   * it is turned into a Laravel response.
   *
   * @param  Closure|array  $share
   */
  public function share(Closure|array $share): void
  {
    array_push($this->shares, $share);
  }

  /**
   * Create instance of LazyProperty.
   *
   * @param  Closure  $callback
   * @return LazyProperty
   */
  public function lazy(Closure $callback): LazyProperty
  {
    return new LazyProperty($callback);
  }

  /**
   * Create instance of DeferredProperty.
   *
   * @param  Closure  $callback
   * @return DeferredProperty
   */
  public function deferred(Closure $callback): DeferredProperty
  {
    return new DeferredProperty($callback);
  }

  /**
   * Render component with properties to default fragment.
   *
   * @param  ?string  $componentName
   * @param  ?array|Arrayable  $properties
   * @return Response
   */
  public function render(
    string $componentName = null,
    array|Arrayable $properties = []
  ): Response {
    return $this->withFragment('default', $componentName, $properties);
  }

  /**
   * Render component with properties to fragment.
   *
   * @param  string  $fragmentName
   * @param  ?string  $componentName
   * @param  ?array|Arrayable|null  $properties
   * @return Response
   */
  public function withFragment(
    string $fragmentName,
    string $componentName = null,
    array|Arrayable|null $properties = []
  ): Response {
    $response = new Response(
      rootView: $this->rootView,
      configuration: $this->getConfiguration(),
      baseURL: $this->baseURL,
      version: $this->getVersion(),
      shares: $this->shares,
      layout: $this->layout
    );

    if ($componentName) {
      $response->withFragment($fragmentName, $componentName, $properties);
    }

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
    if (Str::startsWith($method, 'without')) {
      return $this->withFragment(
        Str::camel(Str::after($method, 'without')),
        null
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
}
