Add-Type -AssemblyName System.IO.Compression
$zip = [System.IO.Compression.ZipFile]::OpenRead((Get-Location).Path + "\25058-GRP2-SRS(1).docx")
$entry = $zip.Entries | Where-Object {$_.Name -eq 'document.xml'} | Select-Object -First 1
if ($entry) {
  $stream = $entry.Open()
  $reader = New-Object System.IO.StreamReader($stream)
  $text = $reader.ReadToEnd()
  $reader.Dispose()
  $stream.Dispose()
  $text = $text -replace '(?s)<[^>]*>', ' '
  $text = $text -replace '\s+', ' '
  Write-Host $text.Substring(0, [Math]::Min(15000, $text.Length))
}
$zip.Dispose()
