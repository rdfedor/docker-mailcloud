<?php

/**
 * Main application class.
 *
 * @package Application
 */

namespace OCA\DMSSync\AppInfo;

use OCA\DMSSync\Event\UserListener;
use OCP\AppFramework\App;
use OCP\EventDispatcher\IEventDispatcher;
use OCP\User\Events\UserCreatedEvent;
use OCP\User\Events\PasswordUpdatedEvent;
use OCP\User\Events\UserDeletedEvent;

class Application extends App {
	public function __construct(array $urlParams=[]) {
		parent::__construct('dmssync', $urlParams);

		/* @var IEventDispatcher $eventDispatcher */
		$dispatcher = $this->getContainer()->query(IEventDispatcher::class);

		$dispatcher->addServiceListener(UserCreatedEvent::class, UserListener::class);
		$dispatcher->addServiceListener(PasswordUpdatedEvent::class, UserListener::class);
		$dispatcher->addServiceListener(UserDeletedEvent::class, UserListener::class);
	}
}
