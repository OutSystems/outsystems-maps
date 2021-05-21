:again 
    set /p var=Please enter path to the file to continue: 
    IF EXIST %var%. goto teste2
    
:teste2
    for /f %%i in ('dir %var%\Map_Regressions_MapsV2\scripts\OutSystemsMaps_MapsV2.OutSystemsMaps.js%%3f* /b/a-d/od/t:c') do set LAST=%%i
    tsc -w --outFile %var%\Map_Regressions_MapsV2\scripts\%LAST%
