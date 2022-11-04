<?php

namespace Navigare\View;

use Illuminate\Contracts\Support\Arrayable;
use Illuminate\Http\Request;

class Location implements Arrayable
{
  public function __construct(
    public string $href,
    public string $host,
    public string $hostname,
    public string $origin,
    public string $pathname,
    public string $port,
    public string $protocol,
    public string $search,
    public string $hash
  ) {
  }

  /**
   * Create a new RawRoute instance from routable instance or string.
   *
   * @param  Request $request
   * @return Location
   */
  public static function fromRequest(Request $request): Location
  {
    return new Location(
      href: $request->fullUrl(),
      host: $request->getHost() . ':' . $request->getPort(),
      hostname: $request->getHost(),
      origin: $request->getScheme() .
        '://' .
        $request->getHost() .
        ':' .
        $request->getPort(),
      pathname: $request->getRequestUri(),
      port: '' . $request->getPort(),
      protocol: $request->getScheme() . ':',
      search: $request->getQueryString()
        ? '?' . $request->getQueryString()
        : '',
      hash: ''
    );
  }

  /**
   * Get the instance as an array.
   *
   * @return array
   */
  public function toArray()
  {
    return [
      'url' => $this->href,
      'href' => $this->href,
      'host' => $this->host,
      'hostname' => $this->hostname,
      'origin' => $this->origin,
      'pathname' => $this->pathname,
      'port' => $this->port,
      'protocol' => $this->protocol,
      'search' => $this->search,
      'hash' => $this->hash,
    ];
  }
}
