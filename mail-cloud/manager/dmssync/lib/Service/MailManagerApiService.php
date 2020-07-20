<?php

declare(strict_types=1);

namespace OCA\DMSSync\Service;

use Exception;
use OCP\IConfig;
use OCP\ILogger;

class MailManagerApiService {
    /** @var string */
    private $appName;

    /** @var IConfig */
    private $config;

    /** @var ILogger */
    private $logger;

    private $urlPathTemplate = '%s/api/%s';

    private $accessToken;

    private $_createdUserCache;

    public function __construct($AppName, IConfig $config, ILogger $logger)
    {
        $this->appName = $AppName;
        $this->config = $config;
        $this->logger = $logger;
        $this->_createdUserCache = [];
    }

    private function _config(string $key): string
    {
        return $this->config->getAppValue($this->appName, $key);
    }

    private function getUrl($target): string
    {
        $domain = $this->_config('dmsHost');
        return sprintf($this->urlPathTemplate, $domain, $target);
    }

    private function getAccessToken(): string
    {
        if (!$this->accessToken) {
            $postdata = json_encode(
                array(
                    'domain' => $this->_config('dmsApiDomain'),
                    'passkey' => $this->_config('dmsPasskey')
                )
            );

            $opts = array('http' =>
                array(
                    'method'  => 'POST',
                    'header'  => 'Content-Type: application/json',
                    'content' => $postdata
                ));

            $context  = stream_context_create($opts);

            $this->accessToken = file_get_contents($this->getUrl('auth/verify'), false, $context);
        }

        if (!$this->accessToken) {
            throw new Exception(sprintf('Failed to retrieve access token (%s)', $postdata));
        }

        return $this->accessToken;
    }

    private function makeSecureCall(string $method, string $path, array $payload): void
    {
        $accessToken = $this->getAccessToken();

        $postdata = json_encode($payload);

        $opts = ['http' =>
            [
                'method'  => $method,
                'header'  => [
                    "Content-Type: application/json",
                    sprintf("Authorization: Bearer %s", $accessToken)
                ],
                'content' => $postdata,
                'ignore_errors' => true
            ]
        ];

        $context  = stream_context_create($opts);

        $fullPath = $this->getUrl($path);
        $response = file_get_contents($fullPath, false, $context);

        $responseCodeParts = explode(' ', $http_response_header[0]);
        $responseCode = $responseCodeParts[1];

        if ($responseCode !== "200") {
            $logData = [
                'code' => $responseCode,
                'email' => $payload['email']
            ];

            if ($response) {
                $responseJson = json_decode($response, true);

                $logData['message'] = $responseJson['message'];
            }
            $this->logger->error(sprintf('%s %s failed. (%s)', $method, $fullPath, json_encode($logData)));
        }
    }

    private function getEMailAddressByUid(string $uid): string
    {
        $domain = $this->_config('dmsDomain');

        if (!$domain) {
            $domain = getenv('DOMAIN');
        }

        return sprintf("%s@%s", $uid, $domain);
    }

    public function createEmailAccount(string $uid, string $password): void
    {
        $emailAddress = $this->getEMailAddressByUid($uid);

        if (!in_array($uid, $this->_createdUserCache)) {
            $this->makeSecureCall('POST', 'account', array(
                'email' => $emailAddress,
                'password' => $password,
                'quota' => $this->_config('dmsQuota')
            ));

            $this->_createdUserCache[] = $uid;
        } else {
            $this->logger->info(sprintf('Duplicate create event detected for %s.', $emailAddress));
        }
    }

    public function updateEmailAccount(string $uid, string $password): void
    {
        $emailAddress = $this->getEMailAddressByUid($uid);

        $this->makeSecureCall('PUT', 'account', array(
            'email' => $emailAddress,
            'password' => $password,
        ));
    }

    public function deleteEmailAccount(string $uid): void
    {
        $emailAddress = $this->getEMailAddressByUid($uid);

        $this->makeSecureCall('DELETE', 'account', array(
            'email' => $emailAddress
        ));
    }
}