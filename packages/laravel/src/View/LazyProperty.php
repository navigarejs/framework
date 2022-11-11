<?php

namespace Navigare\View;

use Illuminate\Support\Facades\App;

class LazyProperty
{
  protected $callback;

  public function __construct(callable $callback)
  {
    $this->callback = $callback;
  }

  public function __invoke()
  {
    return App::call($this->callback);
  }
}
