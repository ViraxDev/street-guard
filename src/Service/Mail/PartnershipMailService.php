<?php

namespace App\Service\Mail;

use App\Dto\PartnerContactRequest;
use Symfony\Component\DependencyInjection\Attribute\Autowire;
use Symfony\Component\Mailer\MailerInterface;
use Symfony\Component\Mime\Email;
use Twig\Environment;

final readonly class PartnershipMailService implements PartnershipMailServiceInterface
{
    public function __construct(
        private MailerInterface $mailer,
        #[Autowire(env: 'ADMIN_EMAIL')]
        private string $recipientEmail,
        #[Autowire(env: 'NO_REPLY_EMAIL')]
        private string $senderEmail,
        private Environment $twig,
    ) {
    }

    public function sendPartnershipInquiry(PartnerContactRequest $request): void
    {
        $email = (new Email())
            ->from($this->senderEmail)
            ->replyTo($request->email)
            ->to($this->recipientEmail)
            ->subject(sprintf('New Partnership Inquiry: %s', $request->name))
            ->html($this->renderPartnershipEmail($request));

        $this->mailer->send($email);
    }

    public function renderPartnershipEmail(PartnerContactRequest $request): string
    {
        return $this->twig->render('emails/partnership_contact.html.twig', [
            'data' => [
                'name' => $request->name,
                'organization' => $request->organization,
                'email' => $request->email,
                'phone' => $request->phone,
                'topic' => $request->topic,
                'message' => $request->message,
            ],
        ]);
    }
}
