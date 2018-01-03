<?php
require 'config/Global.config.php';
require 'config/Db.config.php';
require 'common/DbAccess.class.php';
require 'config/Script.config.php';

$datasetName = [
    'airbox' => '空氣品質資訊',
    'ncdr_flood' => '淹水資訊',
    'ncdr_watergate' => '水閘門啟閉資訊',
    'ncdr_parking' => '紅黃線停車資訊',
    'ncdr_workschoolclose' => '停班停課資訊',
];
$dbObj = new PdoDatabase('linebot');
$getAllMemberCnt = "SELECT COUNT(DISTINCT `mid`) AS `allMemberCnt` FROM `subscription_container`";
$getNCDRMemberCnt = "SELECT COUNT(DISTINCT `mid`) AS `ncdrMemberCnt` FROM `subscription_container` WHERE `dataset_id` != 'airbox'";
$getAirboxMemberCnt = "SELECT COUNT(DISTINCT `mid`) AS `airboxMemberCnt` FROM `subscription_container` WHERE `dataset_id` = 'airbox'";
$getDatasetCnt = "SELECT `dataset_id`, COUNT(*) AS `datasetCnt` FROM `subscription_container` GROUP BY `dataset_id`";
$getDistrictCnt = "SELECT `dataset_id`, `detail` FROM subscription_container WHERE dataset_id IN ('ncdr_flood', 'airbox') ORDER BY `dataset_id`;";
$dbObj->prepareQuery($getAllMemberCnt);
$memberStatistic = $dbObj->getQuery();
$dbObj->prepareQuery($getNCDRMemberCnt);
$ncdrMemberStatistic = $dbObj->getQuery();
$dbObj->prepareQuery($getAirboxMemberCnt);
$airboxMmemberStatistic = $dbObj->getQuery();
$dbObj->prepareQuery($getDatasetCnt);
$datasetStatistic = $dbObj->getQuery(1);
$dbObj->prepareQuery($getDistrictCnt);
$district = $dbObj->getQuery();
$districtLen = count($district);
$rst = [];
$rst['allMembers'] = $memberStatistic[0]['allMemberCnt'];
$rst['ncdrMembers'] = $ncdrMemberStatistic[0]['ncdrMemberCnt'];
$rst['airboxMembers'] = $airboxMmemberStatistic[0]['airboxMemberCnt'];
$rst['subDetail'] = [];
$rst['distcnt'] = [];

foreach ($datasetStatistic as $k => $item) {
    array_push($rst['subDetail'], [$datasetName[$datasetStatistic[$k][0]], $datasetStatistic[$k][1]]);
}
$airboxDist = $ncdrFloodDist = [];
$airboxDistCnt = $ncdrFloodDistCnt = [];
for($i = 0; $i < $districtLen; $i++){
    if($district[$i]['dataset_id'] === 'airbox'){
        $a = json_decode($district[$i]['detail'], true);
        foreach ($a as $aarea) {
            array_push($airboxDist, $aarea['area']);
        }
    }else{
        // flood
        $b = json_decode($district[$i]['detail'], true);
        foreach ($b as $farea) {
            foreach ($farea as $ffarea) {
                array_push($ncdrFloodDist, $ffarea);
            }
        }
    }
}
$airboxDistCnt = array_count_values($airboxDist);
$ncdrFloodDistCnt = array_count_values($ncdrFloodDist);

