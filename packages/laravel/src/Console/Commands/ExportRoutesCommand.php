<?php

namespace Jaulz\Navigare\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\File;
use Jaulz\Navigare\Routes;

class ExportRoutesCommand extends Command
{
  /**
   * The name and signature of the console command.
   *
   * @var string
   */
  public $signature = 'navigare:routes {--name= : Filter routes by name.} {--export= : Path to a file to write the routes into.}';

  /**
   * The console command description.
   *
   * @var string
   */
  public $description = 'Prints the Navigare routes.';

  /**
   * Indicates whether the command should be shown in the Artisan command list.
   *
   * @var bool
   */
  public $hidden = true;

  public function handle()
  {
    $routes = $this->getRoutesAsJSON($this->option('name'));

    if ($path = $this->option('export')) {
      File::put($path, $routes);

      $this->info("Route file written to <comment>${path}</comment>.");

      return;
    }

    $this->output->write($routes);
  }

  public function getRoutesAsJSON(?string $name = null)
  {
    if ($name) {
      return json_encode([Routes::getRoute($name)]);
    }

    return json_encode(Routes::getRoutes());
  }
}
