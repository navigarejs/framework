<?php

namespace Navigare\View;

use Illuminate\Contracts\Support\Arrayable;
use Illuminate\Support\Carbon;
use Illuminate\Support\Collection;
use Navigare\Configuration;
use Navigare\Navigare;
use Navigare\Router\RawRoute;

class Fragment implements Arrayable
{
  public function __construct(
    public string $name,
    public Component $component,
    public Collection $properties,
    public ?RawRoute $rawRoute = null,
    public ?Location $location = null,
    public ?Collection $defaults = null,
    public ?Collection $parameters = null,
    public bool $fallback = false
  ) {
    $this->defaults = collect($defaults ?? []);
    $this->parameters = collect($parameters ?? []);
  }

  /**
   * Merge properties.
   *
   * @param Collection $properties
   * @return self
   */
  public function mergeProperties(Collection $properties): self
  {
    $this->properties = $this->properties->merge($properties);

    return $this;
  }

  /**
   * Get the instance as an array.
   *
   * @param bool $ssr
   * @param ?Configuration $configuration
   * @return array
   */
  public function toArray(
    bool $ssr = false,
    ?Configuration $configuration = null
  ) {
    $configuration = $configuration ?? Navigare::getConfiguration();

    return [
      'name' => $this->name,
      'component' => $this->component->toArray($ssr, $configuration),
      'properties' => (object) $this->properties->toArray(),
      /*'defaults' => $this->defaults?->toArray(),
      'parameters' => $this->parameters?->toArray(),
      'rawRoute' => $this->rawRoute?->toArray($ssr, $configuration),
      'location' => $this->location?->toArray(),
      'timestamp' => Carbon::now()->timestamp,*/
    ];
  }
}
