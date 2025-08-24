<?php

declare(strict_types=1);

namespace App\Twig\Runtime\User;

use App\Service\FileManager\FileManagerInterface;
use Symfony\Bridge\Twig\Extension\AssetExtension;
use Symfony\Bundle\SecurityBundle\Security;
use Symfony\Component\DependencyInjection\Attribute\Autowire;
use Twig\Extension\RuntimeExtensionInterface;

final readonly class ExtensionRuntime implements RuntimeExtensionInterface
{
    public function __construct(
        private Security $security,
        #[Autowire(service: 'twig.extension.assets')]
        private AssetExtension $assetExtension,
        private FileManagerInterface $fileManager,
    ) {
    }

    public function getUserPicture(string $type): string
    {
        $user = $this->security->getUser();
        $defaultPicture = match ($type) {
            'pictureProfile' => 'theme/img/team/avatar.png',
            'coverPictureProfile' => 'theme/img/generic/4.jpg',
            default => throw new \LogicException(sprintf('Unknown %s type', $type)),
        };

        $getter = sprintf('get%s', ucfirst($type));

        // User updated his picture
        if (method_exists($user, $getter) && !empty($value = $user->{$getter}())) {
            return sprintf('%s/%s', $this->fileManager->getUploadDir(), $value);
        }

        return $this->assetExtension->getAssetUrl($defaultPicture);
    }
}
