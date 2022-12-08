<?php

namespace Navigare\View;

use Illuminate\Support\Str;
use Navigare\View\Fragment;

class Property
{
  public function __construct(
    public string $name,
    public ?string $fragmentName = null,
    public bool $negated = false
  ) {
  }

  /**
   * Checks if the given property matches the selected property.
   *
   * @param  ?string  $propertyName
   * @param  ?Fragment  $fragment
   * @return bool
   */
  public function matches(
    string $propertyName,
    ?Fragment $fragment = null
  ): bool {
    if ($fragment) {
      if (!$this->fragmentName && $this->name === '*') {
        return true;
      }

      if ($fragment->name !== $this->fragmentName) {
        return false;
      }
    }

    if ($this->name === '*') {
      return true;
    }

    return $propertyName === $this->name;
  }

  /**
   * Create instance from string as it's passed via header.
   *
   * @param  string  $path
   * @return Property
   */
  public static function fromString(string $path): Property
  {
    $negated = Str::startsWith($path, '!');
    $trimmedPath = Str::after($path, '!');

    if (Str::contains($trimmedPath, '/')) {
      [$fragmentName, $name] = explode('/', $trimmedPath);

      return new Property(
        fragmentName: $fragmentName,
        name: $name,
        negated: $negated
      );
    }

    return new Property(name: $trimmedPath, negated: $negated);
  }
}
