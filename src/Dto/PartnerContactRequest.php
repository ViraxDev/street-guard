<?php

namespace App\Dto;

use Symfony\Component\Validator\Constraints as Assert;

final class PartnerContactRequest
{
    #[Assert\NotBlank(message: 'Name is required.')]
    #[Assert\Length(min: 2, max: 100, minMessage: 'Name should be at least 2 characters.', maxMessage: 'Name should not exceed 100 characters.')]
    public string $name;

    #[Assert\Length(max: 100, maxMessage: 'Organization should not exceed 100 characters.')]
    public ?string $organization = null;

    #[Assert\NotBlank(message: 'Email is required.')]
    #[Assert\Email(message: 'The email {{ value }} is not a valid email.')]
    public string $email;

    #[Assert\Length(max: 20, maxMessage: 'Phone should not exceed 20 characters.')]
    public ?string $phone = null;

    #[Assert\NotBlank(message: 'Topic is required.')]
    #[Assert\Choice(choices: ['partnership', 'sponsorship', 'data', 'other'], message: 'Please select a valid topic.')]
    public string $topic;

    #[Assert\NotBlank(message: 'Message is required.')]
    #[Assert\Length(min: 10, max: 2000, minMessage: 'Message should be at least 10 characters.', maxMessage: 'Message should not exceed 2000 characters.')]
    public string $message;
}
