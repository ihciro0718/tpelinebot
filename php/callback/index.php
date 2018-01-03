<?php
require __DIR__ . '/../config/Global.config.php';
include ROOT_PATH . '/config/Line.config.php';
include ROOT_PATH . '/common/Common.php';

global $lineBotConfig;
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    requestFail(405);
}

$header = getallheaders();
$lineBody = file_get_contents('php://input');
$mac = base64_encode(hash_hmac("sha256", $lineBody, utf8_encode($lineBotConfig['channelSecret']), true));
if ($mac !== $header['X-Line-ChannelSignature']) {
    requestFail(401);
}
$lineBody = json_decode($lineBody, true);
if (empty($lineBody['result'])) {
    exit('empty result body');
}
try {
    global $lineConst;
    foreach ($lineBody['result'] as $row) {
        if ($row['eventType'] === $lineConst['eventType']['Operation'] &&
            $row['content']['opType'] === $lineConst['operationType']['Friend']) {
            saveMemberInfoToDB($row['content']['from']);
            continue;
            // add as friend
        } elseif ($row['eventType'] == $lineConst['eventType']['Message'] &&
            $row['content']['toType'] == $lineConst['toType']['User'] &&
            $row['content']['contentType'] == $lineConst['contentType']['Text']) {
            // receiving message
            // $msgIsExists = callingWS(API_HOST . SRU . 'listMessage/', 'GET', ['memberId' => $row['content']['from'], 'authToken' => AUTH_TOKEN]);
            // $msgIsExists = json_decode($msgIsExists, true);
            // if ($msgIsExists['result'] === false) {
            callingWS(
                API_HOST . SRU . 'addMessage/',
                'POST',
                [
                    'authToken' => AUTH_TOKEN,
                    'msgId' => $row['content']['id'],
                    'memberId' => $row['content']['from'],
                    'payload' => $row['content']['text'],
                    'sendAt' => ceil($row['content']['createdTime'] / 1000),
                    'rawdata' => json_encode($lineBody),
                ]
            );
            // }
            saveMemberInfoToDB($row['content']['from']);
            // 傳入訊息不包含taipei則略過
            continue;
        }
    }
    // return to line-BOT-server immediately
    http_response_code(200);
} catch (PDOException $e) {
    requestFail(500);
}

/**
 * @param $mid
 */
function showServiceURI($mid)
{
    global $lineApi, $lineBotConfig, $lineConst;
    $memberIsExists = callingWS(API_HOST . SRU . 'listMember/', 'GET', ['memberId' => $mid, 'authToken' => AUTH_TOKEN]);
    $memberIsExists = json_decode($memberIsExists, true);

    if ($memberIsExists['result'] === false) {
        // 輸入的當下處裡，如有效能疑慮再改成daemon處裡
        $memberInfo = getLineUserProfile($lineApi['getUserProfile']['BC'] . '?mids=' . $mid);
        $memberInfo = json_decode($memberInfo, true);
        // add member to db
        callingWS(
            API_HOST . SRU . 'addMember/',
            'POST',
            [
                'authToken' => AUTH_TOKEN,
                'memberId' => $memberInfo['contacts'][0]['mid'],
                'displayName' => $memberInfo['contacts'][0]['displayName'],
                'puctureUrl' => $memberInfo['contacts'][0]['pictureUrl'],
                'statusMessage' => $memberInfo['contacts'][0]['statusMessage'],
            ]
        );
    } else {
        $message = '歡迎進入臺北市政府服務訂閱，請進入下列網址開始操作' . PHP_EOL .
            '進入防汛資訊服務請點 line://ch/' . $lineBotConfig['channelId'] . '?page=fc';
        $rst = messagesFromBot(
            $lineApi['sendMessage']['BC'],
            [$mid],
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
}

/**
 * @param $mid
 */
function saveMemberInfoToDB($mid)
{
    global $lineApi, $lineBotConfig, $lineConst;
    // ts => change if get is cached by browsers
    $memberIsExists = callingWS(API_HOST . SRU . 'listMember/', 'GET', ['memberId' => $mid, 'authToken' => AUTH_TOKEN, 'ts' => time()]);
    $memberIsExists = json_decode($memberIsExists, true);
    if ($memberIsExists['result'] === false) {
        // 輸入的當下處裡，如有效能疑慮再改成daemon處裡
        $memberInfo = getLineUserProfile($lineApi['getUserProfile']['BC'] . '?mids=' . $mid);
        $memberInfo = json_decode($memberInfo, true);
        // add member to db
        callingWS(
            API_HOST . SRU . 'addMember/',
            'POST',
            [
                'authToken' => AUTH_TOKEN,
                'memberId' => $memberInfo['contacts'][0]['mid'],
                'displayName' => $memberInfo['contacts'][0]['displayName'],
                'puctureUrl' => $memberInfo['contacts'][0]['pictureUrl'],
                'statusMessage' => $memberInfo['contacts'][0]['statusMessage'],
            ]
        );
    }
}
