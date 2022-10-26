<?php

namespace Navigare\Tests;

use Illuminate\Contracts\Support\Arrayable;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Response;
use Illuminate\Session\Middleware\StartSession;
use Illuminate\Support\Facades\Request;
use Illuminate\Support\Facades\Route;
use Navigare\Navigare;
use Navigare\LazyProp;
use Navigare\ResponseFactory;
use Navigare\Tests\Stubs\ExampleMiddleware;

class ResponseFactoryTest extends TestCase
{
  public function test_can_macro(): void
  {
    $factory = new ResponseFactory();
    $factory->macro('foo', function () {
      return 'bar';
    });

    $this->assertEquals('bar', $factory->foo());
  }

  public function test_location_response_for_navigare_requests(): void
  {
    Request::macro('navigare', function () {
      return true;
    });

    $response = (new ResponseFactory())->location(
      'https://jaulz.github.io/navigare'
    );

    $this->assertInstanceOf(Response::class, $response);
    $this->assertEquals(Response::HTTP_CONFLICT, $response->getStatusCode());
    $this->assertEquals(
      'https://jaulz.github.io/navigare',
      $response->headers->get('X-Navigare-Location')
    );
  }

  public function test_location_response_for_non_navigare_requests(): void
  {
    Request::macro('navigare', function () {
      return false;
    });

    $response = (new ResponseFactory())->location(
      'https://jaulz.github.io/navigare'
    );

    $this->assertInstanceOf(RedirectResponse::class, $response);
    $this->assertEquals(Response::HTTP_FOUND, $response->getStatusCode());
    $this->assertEquals(
      'https://jaulz.github.io/navigare',
      $response->headers->get('location')
    );
  }

  public function test_location_response_for_navigare_requests_using_redirect_response(): void
  {
    Request::macro('navigare', function () {
      return true;
    });

    $redirect = new RedirectResponse('https://jaulz.github.io/navigare');
    $response = (new ResponseFactory())->location($redirect);

    $this->assertInstanceOf(Response::class, $response);
    $this->assertEquals(409, $response->getStatusCode());
    $this->assertEquals(
      'https://jaulz.github.io/navigare',
      $response->headers->get('X-Navigare-Location')
    );
  }

  public function test_location_response_for_non_navigare_requests_using_redirect_response(): void
  {
    $redirect = new RedirectResponse('https://jaulz.github.io/navigare');
    $response = (new ResponseFactory())->location($redirect);

    $this->assertInstanceOf(RedirectResponse::class, $response);
    $this->assertEquals(Response::HTTP_FOUND, $response->getStatusCode());
    $this->assertEquals(
      'https://jaulz.github.io/navigare',
      $response->headers->get('location')
    );
  }

  public function test_the_version_can_be_a_closure(): void
  {
    Route::middleware([StartSession::class, ExampleMiddleware::class])->get(
      '/',
      function () {
        $this->assertSame('', Navigare::getVersion());

        Navigare::version(function () {
          return md5('Navigare');
        });

        return Navigare::render('User/Edit');
      }
    );

    $response = $this->withoutExceptionHandling()->get('/', [
      'X-Navigare' => 'true',
      'X-Navigare-Version' => '9e19466cb1888e3842a56ae4702706ac',
    ]);

    $response->assertSuccessful();
    $response->assertJson(['component' => 'User/Edit']);
  }

  public function test_shared_data_can_be_shared_from_anywhere(): void
  {
    Route::middleware([StartSession::class, ExampleMiddleware::class])->get(
      '/',
      function () {
        Navigare::share('foo', 'bar');

        return Navigare::render('User/Edit');
      }
    );

    $response = $this->withoutExceptionHandling()->get('/', [
      'X-Navigare' => 'true',
    ]);

    $response->assertSuccessful();
    $response->assertJson([
      'component' => 'User/Edit',
      'props' => [
        'foo' => 'bar',
      ],
    ]);
  }

  public function test_can_flush_shared_data(): void
  {
    Navigare::share('foo', 'bar');
    $this->assertSame(['foo' => 'bar'], Navigare::getShared());
    Navigare::flushShared();
    $this->assertSame([], Navigare::getShared());
  }

  public function test_can_create_lazy_prop(): void
  {
    $factory = new ResponseFactory();
    $lazyProp = $factory->lazy(function () {
      return 'A lazy value';
    });

    $this->assertInstanceOf(LazyProp::class, $lazyProp);
  }

  public function test_will_accept_arrayabe_props()
  {
    Route::middleware([StartSession::class, ExampleMiddleware::class])->get(
      '/',
      function () {
        Navigare::share('foo', 'bar');

        return Navigare::render(
          'User/Edit',
          new class implements Arrayable {
            public function toArray()
            {
              return [
                'foo' => 'bar',
              ];
            }
          }
        );
      }
    );

    $response = $this->withoutExceptionHandling()->get('/', [
      'X-Navigare' => 'true',
    ]);
    $response->assertSuccessful();
    $response->assertJson([
      'component' => 'User/Edit',
      'props' => [
        'foo' => 'bar',
      ],
    ]);
  }
}
