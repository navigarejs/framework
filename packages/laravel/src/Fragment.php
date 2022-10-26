<?php

namespace Navigare;

use Illuminate\Support\Collection;

class Fragment
{
  public function __construct(
    public string $name,
    public string $component,
    public Collection $props
  ) {
  }
}
