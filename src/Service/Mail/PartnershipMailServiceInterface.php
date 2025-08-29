<?php

namespace App\Service\Mail;

use App\Dto\PartnerContactRequest;

interface PartnershipMailServiceInterface
{
    public function sendPartnershipInquiry(PartnerContactRequest $request): void;
}
