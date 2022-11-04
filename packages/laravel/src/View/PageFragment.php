<?php

namespace Navigare\View;

use Illuminate\Contracts\Support\Arrayable;
use Illuminate\Support\Carbon;
use Illuminate\Support\Collection;
use Navigare\Router\RawRoute;

class PageFragment implements Arrayable
{
  public function __construct(
    public string $name,
    public PageComponent $component,
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
   * @param bool $ssr
   * @return array
   */
  public function toArray(bool $ssr = false)
  {
    return [
      'name' => $this->name,
      'component' => $this->component->toArray($ssr),
      'properties' => $this->properties->toArray(),
      'defaults' => $this->defaults->toArray(),
      'parameters' => $this->parameters->toArray(),
      'rawRoute' => $this->rawRoute->toArray($ssr),
      'location' => $this->location->toArray(),
      'timestamp' => Carbon::now()->timestamp,
    ];
  }
}
