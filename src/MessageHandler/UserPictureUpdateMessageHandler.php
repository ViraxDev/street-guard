<?php

declare(strict_types=1);

namespace App\MessageHandler;

use App\Message\UserPictureUpdateMessage;
use App\Service\FileManager\FileManagerInterface;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpFoundation\File\UploadedFile;
use Symfony\Component\HttpFoundation\RequestStack;
use Symfony\Component\Messenger\Attribute\AsMessageHandler;

#[AsMessageHandler]
final readonly class UserPictureUpdateMessageHandler
{
    public function __construct(
        private RequestStack $requestStack,
        private FileManagerInterface $fileManager,
        private EntityManagerInterface $entityManager,
    ) {
    }

    public function __invoke(UserPictureUpdateMessage $message): bool
    {
        $request = $this->requestStack->getCurrentRequest();
        $user = $message->user;
        $setter = 'set'.ucfirst($request->get('property'));
        $getter = 'get'.ucfirst($request->get('property'));

        if (
            $request->isXmlHttpRequest()
            // @var UploadedFile $file
            && ($file = $request->files->get('photo')) instanceof UploadedFile
            && method_exists($user, $setter)
        ) {
            $oldFilename = $user->{$getter}();
            $filename = $this->fileManager->upload($file);

            $user->{$setter}($filename);
            $this->entityManager->flush();

            if ($oldFilename) {
                $this->fileManager->removeFile($oldFilename);
            }

            return true;
        }

        return false;
    }
}
