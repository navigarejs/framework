<?php

namespace Navigare;

use Illuminate\Contracts\Support\Arrayable;
use Illuminate\Support\Carbon;
use Illuminate\Support\Collection;

class Page implements Arrayable
{
  public Collection $fragments;

  public function __construct(
    public Collection $properties,
    public ?string $layout,
    public string $version,
    public string $csrf,
    public RawRoute $rawRoute,
    public Location $location,
    public Collection $defaults,
    public Collection $parameters,
    ?Collection $fragments = null
  ) {
    $this->fragments = collect($fragments ?? []);
  }

  /**
   * Merge fragments.
   *
   * @param Collection<PageFragment> $fragments
   * @return self
   */
  public function mergeFragments(Collection $fragments): self
  {
    $this->fragments->merge($fragments);

    return $this;
  }

  /**
   * Get the instance as an array.
   *
   * @return array
   */
  public function toArray()
  {
    return [
      'fragments' => $this->fragments->toArray(),
      'properties' => $this->properties->toArray(),
      'defaults' => $this->defaults->toArray(),
      'layout' => $this->layout,
      'version' => $this->version,
      'rawRoute' => $this->rawRoute->toArray(),
      'location' => $this->location->toArray(),
      'parameters' => $this->parameters->toArray(),
      'csrf' => $this->csrf,
      'timestamp' => Carbon::now()->timestamp,
    ];
  }
}
