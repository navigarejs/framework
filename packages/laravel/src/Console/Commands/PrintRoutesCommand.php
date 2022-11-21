<?php

namespace Navigare\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\File;
use Navigare\Configuration;
use Navigare\Router\RawRoutes;

class PrintRoutesCommand extends Command
{
  /**
   * The name and signature of the console command.
   *
   * @var string
   */
  public $signature = 'navigare:routes {--ssr : Resolve paths for SSR.} {--export= : Path to a file to write the routes into.}';

  /**
   * The console command description.
   *
   * @var string
   */
  public $description = 'Prints the Navigare routes';

  /**
   * Indicates whether the command should be shown in the Artisan command list.
   *
   * @var bool
   */
  public $hidden = true;

  /**
   * Execute the console command.
   *
   * @return int
   */
  public function handle()
  {
    $routes = $this->getRoutesAsJSON();

    if ($path = $this->option('export')) {
      File::put($path, $routes);

      $this->info("Route file written to <comment>${path}</comment>.");

      return self::SUCCESS;
    }

    $this->output->write($routes);

    return self::SUCCESS;
  }

  public function getRoutesAsJSON()
  {
    $configuration = Configuration::read();
    $configuration->useManifest(false);

    $rawRoutes = RawRoutes::getAll($configuration);

    return json_encode(
      $rawRoutes->map(function ($rawRoute) use ($configuration) {
        return $rawRoute->toArray($this->option('ssr'), $configuration);
      })
    );
  }
}
