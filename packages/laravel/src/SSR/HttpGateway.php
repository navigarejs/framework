<?php

namespace Navigare\SSR;

use Illuminate\Http\Client\ConnectionException;
use Illuminate\Http\Client\RequestException;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;
use Navigare\Configuration;
use Navigare\Exceptions\EnvironmentMismatchException;
use Navigare\Exceptions\ManifestOrViteMissingException;
use Navigare\Exceptions\ServerNotReachableException;
use Navigare\Exceptions\RequestFailedException;
use Navigare\View\Page;
use Ramsey\Uuid\Uuid;

class HttpGateway implements Gateway
{
  /**
   * Dispatch the Navigare page to the Server Side Rendering engine.
   *
   * @param  Request  $request
   * @param  Page  $page
   * @return Response|null
   */
  public function dispatch(Request $request, Page $page): Response|null
  {
    if (!config('navigare.ssr.enabled', false)) {
      return null;
    }

    $configuration = Configuration::read();
    $endpoint = $this->getEndpoint();

    try {
      $id =
        $request->headers->get('X-Request-ID') ??
        Str::substr(Uuid::uuid4(), 0, 8);
      $input = $configuration->shouldUseManifest()
        ? join(DIRECTORY_SEPARATOR, [
          $configuration->getSSRManifest()->getBase(),
          $configuration
            ->getSSRManifest()
            ->resolve($configuration->getSSRInputPath()),
        ])
        : $configuration->getSSRInputPath();

      $response = Http::timeout(config('navigare.ssr.timeout', 1))
        ->post($endpoint, [
          'id' => $id,
          'page' => $page->toArray(true),
          'input' => $input,
          'manifest' => $configuration->shouldUseManifest()
            ? $configuration->getClientManifestPath()
            : null,
          'base' => $configuration->shouldUseManifest()
            ? $configuration->getClientManifest()->getBase()
            : '/',
        ])
        ->throw()
        ->json();
    } catch (RequestException $exception) {
      $status = $exception->response->status();
      $details = json_decode($exception->response->getBody()->getContents());

      switch ($details->code) {
        case 'MANIFEST_OR_VITE_MISSING':
        case 'MANIFEST_AND_VITE_DEFINED':
          throw new EnvironmentMismatchException();

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
