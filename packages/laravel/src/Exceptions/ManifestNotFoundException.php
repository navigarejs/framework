<?php

namespace Navigare\Exceptions;

use Spatie\Ignition\Contracts\BaseSolution;
use Spatie\Ignition\Contracts\ProvidesSolution;
use Spatie\Ignition\Contracts\Solution;

final class ManifestNotFoundException extends Exception implements
  ProvidesSolution
{
  protected array $links = [];

  public function __construct(protected string $manifestPath)
  {
    $this->message = 'The manifest could not be found.';
  }

  public function getSolution(): Solution
  {
    return app()->environment('local')
      ? $this->getLocalSolution()
      : $this->getProductionSolution();
  }

  protected function getLocalSolution(): Solution
  {
    return BaseSolution::create('Start the development server')
      ->setSolutionDescription(
        "Run `{$this->getCommand(
          'dev'
        )}` in your terminal and refresh the page."
      )
      ->setDocumentationLinks($this->links);
  }

  protected function getProductionSolution(): Solution
  {
    return BaseSolution::create('Build the production assets')
      ->setSolutionDescription(
        "Run `{$this->getCommand(
          'build'
        )}` in your terminal and refresh the page."
      )
      ->setDocumentationLinks($this->links);
  }
}
