<?php

namespace Navigare\SSR;

class Response
{
  public function __construct(
    public string $id,
    public string $htmlAttributes,
    public string $headTags,
    public string $bodyAttributes,
    public string $bodyTags,
    public string $appHTML
  ) {
  }
}
