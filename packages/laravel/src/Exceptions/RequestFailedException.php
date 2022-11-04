<?php

namespace Navigare\Exceptions;

final class RequestFailedException extends Exception
{
  public function __construct(
    string $message,
    ?string $code = null,
    protected ?string $status = null
  ) {
    $this->code = $code;
    $this->message = 'The Navigare server returned an error: ' . $message;
  }
}
