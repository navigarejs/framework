<?php

namespace Navigare\Testing\Concerns;

use Illuminate\Support\Arr;
use InvalidArgumentException;
use PHPUnit\Framework\Assert as PHPUnit;

trait PageObject
{
  public function component(string $value = null, $shouldExist = null): self
  {
    PHPUnit::assertSame(
      $value,
      $this->component,
      'Unexpected Navigare page component.'
    );

    if (
      $shouldExist ||
      (is_null($shouldExist) &&
        config('navigare.testing.ensure_components_exist', true))
    ) {
      try {
        app('navigare.components.finder')->find($value);
      } catch (InvalidArgumentException $exception) {
        PHPUnit::fail(
          sprintf('Navigare page component file [%s] does not exist.', $value)
        );
      }
    }

    return $this;
  }

  protected function prop(string $key = null)
  {
    return Arr::get($this->props, $key);
  }

  public function url(string $value): self
  {
    PHPUnit::assertSame($value, $this->url, 'Unexpected Navigare page url.');

    return $this;
  }

  public function version(string $value): self
  {
    PHPUnit::assertSame(
      $value,
      $this->version,
      'Unexpected Navigare asset version.'
    );

    return $this;
  }

  public function toArray(): array
  {
    return [
      'component' => $this->component,
      'props' => $this->props,
      'url' => $this->url,
      'version' => $this->version,
    ];
  }
}
