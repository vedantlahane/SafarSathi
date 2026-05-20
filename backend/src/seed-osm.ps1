# seed-osm.ps1 - Fetch Punjab OSM data from Overpass and save to JSON
# Run: powershell -ExecutionPolicy Bypass -File src\seed-osm.ps1

$BBOX = "29.5,73.8,32.6,76.9"
$ENDPOINTS = @(
  "https://overpass.kumi.systems/api/interpreter",
  "https://overpass-api.de/api/interpreter",
  "https://overpass.openstreetmap.ru/api/interpreter"
)
$OUTPUT = Join-Path $PSScriptRoot "..\data\punjab-osm.json"

function Invoke-Overpass($Query) {
  $encoded = [System.Uri]::EscapeDataString($Query)
  foreach ($ep in $ENDPOINTS) {
    $host_ = ($ep -split "/" | Select-Object -Index 2)
    Write-Host "  -> Trying $host_..."
    try {
      $body = "data=$encoded"
      $bytes = [System.Text.Encoding]::UTF8.GetBytes($body)
      $req = [System.Net.WebRequest]::Create($ep)
      $req.Method = "POST"
      $req.ContentType = "application/x-www-form-urlencoded"
      $req.ContentLength = $bytes.Length
      $req.Timeout = 60000
      $req.UserAgent = "YatraX-Seed/1.0"
      $stream = $req.GetRequestStream()
      $stream.Write($bytes, 0, $bytes.Length)
      $stream.Close()
      $resp = $req.GetResponse()
      $reader = New-Object System.IO.StreamReader($resp.GetResponseStream())
      $content = $reader.ReadToEnd()
      $reader.Close()
      Write-Host "    OK - $($content.Length) bytes"
      return $content | ConvertFrom-Json
    } catch {
      Write-Host "    FAIL: $($_.Exception.Message.Substring(0, [Math]::Min(100, $_.Exception.Message.Length)))"
    }
  }
  throw "All Overpass endpoints failed"
}

Write-Host "Fetching Punjab OSM data..."

$results = @{}

Write-Host "Police stations..."
$q = "[out:json][timeout:50];node[""amenity""=""police""]($BBOX);out body;"
$r = Invoke-Overpass $q
$results["police"] = @($r.elements | Where-Object { $_.tags.name })
Write-Host "  Found $($results['police'].Count) named police stations"

Write-Host "Hospitals/clinics/pharmacies..."
$q = "[out:json][timeout:50];(node[""amenity""=""hospital""]($BBOX);node[""amenity""=""clinic""]($BBOX);node[""amenity""=""pharmacy""]($BBOX););out body;"
$r = Invoke-Overpass $q
$results["hospitals"] = @($r.elements | Where-Object { $_.tags.name })
Write-Host "  Found $($results['hospitals'].Count) medical facilities"

Write-Host "Places of worship..."
$q = "[out:json][timeout:50];(node[""amenity""=""place_of_worship""][""religion""=""sikh""]($BBOX);node[""amenity""=""place_of_worship""][""religion""=""hindu""]($BBOX);node[""amenity""=""place_of_worship""][""religion""=""muslim""]($BBOX);node[""amenity""=""place_of_worship""][""religion""=""christian""]($BBOX););out body;"
$r = Invoke-Overpass $q
$pois = @($r.elements | Where-Object { $_.tags.name })
Write-Host "  Found $($pois.Count) worship places"

Write-Host "Fire stations and attractions..."
$q = "[out:json][timeout:50];(node[""amenity""=""fire_station""]($BBOX);node[""tourism""=""attraction""]($BBOX);node[""historic""=""fort""]($BBOX);node[""historic""=""monument""]($BBOX);node[""tourism""=""museum""]($BBOX););out body;"
$r = Invoke-Overpass $q
$pois += @($r.elements | Where-Object { $_.tags.name })
$results["pois"] = $pois
Write-Host "  Total POIs: $($pois.Count)"

Write-Host "Land-use risk zones..."
$q = "[out:json][timeout:50];(way[""landuse""=""military""]($BBOX);way[""landuse""=""industrial""]($BBOX);way[""landuse""=""quarry""]($BBOX););out geom tags;"
$r = Invoke-Overpass $q
$results["landuse"] = @($r.elements | Where-Object { $_.geometry -or $_.bounds })
Write-Host "  Found $($results['landuse'].Count) land-use zones"

New-Item -ItemType Directory -Force -Path (Split-Path $OUTPUT) | Out-Null
$results | ConvertTo-Json -Depth 10 | Set-Content $OUTPUT -Encoding UTF8

Write-Host ""
Write-Host "DONE - Data saved to: $OUTPUT"
Write-Host "Police:    $($results['police'].Count)"
Write-Host "Hospitals: $($results['hospitals'].Count)"
Write-Host "POIs:      $($results['pois'].Count)"
Write-Host "Zones:     $($results['landuse'].Count)"
Write-Host ""
Write-Host "Now run: npx tsx src/import-osm-json.ts"
