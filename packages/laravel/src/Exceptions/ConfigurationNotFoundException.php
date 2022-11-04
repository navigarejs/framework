<?php

namespace Navigare\Exceptions;

final class ConfigurationNotFoundException extends Exception
{
  public function __construct(protected string $name)
  {
    $this->message = 'The configuration "' . $name . '" could not be found.';
  }
}
