<?php

namespace Navigare\SSR;

use Illuminate\Http\Client\ConnectionException;
use Illuminate\Http\Client\RequestException;
use Illuminate\Support\Facades\Http;
use Navigare\Configuration;
use Navigare\Exceptions\ManifestOrViteMissingException;
use Navigare\Exceptions\ServerNotReachableException;
use Navigare\Exceptions\RequestFailedException;
use Navigare\View\Page;

class HttpGateway implements Gateway
{
  /**
   * Dispatch the Navigare page to the Server Side Rendering engine.
   *
   * @param  Page  $page
   * @return Response|null
   */
  public function dispatch(Page $page): Response|null
  {
    if (!config('navigare.ssr.enabled', false)) {
      return null;
    }

    $configuration = Configuration::read();
    $endpoint = $this->getEndpoint();

    try {
      $response = Http::timeout(config('navigare.ssr.timeout', 1))
        ->post($endpoint, [
          'page' => $page->toArray(true),
          'input' => $configuration->getSSRInputPath(),
          'manifest' => $configuration->shouldUseManifest()
            ? $configuration->getSSRManifestPath()
            : null,
        ])
        ->throw()
        ->json();
    } catch (RequestException $exception) {
      $status = $exception->response->status();
      $details = json_decode($exception->response->getBody()->getContents());

      switch ($details->code) {
        case 'MANIFEST_OR_VITE_MISSING':
          throw new ManifestOrViteMissingException();

        default:
          throw new RequestFailedException(
            status: $status,
            message: $details->message,
            code: $details->code
          );
      }
    } catch (ConnectionException $exception) {
      throw new ServerNotReachableException($endpoint, $exception);
    } catch (\Exception $exception) {
      throw new RequestFailedException(message: $exception->getMessage());
    }

    if (is_null($response)) {
      return null;
    }

    return new Response(
      id: $response['id'],
      htmlAttributes: $response['htmlAttributes'],
      headTags: $response['headTags'],
      bodyAttributes: $response['bodyAttributes'],
      bodyTags: $response['bodyTags'],
      appHTML: $response['appHTML']
    );
  }
  /**
   * Get endpoint of Navigare server.
   *
   * @return string
   */
  private function getEndpoint(): string
  {
    $protocol = config('navigare.ssr.protocol', 'http');
    $host = config('navigare.ssr.host', '127.0.0.1');
    $port = config('navigare.ssr.port', 13715);
    $path = config('navigare.ssr.path', 'render');

    return $protocol . '://' . $host . ':' . $port . '/' . $path;
  }
}
