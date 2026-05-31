$port = 8080
$path = $PSScriptRoot

$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:$port/")
$listener.Start()

Write-Host "Listening on http://localhost:$port/"
Write-Host "Press Ctrl+C to stop"

try {
    while ($listener.IsListening) {
        $context = $listener.GetContext()
        $request = $context.Request
        $response = $context.Response

        $filePath = Join-Path $path $request.Url.LocalPath.TrimStart('/')
        
        if (Test-Path -Path $filePath -PathType Container) {
            $filePath = Join-Path $filePath "index.html"
        }

        if (Test-Path $filePath) {
            $fileInfo = Get-Item $filePath
            $response.ContentLength64 = $fileInfo.Length

            $extension = [System.IO.Path]::GetExtension($filePath).ToLower()
            switch ($extension) {
                ".html" { $response.ContentType = "text/html" }
                ".css" { $response.ContentType = "text/css" }
                ".js" { $response.ContentType = "application/javascript" }
                ".png" { $response.ContentType = "image/png" }
                ".jpg" { $response.ContentType = "image/jpeg" }
                ".svg" { $response.ContentType = "image/svg+xml" }
                ".mp4" { $response.ContentType = "video/mp4" }
                ".mp3" { $response.ContentType = "audio/mpeg" }
                ".json" { $response.ContentType = "application/json" }
                default { $response.ContentType = "application/octet-stream" }
            }

            try {
                $fileStream = [System.IO.File]::OpenRead($filePath)
                $fileStream.CopyTo($response.OutputStream)
            }
            catch {
                Write-Host "Error serving file: $_"
                $response.StatusCode = 500
            }
            finally {
                if ($fileStream) { $fileStream.Close() }
            }
        }
        else {
            $response.StatusCode = 404
            Write-Host "404 Not Found: $filePath"
        }
        $response.Close()
    }
}
finally {
    $listener.Stop()
}
