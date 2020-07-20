<?php

/**
 * This listener responds to user creations, deletions and password updates.
 *
 * @package UserListener
 */

declare(strict_types=1);

namespace OCA\DMSSync\Event;

use OCP\EventDispatcher\Event;
use OCP\EventDispatcher\IEventListener;
use OCP\User\Events\UserCreatedEvent;
use OCP\User\Events\PasswordUpdatedEvent;
use OCP\User\Events\UserDeletedEvent;
use OCA\DMSSync\Service\MailManagerApiService;

class UserListener implements IEventListener {
	/** @var MailManagerApiService */
	private $service;

	public function __construct(MailManagerApiService $service) {
		$this->service = $service;
	}

	public function handle(Event $event): void {
		if ($event instanceof UserCreatedEvent || $event instanceof PasswordUpdatedEvent || $event instanceof UserDeletedEvent) {
			if ($event instanceof UserCreatedEvent) {
				$this->service->createEmailAccount($event->getUid(), $event->getPassword());
			} elseif ($event instanceof PasswordUpdatedEvent) {
				$this->service->updateEmailAccount($event->getUser()->getUID(), $event->getPassword());
			} elseif ($event instanceof UserDeletedEvent) {
				$this->service->deleteEmailAccount($event->getUser()->getUID());
			}
		}
	}
}
