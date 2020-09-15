<?php

script('dmssync', 'settings');
style('dmssync', 'settings');

/** @var \OCP\IL10N $l */
/** @var array $_ */

?>
<div id="dms-settings" class="section">
    <div id="dms-settings-header">
        <h2><?php p($l->t('DMS Account Sync')); ?></h2>
    </div>
    <div id="dms-settings-content">
        <div id="dms-indicator" class="msg success inlineblock" style="display: none;"><?php p($l->t('Saved')); ?></div>
        <form id="dms" action="#" method="post">
            <p>
                <label for="dmsHost"><?php p($l->t('API host')); ?></label>
                <input type="text" id="dmsHost" name="dmsHost" value="<?php p($_['dmsHost']); ?>" placeholder="<?php p($_['dmsHost_default']); ?>" />
            </p>
            <p>
                <label for="dmsDomain"><?php p($l->t('Mail Domain')); ?></label>
                <input type="text" id="dmsDomain" name="dmsDomain" style="width:10em;display: inline-block;" value="<?php p($_['dmsDomain']); ?>" placeholder="<?php p($_['dmsDomain_default']); ?>" />
            </p>
            <p>
                <label for="dmsApiDomain"><?php p($l->t('API Domain')); ?></label>
                <input type="text" id="dmsApiDomain" name="dmsApiDomain" style="width:10em;display: inline-block;" value="<?php p($_['dmsApiDomain']); ?>" placeholder="<?php p($_['dmsApiDomain_default']); ?>" />
            </p>
            <p><?php p($l->t('The actual value of the API token is not displayed here. If you want to change it, type the new token below.')); ?></p>
            <p>
                <label for="dmsPasskey"><?php p($l->t('API Passkey')); ?></label>
                <input type="password" id="dmsPasskey" name="dmsPasskey" value="********" placeholder="<?php p($_['dmsPasskey_default']); ?>" size="32" />
            </p>
            <p>
                <label for="dmsQuota" style="width:10em;display: inline-block;"><?php p($l->t('New Account Quota')); ?></label>
                <input type="text" id="dmsQuota" name="dmsQuota" style="width:5em;display: inline-block;" value="<?php p($_['dmsQuota']); ?>" placeholder="<?php p($_['dmsQuota_default']); ?>" />&nbsp;(Ex. 1024M, 1G)
            </p>
        </form>
    </div>
</div>