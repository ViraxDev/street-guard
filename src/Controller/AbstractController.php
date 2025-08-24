<?php

declare(strict_types=1);

namespace App\Controller;

use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController as SymfonyAbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\RequestStack;
use Symfony\Component\Messenger\HandleTrait;
use Symfony\Component\Messenger\MessageBusInterface;
use Symfony\Contracts\Translation\TranslatorInterface;

abstract class AbstractController extends SymfonyAbstractController
{
    use HandleTrait;
    protected Request $request;

    /** @phpstan-ignore-next-line */
    private MessageBusInterface $messageBus;

    public function __construct(MessageBusInterface $messageBus, protected EntityManagerInterface $entityManager, private readonly RequestStack $requestStack, protected TranslatorInterface $translator)
    {
        $this->messageBus = $messageBus;
        $this->request = $this->requestStack->getCurrentRequest();
    }

    protected function handleMessage(object $message): mixed
    {
        return $this->handle($message);
    }
}
