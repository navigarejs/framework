<?php

namespace Navigare\Exceptions;

class Exception extends \Exception
{
  public function getBaseCommand(): string
  {
    return collect([
      'pnpm-lock.yaml' => 'pnpm',
      'yarn.lock' => 'yarn',
    ])->reduce(function ($default, $command, $lockFile) {
      if (file_exists(base_path($lockFile))) {
        return $command;
      }

      return $default;
    }, 'npm run');
  }

  protected function getCommand(string $type): string
  {
    $baseCommand = $this->getBaseCommand();
    $command = "${baseCommand} ${type}";

    return $command;
  }
}
