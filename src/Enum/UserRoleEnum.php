<?php

declare(strict_types=1);

namespace App\Enum;

enum UserRoleEnum: string
{
    case ROLE_ADMIN = 'ROLE_ADMIN';
    case ROLE_USER = 'ROLE_USER';

    /**
     * @return string[]
     */
    public static function getRoles(): array
    {
        return [self::ROLE_ADMIN->value, self::ROLE_USER->value];
    }
}
