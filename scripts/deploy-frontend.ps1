$ErrorActionPreference = 'Stop'
$PSNativeCommandUseErrorActionPreference = $true
$server = '124.222.76.67'
$release = [guid]::NewGuid().ToString('N')
$archive = Join-Path ([IO.Path]::GetTempPath()) "luckyjob-$release.tar.gz"

Push-Location (Join-Path $PSScriptRoot '..')
try {
    pnpm build
    tar -czf $archive -C dist .
    scp -o BatchMode=yes $archive "${server}:/home/ubuntu/"
    ssh -o BatchMode=yes $server "set -eu; root=/var/www/luckyjob; sudo -n install -d -m 755 /var/www/luckyjob/releases/$release; sudo -n tar --no-same-owner --no-same-permissions -xzf /home/ubuntu/luckyjob-$release.tar.gz -C /var/www/luckyjob/releases/$release; test -s /var/www/luckyjob/releases/$release/index.html; sudo -n ln -sT /var/www/luckyjob/releases/$release /var/www/luckyjob/current-$release; sudo -n mv -Tf /var/www/luckyjob/current-$release /var/www/luckyjob/current; curl --noproxy '*' --resolve jobinfo.apphome.me:443:127.0.0.1 -fsS --max-time 10 -o /dev/null https://jobinfo.apphome.me/; rm -f /home/ubuntu/luckyjob-$release.tar.gz"
    Write-Output "Published LuckyJob release $release."
} finally {
    Pop-Location
    if (Test-Path -LiteralPath $archive) { Remove-Item -LiteralPath $archive }
}
