<?php

use Illuminate\Support\Facades\File;
use Navigare\Console\Commands\ExportRoutesCommand;
use function Spatie\Snapshots\assertMatchesSnapshot;

it('exposes the routes to the command line', function () {
  $router = app('router');
  $router
    ->get('posts/{post}/comments', $this->noop())
    ->name('postComments.index');

  $output = app(ExportRoutesCommand::class)->getRoutesAsJSON();

  this()
    ->artisan('navigare:routes')
    ->expectsOutput($output)
    ->assertExitCode(0);

  assertMatchesSnapshot($output);
});

it('exposes the filtered route to the command line', function () {
  $router = app('router');
  $router
    ->get('posts/{post}/comments', $this->noop())
    ->name('postComments.index');
  $router
    ->get('articles/{post}/comments', $this->noop())
    ->name('articlesComments.index');

  $name = 'articlesComments.index';
  $output = app(ExportRoutesCommand::class)->getRoutesAsJSON($name);

  this()
    ->artisan("navigare:routes --name $name")
    ->expectsOutput($output)
    ->assertExitCode(0);

  assertMatchesSnapshot($output);
});

it('writes the routes to the file system if requested', function () {
  File::partialMock()
    ->shouldReceive('put')
    ->withArgs([
      'routes.json',
      app(ExportRoutesCommand::class)->getRoutesAsJSON(),
    ]);

  this()
    ->artisan('navigare:routes --export=routes.json')
    ->expectsOutput('Route file written to routes.json.')
    ->assertExitCode(0);
});
