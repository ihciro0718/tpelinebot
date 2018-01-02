####web service命名方法
每個WS都以 `{CRUD動作}{對象}` + CamelCase 命名
WS背後的lib則以 `ws_{小寫對象字首縮寫}{CRUD順序(01~04)}` 命名
e.g: add member => addMember, ws_m01
