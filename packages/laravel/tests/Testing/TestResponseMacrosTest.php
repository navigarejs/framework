<?php

namespace Jaulz\Navigare\Tests\Testing;

use Illuminate\Testing\Fluent\AssertableJson;
use Jaulz\Navigare\Navigare;
use Jaulz\Navigare\Testing\Assert;
use Jaulz\Navigare\Tests\TestCase;

class TestResponseMacrosTest extends TestCase
{
  /** @test */
  public function it_can_make_navigare_assertions(): void
  {
    $response = $this->makeMockRequest(Navigare::render('foo'));

    $success = false;
    $response->assertNavigare(function ($page) use (&$success) {
      if (class_exists(AssertableJson::class)) {
        $this->assertInstanceOf(AssertableJson::class, $page);
      } else {
        // TODO: Remove once built-in Assert library is removed.
        $this->assertInstanceOf(Assert::class, $page);
      }
      $success = true;
    });

    $this->assertTrue($success);
  }

  /** @test */
  public function it_preserves_the_ability_to_continue_chaining_laravel_test_response_calls(): void
  {
    $response = $this->makeMockRequest(Navigare::render('foo'));

    $this->assertInstanceOf(
      $this->getTestResponseClass(),
      $response->assertNavigare()
    );
  }

  /** @test */
  public function it_can_retrieve_the_navigare_page(): void
  {
    $response = $this->makeMockRequest(
      Navigare::render('foo', ['bar' => 'baz'])
    );

    tap($response->navigarePage(), function (array $page) {
      $this->assertSame('foo', $page['component']);
      $this->assertSame(['bar' => 'baz'], $page['props']);
      $this->assertSame('/example-url', $page['url']);
      $this->assertSame('', $page['version']);
    });
  }
}
