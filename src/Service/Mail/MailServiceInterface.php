<?php

namespace App\Service\Mail;

use App\Dto\PartnerContactRequest;

interface MailServiceInterface
{
    public function sendPartnershipInquiry(PartnerContactRequest $request): void;
}
