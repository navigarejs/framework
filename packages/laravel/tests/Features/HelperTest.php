<?php

namespace Navigare\Tests;

use Navigare\Navigare;
use Navigare\Response;
use Navigare\ResponseFactory;

class HelperTest extends TestCase
{
  public function test_the_helper_function_returns_an_instance_of_the_response_factory(): void
  {
    $this->assertInstanceOf(ResponseFactory::class, navigare());
  }

  public function test_the_helper_function_returns_a_response_instance(): void
  {
    $this->assertInstanceOf(
      Response::class,
      navigare('User/Edit', ['user' => ['name' => 'Julian']])
    );
  }

  public function test_the_instance_is_the_same_as_the_facade_instance(): void
  {
    Navigare::share('key', 'value');
    $this->assertEquals('value', navigare()->getShared('key'));
  }
}
