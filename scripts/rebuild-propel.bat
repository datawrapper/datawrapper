@echo off

rem change into project root
cd %~dp0\..

vendor\bin\phing -f vendor\propel\propel1\generator\build.xml -Dproject.dir=lib\core\
