<?php

namespace Navigare\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Filesystem\Filesystem;
use Illuminate\Support\Facades\File;

class ClearCommand extends Command
{
  /**
   * The name and signature of the console command.
   *
   * @var string
   */
  public $signature = 'navigare:clear';

  /**
   * The console command description.
   *
   * @var string
   */
  public $description = 'Remove the navigare cache file';

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
    $configurationPath = base_path('bootstrap/cache/navigare.php');

    $this->files->delete($configurationPath);

    $this->components->info('Navigare cache cleared successfully.');
  }
}
