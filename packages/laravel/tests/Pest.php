<?php

/*
|--------------------------------------------------------------------------
| Test Case
|--------------------------------------------------------------------------
|
| The closure you provide to your test functions is always bound to a specific PHPUnit test
| case class. By default, that class is "PHPUnit\Framework\TestCase". Of course, you may
| need to change it using the "uses()" function to bind a different classes or traits.
|
*/

use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;
use Jaulz\Navigare\Tests\TestCase;
use Pest\TestSuite;

uses(Jaulz\Navigare\Tests\TestCase::class)->in('Unit');
uses(Jaulz\Navigare\Tests\TestCase::class)->in('Features');

/*
|--------------------------------------------------------------------------
| Helpers
|--------------------------------------------------------------------------
*/

/**
 * Gets the current test case.
 */
function this(): TestCase
{
  return TestSuite::getInstance()->test;
}

/**
 * Sets the environment.
 */
function set_env(string $env): void
{
  app()->bind('env', fn() => $env);
}

/**
 * Gets a path relative to the fixtures.
 */
function fixtures_path(string $path = ''): string
{
  $path = (string) Str::of($path)->start('/');

  return realpath(__DIR__ . "/Fixtures/${path}");
}

/**
 * Overrides the manifests' base paths.
 */
function set_fixtures_path(string $path = '')
{
  $dir = fixtures_path($path);
  app()->bind('path.public', fn() => $dir . '/public');
  app()->setBasePath($dir);
}

/**
 * Mocks the dev server.
 */
function with_dev_server(string $path, bool $reacheable = true)
{
  if (!$reacheable) {
    return Http::fake(fn() => Http::response(status: 503));
  }

  return Http::fake([
    $path => Http::response(status: 200),
    '*' => Http::response(status: 404),
  ]);
}

/**
 * Creates a sandbox in which the base path is updated.
 */
function sandbox(
  callable $callback,
  string $base = __DIR__,
  bool $preserve = false
): void {
  $sandbox_base = $base . '/__sandbox__/';
  $sandbox_path = $sandbox_base . Str::random();
  $initial_base_path = base_path();

  app()->setBasePath($sandbox_path);
  File::makeDirectory($sandbox_path, recursive: true);
  $callback($sandbox_path);
  app()->setBasePath($initial_base_path);

  if (!$preserve) {
    File::deleteDirectory($sandbox_base);
  }
}