foreach ($airboxDistCnt as $ak => $av) {
    foreach ($taiwanGeocodeTpe as $tak => $tav) {
        if($ak === $tak){
            $airboxDistCnt[$tav] = $airboxDistCnt[$ak];
            unset($airboxDistCnt[$ak]);
        }
    }
}
foreach ($ncdrFloodDistCnt as $fk => $fv) {
    foreach ($taiwanGeocodeTpe as $tfk => $tfv) {
        if($fk === $tfk){
            $ncdrFloodDistCnt[$tfv] = $ncdrFloodDistCnt[$fk];
            unset($ncdrFloodDistCnt[$fk]);
        }
    }
}
$rst['distcnt']['airbox'] = $airboxDistCnt;
$rst['distcnt']['ncdr_flood'] = $ncdrFloodDistCnt;
?>
<!DOCTYPE html>
<html lang="zh-tw">
<head>
    <meta charset="UTF-8">
    <title>統計查詢</title>
    <style>
        html, body,table{
            font-family: Arial, Sans-serif ,Microsoft Jhenghei;
            font-size: 30px;
        }
        table {
            width: 100%;
        }
        th {
            background-color: rgba(188,188,188,1);
            color: #fff;
        }
        td {
            text-align: center;
        }
        .odd{
            background-color: #dadada;
        }
        .even{
            background-color: #fff;
        }
        .right{
            float: right;
            line-height: 24px;
        }
    </style>
</head>
<body>
    <table id="tbl1">
        <thead><th>訂閱人數統計</th></thead>
        <tbody></tbody>
    </table>
    <table id="tbl2">
        <thead><th>各項服務訂閱人數</th></thead>
        <tbody></tbody>
    </table>
    <table id="tbl3">
        <thead><th>分區訂閱人數(空氣盒子)</th></thead>
        <tbody></tbody>
    </table>
    <table id="tbl4">
        <thead><th>分區訂閱人數(淹水警訊)</th></thead>
        <tbody></tbody>
    </table>
    <script>
        var tb1 = document.querySelector('#tbl1 tbody'),
            tb2 = document.querySelector('#tbl2 tbody'),
            tb3 = document.querySelector('#tbl3 tbody'),
            tb4 = document.querySelector('#tbl4 tbody');
        var rst = <?php print json_encode($rst);?>;
        var sum = parseInt(rst.ncdrMembers) + parseInt(rst.airboxMembers);
        tb1.innerHTML = '<tr class="odd"><td>總訂閱人數統計&nbsp;&nbsp;'+rst.allMembers+'</td></tr><tr class="even"><td>防汛資訊訂閱總人數&nbsp;&nbsp;'+rst.ncdrMembers+'</td></tr><tr class="odd"><td>空氣品質資訊訂閱總人數&nbsp;&nbsp;'+rst.airboxMembers+'</td></tr><tr><td>空汙+防汛訂閱人數統計&nbsp;&nbsp;'+sum+'</td></tr>';
        for(var i in rst.subDetail){
            var tr = document.createElement('tr'),
            td = document.createElement('td');
            td.innerHTML = rst.subDetail[i][0] +'訂閱人數&nbsp;&nbsp;'+ rst.subDetail[i][1];
            if(i % 2 === 0){
                tr.className = 'even';
            }else{
                tr.className = 'odd';
            }
            tr.appendChild(td);
            tb2.appendChild(tr);
        }
        var c = 0;
        // airbox 分區訂閱人數
        for(var j in rst.distcnt.airbox){
            var tr =  document.createElement('tr'),
            td = document.createElement('td');
            td.innerHTML = j+'訂閱人數&nbsp;&nbsp;'+ rst.distcnt.airbox[j];
            if(c % 2 === 0){
                tr.className = 'even';
            }else{
                tr.className = 'odd';
            }
            tr.appendChild(td);
            tb3.appendChild(tr);
            c++;
        }
        c = 0;
        // ncdr_flood 分區訂閱人數
        for(var k in rst.distcnt.ncdr_flood){
            var tr =  document.createElement('tr'),
            td = document.createElement('td');
            td.innerHTML = k+'訂閱人數&nbsp;&nbsp;'+ rst.distcnt.ncdr_flood[k];
            if(c % 2 === 0){
                tr.className = 'even';
            }else{
                tr.className = 'odd';
            }
            tr.appendChild(td);
            tb4.appendChild(tr);
            c++;
        }
    </script>
</body>
</html>

