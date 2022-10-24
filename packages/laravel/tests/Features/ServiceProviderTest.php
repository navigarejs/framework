<?php

namespace Jaulz\Navigare\Tests;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Blade;
use Illuminate\Support\Facades\Route;

class ServiceProviderTest extends TestCase
{
  public function test_blade_directive_is_registered(): void
  {
    $this->assertArrayHasKey('navigare', Blade::getCustomDirectives());
  }

  public function test_request_macro_is_registered(): void
  {
    $request = Request::create('/user/123', 'GET');

    $this->assertFalse($request->navigare());

    $request->headers->add(['X-Navigare' => 'true']);

    $this->assertTrue($request->navigare());
  }

  public function test_route_macro_is_registered(): void
  {
    $route = Route::navigare('/', 'User/Edit', [
      'user' => ['name' => 'Julian'],
    ]);
    $routes = Route::getRoutes();

    $this->assertNotEmpty($routes->getRoutes());
    $this->assertEquals($route, $routes->getRoutes()[0]);
    $this->assertEquals(['GET', 'HEAD'], $route->methods);
    $this->assertEquals('/', $route->uri);
    $this->assertEquals(
      [
        'uses' => '\Jaulz\Navigare\Controller@__invoke',
        'controller' => '\Jaulz\Navigare\Controller',
      ],
      $route->action
    );
    $this->assertEquals(
      ['component' => 'User/Edit', 'props' => ['user' => ['name' => 'Julian']]],
      $route->defaults
    );
  }
}
