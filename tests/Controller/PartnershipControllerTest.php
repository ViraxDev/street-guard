<?php
namespace App\\Tests\\Controller;

use Symfony\\Bundle\\FrameworkBundle\\Test\\WebTestCase;
use Symfony\\Component\\Mailer\\MailerInterface;

class PartnershipControllerTest extends WebTestCase
{
    public function testSubmitValidDataReturnsSuccess()
    {
        $client = static::createClient();
        $container = static::getContainer();

        $mailer = $this->createMock(MailerInterface::class);
        $mailer->method('send')->willReturn(null);
        $container->set(MailerInterface::class, $mailer);

        $tokenManager = $container->get('security.csrf.token_manager');
        $token = $tokenManager->getToken('partnership_submit')->getValue();

        $client->request('POST', '/partnership/submit', [
            'name' => 'Alice Example',
            'organization' => 'Example Org',
            'email' => 'alice@example.org',
            'phone' => '+1 555 000 1111',
            'topic' => 'partnership',
            'message' => 'We would like to partner.',
            '_csrf_token' => $token,
        ]);

        $this->assertSame(200, $client->getResponse()->getStatusCode());
        $responseData = json_decode($client->getResponse()->getContent(), true);
        $this->assertArrayHasKey('success', $responseData);
        $this->assertTrue($responseData['success']);
    }

    public function testSubmitMissingFieldsReturnsBadRequest()
    {
        $client = static::createClient();
        $container = static::getContainer();
        $mailer = $this->createMock(MailerInterface::class);
        $mailer->method('send')->willReturn(null);
        $container->set(MailerInterface::class, $mailer);

        $tokenManager = $container->get('security.csrf.token_manager');
        $token = $tokenManager->getToken('partnership_submit')->getValue();

        $client->request('POST', '/partnership/submit', [
            'organization' => 'Example Org',
            '_csrf_token' => $token,
        ]);

        $this->assertSame(400, $client->getResponse()->getStatusCode());
    }

    public function testSubmitInvalidCsrfReturnsForbid()
    {
        $client = static::createClient();
        $container = static::getContainer();
        $mailer = $this->createMock(MailerInterface::class);
        $mailer->method('send')->willReturn(null);
        $container->set(MailerInterface::class, $mailer);

        $client->request('POST', '/partnership/submit', [
            'name' => 'Alice',
            'email' => 'alice@example.org',
            '_csrf_token' => 'invalid',
        ]);

        $this->assertSame(403, $client->getResponse()->getStatusCode());
    }
}
