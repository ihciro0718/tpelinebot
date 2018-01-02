<?php
require '../DetectDevice.php';
if($rst === false){
    exit('操作錯誤');
}
header('Content-Type: application/json;charset=UTF-8');

$rst = file_get_contents('http://163.29.163.57/DisasterOperationSystemWebAPIUnite/api/DisasterServiceApi/GetDisasterCategoryAndSumByDPID?District=' . $_GET['d']);

echo $rst;
