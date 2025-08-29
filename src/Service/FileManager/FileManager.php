<?php

declare(strict_types=1);

namespace App\Service\FileManager;

use Symfony\Component\DependencyInjection\Attribute\Autowire;
use Symfony\Component\Filesystem\Filesystem;
use Symfony\Component\HttpFoundation\File\UploadedFile;

final readonly class FileManager implements FileManagerInterface
{
    private Filesystem $filesystem;

    public function __construct(
        #[Autowire(param: 'upload_directory')]
        private string $uploadDirectory,
        #[Autowire('%kernel.project_dir%')]
        private string $projectDir,
    ) {
        $this->filesystem = new Filesystem();
    }

    public function upload(UploadedFile $file): string
    {
        $originalFilename = pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME);
        $fileName = $originalFilename.'-'.uniqid().'.'.$file->guessExtension();

        $file->move($this->uploadDirectory, $fileName);

        return $fileName;
    }

    public function getUploadDir(): string
    {
        return $this->uploadDirectory;
    }

    public function removeFile(string $file): void
    {
        $this->filesystem->remove($this->uploadDirectory.'/'.$file);
    }

    public function getProjectDir(): string
    {
        return $this->projectDir;
    }
}
