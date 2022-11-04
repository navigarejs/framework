<?php

namespace Navigare\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Filesystem\Filesystem;
use LogicException;
use Navigare\Configuration;
use Navigare\Router\RawRoutes;
use Throwable;

class CacheCommand extends Command
{
  /**
   * The name and signature of the console command.
   *
   * @var string
   */
  public $signature = 'navigare:cache';

  /**
   * The console command description.
   *
   * @var string
   */
  public $description = 'Create a navigare cache file for faster resolving';

  /**
   * The filesystem instance.
   *
   * @var \Illuminate\Filesystem\Filesystem
   */
  protected $files;

  /**
   * Create a new config cache command instance.
   *
   * @param  \Illuminate\Filesystem\Filesystem  $files
   * @return void
   */
  public function __construct(Filesystem $files)
  {
    parent::__construct();

    $this->files = $files;
  }

  /**
   * Execute the console command.
   *
   * @return int
   */
  public function handle()
  {
    $this->callSilent('navigare:clear');

    $configuration = Configuration::read();
    $rawRoutes = RawRoutes::getAll($configuration);

    $cachePath = base_path('bootstrap/cache/navigare.php');

    $this->files->put($cachePath, serialize($rawRoutes));

    try {
      unserialize(file_get_contents($cachePath));
    } catch (Throwable $exception) {
      $this->files->delete($cachePath);

      throw new LogicException(
        'Your navigare files are not serializable.',
        0,
        $exception
      );
    }

    $this->components->info('Navigare cached successfully.');
  }
}
