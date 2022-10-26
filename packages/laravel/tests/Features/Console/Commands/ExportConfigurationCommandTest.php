<?php

use Illuminate\Support\Facades\File;
use Navigare\Console\Commands\ExportConfigurationCommand;
use function Spatie\Snapshots\assertMatchesSnapshot;

it('exposes the configuration contents to the command line', function () {
  $output = app(ExportConfigurationCommand::class)->getConfigurationAsJson();

  this()
    ->artisan('navigare:config')
    ->expectsOutput($output)
    ->assertExitCode(0);

  assertMatchesSnapshot($output);
});

it(
  'writes the configuration contents to the file system if requested',
  function () {
    File::partialMock()
      ->shouldReceive('put')
      ->withArgs([
        'vite.config.json',
        app(ExportConfigurationCommand::class)->getConfigurationAsJson(),
      ]);

    this()
      ->artisan('navigare:config --export=vite.config.json')
      ->expectsOutput('Configuration file written to vite.config.json.')
      ->assertExitCode(0);
  }
);
