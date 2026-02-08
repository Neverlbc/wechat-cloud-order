
$baseUrl = "https://img.icons8.com/ios/64"
$activeColor = "4A7C59" # 绿色选中态
$normalColor = "999999" # 灰色默认态

# 确保目录存在
$dir = "f:\wechat-cloud-order\src\miniprogram\images\tab"
if (-not (Test-Path $dir)) { New-Item -ItemType Directory -Force -Path $dir }

# 定义下载函数
function Download-Icon ($name, $urlName, $color) {
    # Icon8 允许通过 URL 参数改变颜色 (format: 000000)
    $url = "$baseUrl/$color/$urlName.png"
    $path = "$dir\$name.png"
    try {
        Invoke-WebRequest -Uri $url -OutFile $path -UseBasicParsing
        Write-Host "Downloaded $name from $url"
    } catch {
        Write-Host "Failed to download $name : $_"
    }
}

# 下载图标 (普通态 - 灰色)
Download-Icon "home" "home" $normalColor
Download-Icon "order" "document" $normalColor
Download-Icon "me" "user" $normalColor

# 下载图标 (选中态 - 绿色)
Download-Icon "home-active" "home" $activeColor
Download-Icon "order-active" "document" $activeColor
Download-Icon "me-active" "user" $activeColor
