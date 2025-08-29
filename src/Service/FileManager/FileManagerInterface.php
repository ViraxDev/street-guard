<?php

declare(strict_types=1);

namespace App\Service\FileManager;

use Symfony\Component\HttpFoundation\File\UploadedFile;

interface FileManagerInterface
{
    public function upload(UploadedFile $file): string;

    public function getUploadDir(): string;

    public function getProjectDir(): string;

    public function removeFile(string $file): void;
}
