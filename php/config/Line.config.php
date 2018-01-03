<?php
global $lineBotConfig, $lineConst, $lineApi, $lineTrialConfig;
$lineBotConfig = [
    'channelId' => '1469551543',
    'channelSecret' => 'e29aae672bf4e94cdd904b9b4121e92b',
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
        'BC' => 'https://api.line.me/v2/bot/profile',
        'Trial' => 'https://trialbot-api.line.me/v1/profiles',
    ],
    'refreshToken' => [
        'BC' => 'https://api.line.me/v2/oauth/accessToken',
    ]
];
$lineTrialConfig = [
    'channelId' => '1476021536',
    'channelSecret' => '640f96f8014d3b327afc7a078bee1ee3',
    'channelMid' => 'uc67a8e8917069145a5e1241dd5c05d1f'
 ];
// if (!defined('LINE_BOT_CONFIG')) {
//     define('LINE_BOT_CONFIG', [
//         'channelId' => '1457532260',
//         'channelSecret' => '560b48bf91cc77dac3391a09055832d1',
//     ]);
// }
// if (!defined('LINE_CONST')) {
//     define('LINE_CONST', [
//         'contentType' => [
//             'Text' => 1,
//             'Image' => 2,
//             'Video' => 3,
//             'Audio' => 4,
//             'Location' => 7,
//             'Sticker' => 8,
//             'Contact' => 10,
//         ],
//         'eventType' => [
//             'Message' => '138311609000106303',
//             'Operation' => '138311609100106403',
//             'OutgoingMessage' => '138311608800106203',
//             'OutgoingMultiMessage' => '140177271400161403',
//             'LinkMessage' => '137299299800026303',
//         ],
//         'operationType' => [
//             'Friend' => 4,
//             'Group' => 5,
//             'Room' => 7,
//             'Block' => 8,
//         ],
//         'toType' => [
//             'User' => 1,
//             'Room' => 2,
//             'Group' => 3,
//         ],
//         'toChannel' => [
//             'Message' => 1383378250,
//             'MultiMessage' => 1383378250,
//             'LinkMessage' => 1341301715,
//         ],
//     ]);
// }
// if (!defined('LINE_API')) {
//     define('LINE_API',
//         [
//             'sendMessage' => [
//                 'BC' => 'https://api.line.me/v1/events',
//                 'Trail' => 'https://trialbot-api.line.me/v1/events',
//             ],
//             'getUserProfile' => [
//                 'BC' => 'https://api.line.me/v1/profiles',
//                 'Trial' => 'https://trialbot-api.line.me/v1/profiles',
//             ],
//         ]
//     );
// }
