<?php
require_once __DIR__ . '/../config/Global.config.php';
require_once ROOT_PATH . '/common/Debug.trait.php';
require_once ROOT_PATH . '/script/Pusher.class.php';

$obj = new NCDRParkingPusher;
$data = $obj->getDataToPush();
$pushMemberList = $obj->getPushableMemberList();
if ($data && $pushMemberList) {
    $memberLen = count($pushMemberList);
    for ($i = 0; $i < $memberLen; $i++) {
        $sendToList[] = $pushMemberList[$i]['mid'];
    }
    if (!empty($sendToList)) {
        $obj->pushData($sendToList, '', 'ncdr');
    }
}
