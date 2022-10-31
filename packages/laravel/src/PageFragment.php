<?php

namespace Navigare;

use Illuminate\Contracts\Support\Arrayable;
use Illuminate\Routing\Route;
use Illuminate\Support\Carbon;
use Illuminate\Support\Collection;

class PageFragment implements Arrayable
{
  public function __construct(
    public string $name,
    public string $component,
    public Collection $properties,
    public ?RawRoute $rawRoute = null,
    public ?Location $location = null,
    public ?Collection $defaults = null,
    public ?Collection $parameters = null
  ) {
    $this->defaults = collect($defaults ?? []);
    $this->parameters = collect($parameters ?? []);
  }

  /**
   * Get the instance as an array.
   *
   * @return array
   */
  public function toArray()
  {
    return [
      'name' => $this->name,
      'component' => $this->component,
      'properties' => $this->properties->toArray(),
      'defaults' => $this->defaults->toArray(),
      'parameters' => $this->parameters->toArray(),
      'rawRoute' => $this->rawRoute->toArray(),
      'location' => $this->location->toArray(),
      'timestamp' => Carbon::now()->timestamp,
    ];
  }
}
