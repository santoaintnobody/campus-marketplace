# Campus Marketplace - Spring Boot Runner
$javaExe = "C:\Users\subba\.p2\pool\plugins\org.eclipse.justj.openjdk.hotspot.jre.full.win32.x86_64_21.0.11.v20260515-1531\jre\bin\java.exe"
if (-not (Test-Path $javaExe)) {
    $javaExe = "java"
}

$allJars = Get-ChildItem -Path "C:\Users\subba\.m2\repository" -Filter "*.jar" -Recurse | Select-Object -ExpandProperty FullName
# Exclude legacy SLF4J 1.x jars that conflict with Spring Boot 3.2.5 (SLF4J 2.x)
$compatibleJars = $allJars | Where-Object { $_ -notmatch "slf4j-api-1\." -and $_ -notmatch "log4j-to-slf4j-2\.1" }
$jars = $compatibleJars -join ";"
$classpath = "target\classes;src\main\resources;$jars;..\lombok.jar;lombok.jar"

Copy-Item -Path "src\main\resources\*" -Destination "target\classes\" -Recurse -Force -ErrorAction SilentlyContinue

Write-Host "Starting Campus Marketplace Spring Boot Backend on http://localhost:8080..."
& $javaExe -cp $classpath "-Dspring.profiles.active=h2" com.campus.marketplace.CampusMarketplaceApplication
