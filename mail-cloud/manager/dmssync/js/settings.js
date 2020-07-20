/*
 * settings.js
 * Copyright 2020 eth0 <ethernet.zero@gmail.com>
 * 
 * This work is free. You can redistribute it and/or modify it under the terms of
 * the Mozilla Public License 2.0. See the COPYING file for more details.
 */
function setDMSConfigValue(setting, value) {
	if (
    setting != "dmsPasskey" ||
    (setting == "dmsPasskey" && value !== "********")
  ) {
    OC.msg.startSaving("#dms-indicator")
    OC.AppConfig.setValue("dmssync", setting, value)
    OC.msg.finishedSaving("#dms-indicator", {
      status: "success",
      data: { message: t("dmssync", "Saved") },
    })
  }
}

$(function() {
	'use strict';

	$('#dms input, #dms textarea').each(function(e) {
		var el = $(this);
		if (!el.val()) {
			el.val(el.attr('data-default'));
		}
	});

	$('#dms input, #dms textarea').change(function(e) {
		var el = $(this);
		$.when(el.focusout()).then(function() {
			var key = $(this).attr('name');
			setDMSConfigValue(key, $(this).val())
		});
		if (e.keyCode === 13) {
			var key = $(this).attr('name');
			setDMSConfigValue(key, $(this).val())
		}
	});
});
