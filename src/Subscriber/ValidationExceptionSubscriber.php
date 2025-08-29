<?php

namespace App\Subscriber;

use Symfony\Component\EventDispatcher\EventSubscriberInterface;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Event\ExceptionEvent;
use Symfony\Component\HttpKernel\Exception\UnprocessableEntityHttpException;
use Symfony\Component\Validator\ConstraintViolation;
use Symfony\Component\Validator\Exception\ValidationFailedException;

final readonly class ValidationExceptionSubscriber implements EventSubscriberInterface
{
    public static function getSubscribedEvents(): array
    {
        return [
            ExceptionEvent::class => 'onExceptionEvent',
        ];
    }

    public function onExceptionEvent(ExceptionEvent $event): void
    {
        $exception = $event->getThrowable();

        if (!$exception instanceof UnprocessableEntityHttpException) {
            return;
        }

        $validationException = $exception->getPrevious();
        if (!$validationException instanceof ValidationFailedException) {
            return;
        }

        $response = new JsonResponse(array_map(fn (ConstraintViolation $violation) => [
            $violation->getPropertyPath() => $violation->getMessage(),
        ], iterator_to_array($validationException->getViolations())), Response::HTTP_BAD_REQUEST);

        $event->setResponse($response);
    }
}
