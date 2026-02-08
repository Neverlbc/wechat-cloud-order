
Add-Type -AssemblyName System.Drawing

function Create-Icon ($text, $color, $filename) {
    $bmp = New-Object System.Drawing.Bitmap 128, 128
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.Clear([System.Drawing.Color]::Transparent)
    $g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAlias

    $fontFamily = "Segoe UI Emoji"
    # Fallback fonts if Segoe UI Emoji is not available or doesn't cover glyphs (unlikely on Windows)
    $font = New-Object System.Drawing.Font $fontFamily, 80
    $brush = New-Object System.Drawing.SolidBrush ([System.Drawing.ColorTranslator]::FromHtml($color))

    $format = New-Object System.Drawing.StringFormat
    $format.Alignment = [System.Drawing.StringAlignment]::Center
    $format.LineAlignment = [System.Drawing.StringAlignment]::Center

    # Center roughly. Emoji vertical alignment can be tricky, adjusting Y slightly.
    $g.DrawString($text, $font, $brush, 64, 70, $format)

    $path = "f:\wechat-cloud-order\src\miniprogram\images\tab\$filename"
    $bmp.Save($path, [System.Drawing.Imaging.ImageFormat]::Png)
    $g.Dispose()
    $bmp.Dispose()
    Write-Host "Generated $filename"
}

$dir = "f:\wechat-cloud-order\src\miniprogram\images\tab"
if (-not (Test-Path $dir)) { New-Item -ItemType Directory -Force -Path $dir }

# 生成图标
# 首页 - 使用碗筷/锅
Create-Icon "🍲" "#999999" "home.png"
Create-Icon "🍲" "#4A7C59" "home-active.png"

# 订单 - 使用清单/票据
Create-Icon "🧾" "#999999" "order.png"
Create-Icon "🧾" "#4A7C59" "order-active.png"

# 我的 - 使用人像
Create-Icon "👤" "#999999" "me.png"
Create-Icon "👤" "#4A7C59" "me-active.png"
