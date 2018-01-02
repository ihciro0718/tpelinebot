<?php
/*
require_once __DIR__ . '/../config/Global.config.php';
require_once ROOT_PATH . '/common/DbAccess.class.php';
require_once ROOT_PATH . '/common/Common.php';
require_once ROOT_PATH . '/config/Line.config.php';

global $lineApi, $lineConst;
$dbObj = new PdoDatabase('linebot');
$query = "select mid from subscription_container
where dataset_id = 'airbox'
group by mid";
$dbObj->prepareQuery($query);
$r = $dbObj->getQuery(0);
$tosend = $toSendChunk = [];
foreach ($r as $m) {
	$tosend[] = $m['mid'];
}
if (count($tosend) > 150) {
	$toSendChunk = array_chunk($tosend, 150);
}

$message = '空氣盒子為提供更優質服務品質，本服務將暫停服務，預計於9/26(二)恢復服務，造成您的不便，敬請見諒。';
foreach ($toSendChunk as $members) {
	messagesFromBot(
		$lineApi['sendMessage']['BC'],
		$members,
		[
			'contentType' => $lineConst['contentType']['Text'],
			'toType' => $lineConst['toType']['User'],
			'text' => $message,
		],
		[
			'toChannel' => $lineConst['toChannel']['Message'],
			'eventType' => $lineConst['eventType']['OutgoingMessage'],
		]
	);
}
*/
