<?php

namespace Navigare\Ssr;

use Exception;
use GuzzleHttp\Exception\RequestException;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\Http;
use Navigare\Page;

class HttpGateway implements Gateway
{
  /**
   * Dispatch the Navigare page to the Server Side Rendering engine.
   *
   * @param  Page  $page
   * @return Response|null
   */
  public function dispatch(Page $page): ?Response
  {
    if (!Config::get('navigare.ssr.enabled', false)) {
      return null;
    }

    $protocol = Config::get('navigare.ssr.protocol', 'http');
    $host = Config::get('navigare.ssr.host', '127.0.0.1');
    $port = Config::get('navigare.ssr.port', 13714);
    $path = Config::get('navigare.ssr.path', '');
    $timeout = Config::get('navigare.ssr.timeout', 5);

    try {
      $response = Http::timeout($timeout)
        ->post(
          $protocol . '://' . $host . ':' . $port . '/' . $path,
          $page->toArray()
        )
        ->throw()
        ->json();
    } catch (RequestException $e) {
      return null;
    }

    if (is_null($response)) {
      return null;
    }

    return new Response(
      id: $response['id'],
      htmlAttrs: $response['htmlAttrs'],
      headTags: $response['headTags'],
      bodyAttrs: $response['bodyAttrs'],
      bodyTags: $response['bodyTags'],
      appHTML: $response['appHTML']
    );
  }
}
