<?php

namespace App\Controller;

use App\Dto\PartnerContactRequest;
use App\Service\Mail\MailServiceInterface;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Attribute\MapRequestPayload;
use Symfony\Component\Routing\Attribute\Route;

final class PartnershipController extends AbstractController
{
    #[Route('/partnership/contact', name: 'partnership_submit', methods: ['POST'])]
    public function contact(
        MailServiceInterface $mailService,
        Request $request,
        #[MapRequestPayload] PartnerContactRequest $contactRequest,
    ): Response {
        try {
            $mailService->sendPartnershipInquiry($contactRequest);

            return $this->handleSuccess(
                $request,
                'Your message has been sent successfully.',
                'app_home'
            );
        } catch (\Exception $e) {
            return $this->handleError(
                $request,
                'An error occurred while sending your message.',
                'app_home'
            );
        }
    }
}
