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
    <script src="https://scdn.line-apps.com/channel/sdk/js/loader_20150909.js"></script>
    <script defer async src="https://maps.google.com/maps/api/js?signed_in=false&client=gme-taipeicitygovernment1&channel=doitLINE"></script>
    <script src="../assets/js/config.min.js"></script>
    <script src="../assets/js/common.min.js"></script>
    <script src="../assets/js/lib/jquery-2.2.4.min.js"></script>
</body>
<script>
function getLatLng(a){var b={datasetId:a,areaCode:"",authToken:AUTH_TOKEN,st:(new Date).getTime()},c=API_HOST+SRU+"/listPDatasetInfoToShow/";$.ajax({url:c,data:b,dataType:"json",method:"GET",async:!1}).done(function(a){var b=document.getElementById("getMap");if(b.setAttribute("onchange","drawMap(this)"),a.result===!1)return void alert("尚無資料");var c=JSON.parse(a.data),d=JSON.parse(c[0].info_to_show);return"undefined"==typeof d.result.areaDetail?(document.body.innerHTML="",void alert("全區域紅黃線開放停車")):void d.result.areaDetail.forEach(function(a,c){var d=document.createElement("option");d.text=a.areaName,d.value=JSON.stringify(a.polygon),b.appendChild(d)})}).fail(function(a,b,c){console.error(c)})}function drawMap(a){if(""===a.options[a.options.selectedIndex].value)document.getElementById("map").innerHTML="",document.getElementById("map").style.height="0px";else{var b=window.innerHeight>0?window.innerHeight:screen.height;document.getElementById("map").style.height=b-100+"px";var c=a.options[a.options.selectedIndex].value,d=getMapCenter(c),e=new google.maps.Map(document.getElementById("map"),{zoom:14,center:d,mapTypeId:google.maps.MapTypeId.ROADMAP,mapTypeControl:!1,scrollwheel:!1,draggable:!0,scaleControl:!1,zoomControl:!1,streetViewControl:!1}),f=reformatLatLng(c),g=new google.maps.Polygon({paths:f,strokeColor:"#F11",strokeOpacity:.5,strokeWeight:2,fillColor:"#FAC",fillOpacity:.6});g.setMap(e)}}function reformatLatLng(a){a=JSON.parse(a);for(var b=[],c=0;c<a.length;c++){var d=a[c].split(",");b.push({lat:parseFloat(d[0]),lng:parseFloat(d[1])})}return b}function getMapCenter(a){a=JSON.parse(a);for(var b=[],c=[],d={},e=0;e<a.length;e++){var f=a[e].split(",");b.push(f[0]),c.push(f[1])}var g=getMm(b),h=getMm(c);return d.lat=g.min+(g.max-g.min)/2,d.lng=h.min+(h.max-h.min)/2,d}function getMm(a){var b={max:Math.max.apply(null,a),min:Math.min.apply(null,a)};return b}window.addEventListener("load",function(a){document.addEventListener("deviceready",function(a){var b={pageKey:"NCDRParking",entryPage:!1,titleBar:{left:{imgId:"btn_default",text:"",visible:!1,enable:!1},center:{text:"紅黃線停車範圍資訊",clickable:!1}}};LCS.Interface.updateTitleBar(b),getLatLng("ncdr_parking")},!1)});
</script>
<style>
#wrapper,body,html{height:100%}#map{width:100%;min-height:300px;}#getMap{width:90%;margin-bottom:10px}#wrapper{background-image:url(../assets/images/bg01.png);background-repeat:no-repeat;position:relative;background-size:100% 100%;padding-top:0;margin:0}
</style>
</head>

<body>
    <div id="wrapper">
        <div style="text-align: center;">
            <select id="getMap">
                <option value="">請選擇</option>
            </select>
        </div>
        <div>
            <span>【影響範圍地圖】</span>
        </div>
        <div id="map"></div>
    </div>
</body>

</html>
