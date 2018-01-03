<?php
/**
 * 定義LINE API所需變數
 */
global $lineBotConfig, $lineConst, $lineApi, $lineTrialConfig;
// if using trail account
$lineTrialConfig = [
    'channelId' => '1523335590',
    'channelSecret' => '651ebdaf5bc69e83809e42332d57cd1f',
    //'channelMid' => 'your line channel mid',
    'channelMid' => 'UdEIjSxcOqS+Zxms5N0Gbb0Rmo9cRkCLWIliE7HUxTLvJllNawffFhVSYVcWCvMywzRe+oiCGqPU28P4z99oVtKyrx75nI0Fs8zvt2i/FByW/dCPMAdsIxtpz7hXwlT8rOsKw50AsRyR/9Xp3MTcqwdB04t89/1O/w1cDnyilFU=',
    
];
// if using business connect account
$lineBotConfig = [
    'channelId' => '1523335590',
    'channelSecret' => '651ebdaf5bc69e83809e42332d57cd1f',
];
$lineConst = [
    'contentType' => [
        'Text' => 1,
        'Image' => 2,
        'Video' => 3,
        'Audio' => 4,
        'Location' => 7,
        'Sticker' => 8,
        'Contact' => 10,
    ],
    'eventType' => [
        'Message' => '138311609000106303',
        'Operation' => '138311609100106403',
        'OutgoingMessage' => '138311608800106203',
        'OutgoingMultiMessage' => '140177271400161403',
        'LinkMessage' => '137299299800026303',
    ],
    'operationType' => [
        'Friend' => 4,
        'Group' => 5,
        'Room' => 7,
        'Block' => 8,
    ],
    'toType' => [
        'User' => 1,
        'Room' => 2,
        'Group' => 3,
    ],
    'toChannel' => [
        'Message' => 1383378250,
        'MultiMessage' => 1383378250,
        'LinkMessage' => 1341301715,
    ],
];
$lineApi = [
    'sendMessage' => [
        'BC' => 'https://api.line.me/v2/bot/message/multicast',
        'Trail' => 'https://trialbot-api.line.me/v1/events',
    ],
    'getUserProfile' => [
        'BC' => 'https://api.line.me/v1/profiles',
        'Trial' => 'https://trialbot-api.line.me/v1/profiles',
    ]
];
