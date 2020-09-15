<?php

/**
 * Settings class.
 *
 * @package Settings
 */

declare(strict_types=1);

namespace OCA\DMSSync\Settings;

use OCP\AppFramework\Http\TemplateResponse;
use OCP\IConfig;
use OCP\Settings\ISettings;

class AdminSettings implements ISettings {

	/** @var string */
	private $appName;

	/** @var IConfig */
	private $config;

	/** @var array */
	private $defaultSettings = [
		'dmsHost' => 'https://mailman.example.com',
		'dmsApiDomain' => 'domain-12345',
		'dmsPasskey' => 'Y0UR-4P1-T0K3N',
		'dmsQuota' => '1024M',
		'dmsDomain' => '',
	];

	public function __construct(string $AppName, IConfig $config) {
		$this->appName = $AppName;
		$this->config = $config;
		$this->defaultSettings['dmsDomain'] = getenv('DOMAIN') || 'example.com';
	}

	public function getForm(): TemplateResponse {
		$appKeys = $this->config->getAppKeys($this->appName);

		foreach ($this->defaultSettings as $key => $value) {
			$parameters["${key}_default"] = $value;
		}
		foreach ($appKeys as $key) {
			$parameters[$key] = $this->config->getAppValue($this->appName, $key);
		}

		return new TemplateResponse($this->appName, 'settings-admin', $parameters);
	}

	public function getSection(): string {
		return 'additional';
	}

	public function getPriority(): int {
		return 50;
	}
}
