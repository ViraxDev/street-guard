<?php

declare(strict_types=1);

namespace App\Command\User;

use App\Entity\User;
use App\Enum\UserRoleEnum;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputArgument;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Style\SymfonyStyle;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;

#[AsCommand(
    name: 'app:user:create',
    description: 'Create a user with an appropriate role',
)]
final class CreateCommand extends Command
{
    public function __construct(private readonly EntityManagerInterface $entityManager, private readonly UserPasswordHasherInterface $passwordHasher)
    {
        parent::__construct();
    }

    protected function configure(): void
    {
        $this
            ->addArgument('email', InputArgument::REQUIRED, 'user\'s email')
            ->addArgument('password', InputArgument::REQUIRED, 'user\'s PASSWORD')
            ->addArgument('role', InputArgument::OPTIONAL, 'user\'s role', UserRoleEnum::ROLE_USER->value)
        ;
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $io = new SymfonyStyle($input, $output);
        $email = $input->getArgument('email');
        $password = $input->getArgument('password');

        if (!in_array($role = $input->getArgument('role'), $roles = UserRoleEnum::getRoles(), true)) {
            $io->error(sprintf('The role %s should be one of [%s]', $role, implode(',', $roles)));

            return Command::FAILURE;
        }

        $user = (new User())
            ->setEmail($email)
            ->setRoles([$role])
        ;
        $user->setPassword($this->passwordHasher->hashPassword($user, $password));

        $this->entityManager->persist($user);
        $this->entityManager->flush();

        $io->success(sprintf('User %s created successfully with role "%s"', $email, $role));

        return Command::SUCCESS;
    }
}
