<?php
function custom_mail($to,$subject,$message,$from) {
	if (!empty($GLOBALS['dw_config']['use_amazon_ses'])) {
		require_once '../../vendor/ses/ses.php';
		$ses = new SimpleEmailService($GLOBALS['dw_config']['amazon_ses_access_key'], $GLOBALS['dw_config']['amazon_ses_secret_key']);
		$m   = new SimpleEmailServiceMessage();
		$m->addTo($to);
		$m->setFrom($from);
		$m->setSubject($subject);
		$m->setMessageFromString($message);
		$res = $ses->sendEmail($m);
		# TODO: log
	} else {
		mail($to, $subject, $message, 'From: ' . $from);
	}
}
?>