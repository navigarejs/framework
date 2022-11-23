<?php

namespace Navigare\View;

use Illuminate\Contracts\Support\Arrayable;
use Illuminate\Support\Carbon;
use Illuminate\Support\Collection;
use Navigare\Configuration;
use Navigare\Router\RawRoute;

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
    ?Collection $fragments = null,
    public ?Page $base = null
  ) {
    $this->fragments = collect($fragments ?? []);
  }

  /**
   * Merge fragments.
   *
   * @param Collection<Fragment> $fragments
   * @return self
   */
  public function mergeFragments(Collection $fragments): self
  {
    $this->fragments = $this->fragments->merge($fragments);

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
    return [
      'fragments' => $this->fragments->map(function ($fragment) use (
        $ssr,
        $configuration
      ) {
        return [$fragment->toArray($ssr, $configuration)];
      }),
      'properties' => (object) $this->properties->toArray(),
      'defaults' => (object) $this->defaults->toArray(),
      'layout' => $this->layout,
      'version' => $this->version,
      'rawRoute' => $this->rawRoute->toArray($ssr),
      'location' => $this->location->toArray(),
      'parameters' => (object) $this->parameters->toArray(),
      'csrf' => $this->csrf,
      'timestamp' => Carbon::now()->timestamp,
      'base' => $this->base?->toArray($ssr, $configuration),
    ];
  }
}
