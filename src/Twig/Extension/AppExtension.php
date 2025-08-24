<?php

declare(strict_types=1);

namespace App\Twig\Extension;

use App\Twig\Runtime\User\ExtensionRuntime;
use Twig\Extension\AbstractExtension;
use Twig\TwigFunction;

final class AppExtension extends AbstractExtension
{
    public function getFunctions(): array
    {
        return [
            new TwigFunction('user_picture', [ExtensionRuntime::class, 'getUserPicture']),
        ];
    }
}
