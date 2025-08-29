<?php

namespace App\Controller;

use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\RedirectResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;

trait ResponseHandlerTrait
{
    /**
     * Handle success responses.
     */
    public function handleSuccess(Request $request, string $message, string $redirectRoute): Response
    {
        return $this->handleResponse(true, $request, $message, $redirectRoute);
    }

    /**
     * Handle error responses.
     */
    public function handleError(Request $request, string $message, string $redirectRoute, int $statusCode = Response::HTTP_INTERNAL_SERVER_ERROR): Response
    {
        return $this->handleResponse(false, $request, $message, $redirectRoute, $statusCode);
    }

    /**
     * Handle both success and error responses.
     *
     * @param bool   $isSuccess     If true, handle success, else handle error
     * @param string $message       The message to return to the user
     * @param string $redirectRoute The route to redirect to after handling the response
     * @param int    $statusCode    HTTP status code for error responses
     */
    private function handleResponse(
        bool $isSuccess,
        Request $request,
        string $message,
        string $redirectRoute,
        int $statusCode = Response::HTTP_INTERNAL_SERVER_ERROR,
    ): Response {
        $responseData = [
            'success' => $isSuccess,
            'message' => $message,
        ];

        if ($request->isXmlHttpRequest()) {
            return new JsonResponse($responseData, $isSuccess ? Response::HTTP_OK : $statusCode);
        }

        // Flash messages for non-AJAX requests
        $flashType = $isSuccess ? 'success' : 'error';
        $this->addFlash($flashType, $message);

        return new RedirectResponse($this->generateUrl($redirectRoute));
    }
}
