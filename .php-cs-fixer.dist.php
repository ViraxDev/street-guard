<?php

$finder = (new PhpCsFixer\Finder())
    ->exclude(['vendor'])
    ->notPath('Kernel.php')
    ->notPath('bootstrap.php')
    ->in(__DIR__.'/src')
    ->in(__DIR__.'/tests')
;

return (new PhpCsFixer\Config())
    ->setRules([
        '@Symfony' => true,
    ])
    ->setFinder($finder)
;
