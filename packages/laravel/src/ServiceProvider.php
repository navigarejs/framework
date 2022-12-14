<?php

namespace Navigare;

use Illuminate\Foundation\Testing\TestResponse as LegacyTestResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Router;
use Illuminate\Support\ServiceProvider as BaseServiceProvider;
use Illuminate\Testing\TestResponse;
use Illuminate\View\FileViewFinder;
use Navigare\SSR\Gateway;
use Navigare\SSR\HttpGateway;
use Navigare\Testing\TestResponseMacros;
use LogicException;
use ReflectionException;

class ServiceProvider extends BaseServiceProvider
{
  public function register(): void
  {
    $this->app->singleton(ResponseFactory::class);
    $this->app->bind(Gateway::class, HttpGateway::class);

    $this->mergeConfigFrom(__DIR__ . '/../config/navigare.php', 'navigare');

    $this->registerBladeDirectives();
    $this->registerRequestMacro();
    $this->registerRouterMacro();
    $this->registerTestingMacros();

    $this->app->bind('navigare.components.finder', function ($app) {
      return new FileViewFinder(
        $app['files'],
        $app['config']->get('navigare.components.paths'),
        $app['config']->get('navigare.components.extensions')
      );
    });
  }

  public function boot(): void
  {
    $this->registerConsoleCommands();

    $this->publishes([
      __DIR__ . '/../config/navigare.php' => config_path('navigare.php'),
    ]);
  }

  protected function registerBladeDirectives(): void
  {
    $this->callAfterResolving('blade.compiler', function ($blade) {
      $blade->directive('navigare', [Directive::class, 'compile']);
    });
  }

  protected function registerConsoleCommands(): void
  {
    if (!$this->app->runningInConsole()) {
      return;
    }

    $this->commands([Console\Commands\CacheCommand::class]);

    $this->commands([Console\Commands\ClearCommand::class]);

    $this->commands([Console\Commands\CreateMiddlewareCommand::class]);

    $this->commands([Console\Commands\PrintConfigurationCommand::class]);

    $this->commands([Console\Commands\PrintRoutesCommand::class]);

    $this->commands([
      Console\Commands\UpdateTypeScriptConfigurationCommand::class,
    ]);
  }

  protected function registerRequestMacro(): void
  {
    Request::macro('navigare', function () {
      /** @var \Illuminate\Http\Request $this */

      return (bool) $this->header('X-Navigare');
    });
  }

  protected function registerRouterMacro(): void
  {
    Router::macro('navigare', function ($uri, $component, $props = []) {
      /** @var \Illuminate\Routing\Router $this */

      return $this->match(['GET', 'HEAD'], $uri, '\\' . Controller::class)
        ->defaults('component', $component)
        ->defaults('props', $props);
    });
  }

  /**
   * @throws ReflectionException|LogicException
   */
  protected function registerTestingMacros(): void
  {
    if (class_exists(TestResponse::class)) {
      TestResponse::mixin(new TestResponseMacros());

      return;
    }

    // Laravel <= 6.0
    if (class_exists(LegacyTestResponse::class)) {
      LegacyTestResponse::mixin(new TestResponseMacros());

      return;
    }

    throw new LogicException('Could not detect TestResponse class.');
  }
}
