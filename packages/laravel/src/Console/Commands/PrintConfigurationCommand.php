<?php

namespace Navigare\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\File;

class PrintConfigurationCommand extends Command
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
  public $description = 'Prints the Navigare configuration';

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
    $config = $this->getConfigurationAsJSON();

    if ($path = $this->option('export')) {
      File::put($path, $config);

      $this->info("Configuration file written to <comment>${path}</comment>.");

      return self::SUCCESS;
    }

    $this->output->write($config);

    return self::SUCCESS;
  }

  public function getConfigurationAsJson()
  {
    $config = config('navigare');

    return json_encode($config);
  }
}
