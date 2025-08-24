<?php

declare(strict_types=1);

namespace App\Controller;

use App\Form\UserType;
use App\Message\UserPictureUpdateMessage;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

final class ProfileController extends AbstractController
{
    #[Route('/profile', name: 'app_profile')]
    public function index(): Response
    {
        $form = $this
            ->createForm(UserType::class, $this->getUser())
            ->handleRequest($this->request)
        ;

        if (($formSubmitted = $form->isSubmitted()) && $form->isValid()) {
            $this->entityManager->flush();

            $this->addFlash('success', $this->translator->trans('profile.updated'));

            return $this->redirectToRoute('app_profile');
        }

        return $this->render('profile/index.html.twig', [
            'form' => $form,
            'formSubmitted' => $formSubmitted,
        ]);
    }

    #[Route('/profile/upload', name: 'app_picture_update')]
    public function updatePicture(): Response
    {
        return $this->handleMessage(new UserPictureUpdateMessage($this->getUser()))
            ? $this->index()
            : new JsonResponse('ko', 500);
    }
}
