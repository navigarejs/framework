<?php

namespace Jaulz\Navigare\Tests;

use Illuminate\Session\Middleware\StartSession;
use Illuminate\Support\Facades\Route;
use Jaulz\Navigare\Controller;
use Jaulz\Navigare\Tests\Stubs\ExampleMiddleware;

class ControllerTest extends TestCase
{
  public function test_controller_returns_an_navigare_response(): void
  {
    Route::middleware([StartSession::class, ExampleMiddleware::class])
      ->get('/{parameter}', Controller::class)
      ->defaults('component', 'User/Edit')
      ->defaults('props', [
        'user' => ['name' => 'Julian'],
      ])
      ->name('root');

    $response = $this->get('/foo?bar');

    $location = [
      'href' => 'http://localhost/foo?bar=',
      'host' => 'localhost:80',
      'hostname' => 'localhost',
      'origin' => 'http://localhost:80',
      'pathname' => '/foo?bar',
      'port' => '80',
      'protocol' => 'http:',
      'search' => '?bar=',
      'hash' => '',
    ];

    $parameters = [
      'parameter' => 'foo',
    ];

    $defaults = [];

    $rawRoute = [
      'uri' => '{parameter}',
      'methods' => ['GET', 'HEAD'],
      'name' => 'root',
      'wheres' => [],
      'domain' => null,
      'bindings' => [
        'parameter' => true,
      ],
      'components' => [],
    ];

    $this->assertEquals($response->viewData('page')->toArray(), [
      'version' => '',
      'layout' => null,
      'fragments' => [
        'default' => [
          'component' => 'User/Edit',
          'props' => [
            'user' => ['name' => 'Julian'],
          ],
          'rawRoute' => $rawRoute,
          'parameters' => $parameters,
          'defaults' => $defaults,
          'location' => $location,
        ],
      ],
      'props' => [
        'errors' => [],
      ],
      'rawRoute' => $rawRoute,
      'parameters' => $parameters,
      'defaults' => $defaults,
      'location' => $location,
    ]);
  }
}
