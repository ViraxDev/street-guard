<?php

declare(strict_types=1);

namespace App\Message;

use App\Entity\User;
use Symfony\Component\Security\Core\User\UserInterface;

final readonly class UserPictureUpdateMessage
{
    public function __construct(
        public User|UserInterface $user,
    ) {
    }
}
