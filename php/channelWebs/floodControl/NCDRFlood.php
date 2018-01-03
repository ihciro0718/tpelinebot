<?php
include __DIR__ . '/../DetectDevice.php';
if ($rst === false):
    exit('請使用行動裝置進入此頁面');
endif;
?>
<!DOCTYPE html>
<html>

<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width; initial-scale=1.0; maximum-scale=1.0; user-scalable=no">
    <script src="https://scdn.line-apps.com/channel/sdk/js/loader_20150909.js"></script>
    <script src="../assets/js/lib/jquery-2.2.4.min.js"></script>
    <script src="../assets/js/config.min.js"></script>
    <script src="../assets/js/common.min.js"></script>
    <script src="../assets/js/NCDRFlood.min.js"></script>
    <link rel="stylesheet" type="text/css" href="../assets/css/all.min.css">
</head>

<body>
    <div id="wrapper">
        <div id="main">
            <div id="subc__desc"></div>
            <div id="subc__btnblock"></div>
            <div id="subc__table">
                <table id="subcedInfo"></table>
            </div>
            <div id="subc__infoaction"></div>
            <div id="subc__infoaction2"></div>
        </div>
    </div>
</body>

</html>
