<?php
include __DIR__ . '/../DetectDevice.php';
if ($rst === false):
    exit('請使用行動裝置進入此頁面');
endif;
?>
<!DOCTYPE html>
<html>

<head>
    <meta name="viewport" content="initial-scale=1.0, user-scalable=no">
    <meta charset="UTF-8">
    <title></title>
    <script defer async src="https://maps.google.com/maps/api/js?signed_in=false&client=gme-taipeicitygovernment1&channel=doitLINE"></script>
    <script src="https://scdn.line-apps.com/channel/sdk/js/loader_20150909.js"></script>
    <script src="../assets/js/config.min.js"></script>
    <script src="../assets/js/common.min.js"></script>
    <script src="../assets/js/lib/jquery-2.2.4.min.js"></script>
</body>
<script>
function getLatLng(a){var b={datasetId:a,areaCode:"",authToken:AUTH_TOKEN,st:(new Date).getTime()},c=API_HOST+SRU+"/listPDatasetInfoToShow/";$.ajax({url:c,data:b,dataType:"json",method:"GET",async:!1}).done(function(a){if(a.result===!1)return void alert("尚無資料");var b=JSON.parse(a.data),c=JSON.parse(b[0].info_to_show);drawMap(c.result.areaDetail)}).fail(function(a,b,c){console.error(c)})}function drawMap(a){var b=window.innerHeight>0?window.innerHeight:screen.height;document.getElementById("map").style.height=b-200+"px";var c=new google.maps.Map(document.getElementById("map"),{zoom:13,center:{lat:25.0302624,lng:121.508669},mapTypeId:google.maps.MapTypeId.ROADMAP,mapTypeControl:!1,scrollwheel:!1,draggable:!0,scaleControl:!1,zoomControl:!1,streetViewControl:!1});a.forEach(function(a,b){new google.maps.Circle({strokeColor:"#FF0000",strokeOpacity:.8,strokeWeight:2,fillColor:"#FF0000",fillOpacity:.35,map:c,center:{lat:a.circle.center.lat,lng:a.circle.center.lng},radius:100*Math.sqrt(a.circle.radius)})})}window.addEventListener("load",function(a){document.addEventListener("deviceready",function(a){var b={pageKey:"NCDRWatergate",entryPage:!1,titleBar:{left:{imgId:"btn_default",text:"",visible:!1,enable:!1},center:{text:"水閘門啟閉影響範圍資訊",clickable:!1}}};LCS.Interface.updateTitleBar(b),LCS.Interface.registerTitleBarCallback(function(a){switch(a.target){case"LBUTTON":break;case"RBUTTON":break;case"BACK":window.history.back();break;case"TITLE":}}),getLatLng("ncdr_watergate")},!1)});
</script>
<style>
    body,html{height:100%}#map{width:100%}#wrapper{background-image:url(../assets/images/bg01.png);background-repeat:no-repeat;position:relative;background-size:100% 100%;min-height:100%;padding-top:0;margin:0}
</style>
</head>

<body>
    <div id="wrapper">
        <div>
            <span>【影響範圍地圖】</span>
        </div>
        <div id="map"></div>
    </div>
</body>

</html>
