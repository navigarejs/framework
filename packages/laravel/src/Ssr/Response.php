<?php

namespace Navigare\Ssr;

class Response
{
  public string $id;

  public string $htmlAttrs;

  public string $headTags;

  public string $bodyAttrs;

  public string $bodyTags;

  public string $appHTML;

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
    string $id,
    string $htmlAttrs,
    string $headTags,
    string $bodyAttrs,
    string $bodyTags,
    string $appHTML
  ) {
    $this->id = $id;
    $this->htmlAttrs = $htmlAttrs;
    $this->headTags = $headTags;
    $this->bodyAttrs = $bodyAttrs;
    $this->bodyTags = $bodyTags;
    $this->appHTML = $appHTML;
  }
}
