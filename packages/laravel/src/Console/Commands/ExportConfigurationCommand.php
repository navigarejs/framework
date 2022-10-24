<?php

namespace Jaulz\Navigare\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\File;

class ExportConfigurationCommand extends Command
{
  /**
   * The name and signature of the console command.
   *
   * @var string
   */
  public $signature = 'navigare:config {--export= : Path to a file to write the configuration into.}';

  /**
   * The console command description.
   *
   * @var string
   */
  public $description = 'Prints the Navigare configuration.';

  /**
   * Indicates whether the command should be shown in the Artisan command list.
   *
   * @var bool
   */
  public $hidden = true;

  public function handle()
  {
    $config = $this->getConfigurationAsJSON();

    if ($path = $this->option('export')) {
      File::put($path, $config);

      $this->info("Configuration file written to <comment>${path}</comment>.");

      return;
    }

    $this->output->write($config);
  }

  public function getConfigurationAsJson()
  {
    $config = config('navigare');

    return json_encode($config);
  }
}
