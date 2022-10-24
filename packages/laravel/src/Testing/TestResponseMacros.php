<?php

namespace Jaulz\Navigare\Testing;

use Closure;
use Illuminate\Testing\Fluent\AssertableJson;

class TestResponseMacros
{
  public function assertNavigare()
  {
    return function (Closure $callback = null) {
      if (class_exists(AssertableJson::class)) {
        $assert = AssertableNavigare::fromTestResponse($this);
      } else {
        $assert = Assert::fromTestResponse($this);
      }

      if (is_null($callback)) {
        return $this;
      }

      $callback($assert);

      return $this;
    };
  }

  public function navigarePage()
  {
    return function () {
      if (class_exists(AssertableJson::class)) {
        return AssertableNavigare::fromTestResponse($this)->toArray();
      }

      return Assert::fromTestResponse($this)->toArray();
    };
  }
}
