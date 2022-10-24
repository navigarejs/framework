<?php

namespace Jaulz\Navigare\Console\Commands;

use Illuminate\Console\GeneratorCommand;
use Symfony\Component\Console\Input\InputOption;

class CreateMiddlewareCommand extends GeneratorCommand
{
  /**
   * The console command name.
   *
   * @var string
   */
  protected $name = 'navigare:middleware';

  /**
   * The console command description.
   *
   * @var string
   */
  protected $description = 'Create a new Navigare middleware';

  /**
   * The type of class being generated.
   *
   * @var string
   */
  protected $type = 'Middleware';

  /**
   * Get the stub file for the generator.
   *
   * @return string
   */
  protected function getStub(): string
  {
    return __DIR__ . '/../../../stubs/middleware.stub';
  }

  /**
   * Get the default namespace for the class.
   *
   * @param  string  $rootNamespace
   * @return string
   */
  protected function getDefaultNamespace($rootNamespace): string
  {
    return $rootNamespace . '\Http\Middleware';
  }

  /**
   * Get the console command arguments.
   *
   * @return array
   */
  protected function getArguments(): array
  {
    return [
      [
        'name',
        InputOption::VALUE_REQUIRED,
        'Name of the Middleware that should be created',
        'HandleNavigareRequests',
      ],
    ];
  }

  /**
   * Get the console command options.
   *
   * @return array
   */
  protected function getOptions(): array
  {
    return [
      [
        'force',
        null,
        InputOption::VALUE_NONE,
        'Create the class even if the Middleware already exists',
      ],
    ];
  }
}
