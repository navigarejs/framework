<?php

namespace Navigare\Ssr;

use Exception;
use GuzzleHttp\Exception\RequestException;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\Http;

class HttpGateway implements Gateway
{
  /**
   * Dispatch the Navigare page to the Server Side Rendering engine.
   *
   * @param  Collection  $page
   * @return Response|null
   */
  public function dispatch(Collection $page): ?Response
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
        ->post($protocol . '://' . $host . ':' . $port . '/' . $path, $page)
        ->throw()
        ->json();
    } catch (RequestException $e) {
      dd($e->getResponse());
      return null;
    }

    if (is_null($response)) {
      return null;
    }

    return new Response(
      $response['id'],
      $response['htmlAttrs'],
      $response['headTags'],
      $response['bodyAttrs'],
      $response['bodyTags'],
      $response['appHTML']
    );
  }
}
