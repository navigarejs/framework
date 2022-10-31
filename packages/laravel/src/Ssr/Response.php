<?php

namespace Navigare\Ssr;

class Response
{
  /**
   * Prepare the Navigare Server Side Rendering (SSR) response.
   *
   * @param  string  $id
   * @param  string  $htmlAttrs
   * @param  string  $headTags
   * @param  string  $bodyAttrs
   * @param  string  $bodyTags
   * @param  string  $appHTML
   */
  public function __construct(
    public string $id,
    public string $htmlAttrs,
    public string $headTags,
    public string $bodyAttrs,
    public string $bodyTags,
    public string $appHTML
  ) {
  }
}
