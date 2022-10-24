<?php

namespace Jaulz\Navigare\Tests\Testing;

use Jaulz\Navigare\Navigare;
use Jaulz\Navigare\Tests\TestCase;
use PHPUnit\Framework\AssertionFailedError;

class AssertableNavigareTest extends TestCase
{
  /** @test */
  public function the_view_is_served_by_navigare(): void
  {
    $response = $this->makeMockRequest(Navigare::render('foo'));

    $response->assertNavigare();
  }

  /** @test */
  public function the_view_is_not_served_by_navigare(): void
  {
    $response = $this->makeMockRequest(view('welcome'));
    $response->assertOk(); // Make sure we can render the built-in Orchestra 'welcome' view..

    $this->expectException(AssertionFailedError::class);
    $this->expectExceptionMessage('Not a valid Navigare response.');

    $response->assertNavigare();
  }

  /** @test */
  public function the_component_matches(): void
  {
    $response = $this->makeMockRequest(Navigare::render('foo'));

    $response->assertNavigare(function ($navigare) {
      $navigare->component('foo');
    });
  }

  /** @test */
  public function the_component_does_not_match(): void
  {
    $response = $this->makeMockRequest(Navigare::render('foo'));

    $this->expectException(AssertionFailedError::class);
    $this->expectExceptionMessage('Unexpected Navigare page component.');

    $response->assertNavigare(function ($navigare) {
      $navigare->component('bar');
    });
  }

  /** @test */
  public function the_component_exists_on_the_filesystem(): void
  {
    $response = $this->makeMockRequest(Navigare::render('Stubs/ExamplePage'));

    config()->set('navigare.testing.ensure_pages_exist', true);
    $response->assertNavigare(function ($navigare) {
      $navigare->component('Stubs/ExamplePage');
    });
  }

  /** @test */
  public function the_component_does_not_exist_on_the_filesystem(): void
  {
    $response = $this->makeMockRequest(Navigare::render('foo'));

    config()->set('navigare.testing.ensure_pages_exist', true);
    $this->expectException(AssertionFailedError::class);
    $this->expectExceptionMessage(
      'Navigare page component file [foo] does not exist.'
    );

    $response->assertNavigare(function ($navigare) {
      $navigare->component('foo');
    });
  }

  /** @test */
  public function it_can_force_enable_the_component_file_existence(): void
  {
    $response = $this->makeMockRequest(Navigare::render('foo'));

    config()->set('navigare.testing.ensure_pages_exist', false);
    $this->expectException(AssertionFailedError::class);
    $this->expectExceptionMessage(
      'Navigare page component file [foo] does not exist.'
    );

    $response->assertNavigare(function ($navigare) {
      $navigare->component('foo', true);
    });
  }

  /** @test */
  public function it_can_force_disable_the_component_file_existence_check(): void
  {
    $response = $this->makeMockRequest(Navigare::render('foo'));

    config()->set('navigare.testing.ensure_pages_exist', true);

    $response->assertNavigare(function ($navigare) {
      $navigare->component('foo', false);
    });
  }

  /** @test */
  public function the_component_does_not_exist_on_the_filesystem_when_it_does_not_exist_relative_to_any_of_the_given_paths(): void
  {
    $response = $this->makeMockRequest(
      Navigare::render('fixtures/ExamplePage')
    );

    config()->set('navigare.testing.ensure_pages_exist', true);
    config()->set('navigare.testing.page_paths', [realpath(__DIR__)]);
    $this->expectException(AssertionFailedError::class);
    $this->expectExceptionMessage(
      'Navigare page component file [fixtures/ExamplePage] does not exist.'
    );

    $response->assertNavigare(function ($navigare) {
      $navigare->component('fixtures/ExamplePage');
    });
  }

  /** @test */
  public function the_component_does_not_exist_on_the_filesystem_when_it_does_not_have_one_of_the_configured_extensions(): void
  {
    $response = $this->makeMockRequest(
      Navigare::render('fixtures/ExamplePage')
    );

    config()->set('navigare.testing.ensure_pages_exist', true);
    config()->set('navigare.testing.page_extensions', ['bin', 'exe', 'svg']);
    $this->expectException(AssertionFailedError::class);
    $this->expectExceptionMessage(
      'Navigare page component file [fixtures/ExamplePage] does not exist.'
    );

    $response->assertNavigare(function ($navigare) {
      $navigare->component('fixtures/ExamplePage');
    });
  }

  /** @test */
  public function the_page_url_matches(): void
  {
    $response = $this->makeMockRequest(Navigare::render('foo'));

    $response->assertNavigare(function ($navigare) {
      $navigare->url('/example-url');
    });
  }

  /** @test */
  public function the_page_url_does_not_match(): void
  {
    $response = $this->makeMockRequest(Navigare::render('foo'));

    $this->expectException(AssertionFailedError::class);
    $this->expectExceptionMessage('Unexpected Navigare page url.');

    $response->assertNavigare(function ($navigare) {
      $navigare->url('/invalid-page');
    });
  }

  /** @test */
  public function the_asset_version_matches(): void
  {
    Navigare::version('example-version');

    $response = $this->makeMockRequest(Navigare::render('foo'));

    $response->assertNavigare(function ($navigare) {
      $navigare->version('example-version');
    });
  }

  /** @test */
  public function the_asset_version_does_not_match(): void
  {
    Navigare::version('example-version');

    $response = $this->makeMockRequest(Navigare::render('foo'));

    $this->expectException(AssertionFailedError::class);
    $this->expectExceptionMessage('Unexpected Navigare asset version.');

    $response->assertNavigare(function ($navigare) {
      $navigare->version('different-version');
    });
  }
}
