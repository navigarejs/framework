<?php

namespace Jaulz\Navigare\Ssr;

use Exception;
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

    $url = Config::get('navigare.ssr.url', 'http://127.0.0.1:13714/render');

    try {
      $response = Http::post($url, $page)
        ->throw()
        ->json();
    } catch (Exception $e) {
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
