# Campus Marketplace - Java Backend Compiler
$javacExe = "C:\Users\subba\.p2\pool\plugins\org.eclipse.justj.openjdk.hotspot.jre.full.win32.x86_64_21.0.11.v20260515-1531\jre\bin\javac.exe"
if (-not (Test-Path $javacExe)) {
    $javacExe = "javac"
}

$allJars = Get-ChildItem -Path "C:\Users\subba\.m2\repository" -Filter "*.jar" -Recurse | Select-Object -ExpandProperty FullName
$compatibleJars = $allJars | Where-Object { $_ -notmatch "slf4j-api-1\." -and $_ -notmatch "log4j-to-slf4j-2\.1" }
$jars = $compatibleJars -join ";"
$sources = Get-ChildItem -Path "src\main\java" -Filter "*.java" -Recurse | Select-Object -ExpandProperty FullName

if (-not (Test-Path "target\classes")) {
    New-Item -ItemType Directory -Path "target\classes" -Force | Out-Null
}

Write-Host "Compiling Java backend..."
& $javacExe -parameters -cp "..\lombok.jar;lombok.jar;target\classes;src\main\resources;$jars" -d target\classes $sources

if ($LASTEXITCODE -eq 0) {
    Copy-Item -Path "src\main\resources\*" -Destination "target\classes\" -Recurse -Force
    Write-Host "Compilation successful!"
} else {
    Write-Host "Compilation failed with code $LASTEXITCODE"
    exit $LASTEXITCODE
}
