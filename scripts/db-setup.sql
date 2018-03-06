-- run as root:
-- db install
CREATE DATABASE datawrapper;
-- create database user for datawrapper
CREATE USER 'datawrapper'@'localhost' IDENTIFIED BY 'datawrapper';
-- grant datawrapper user access to datawrapper db
GRANT ALL ON datawrapper.* TO 'datawrapper'@'localhost';
flush privileges;
