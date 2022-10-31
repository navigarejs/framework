<?php

namespace Navigare;

use Illuminate\Support\Str;

class SelectedProperty
{
  public function __construct(public string $name, public string $fragmentName)
  {
  }

  /**
   * Create instance from string as it's passed via header.
   *
   * @param  string  $property
   * @return SelectedProperty
   */
  public static function fromString(string $property): SelectedProperty
  {
    if (Str::contains($property, '/')) {
      [$fragmentName, $name] = explode('/', $property);

      return new SelectedProperty(fragmentName: $fragmentName, name: $name);
    }

    return new SelectedProperty(fragmentName: 'default', name: $property);
  }
}
