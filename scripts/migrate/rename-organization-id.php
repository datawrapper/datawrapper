<?php

/*
 * This scripts renames an organization_id
 */

define('ROOT_PATH', '../../');
define('NO_SLIM', 1);

require_once ROOT_PATH . 'lib/bootstrap.php';

$old_id = $argv[1];
$new_id = $argv[2];

$sql = <<<EOT
-- step 1: copy organization 
INSERT INTO organization (id, name, created_at, deleted, default_theme, settings, disabled)
SELECT "$new_id", name, created_at, deleted, default_theme, settings, disabled FROM organization
  WHERE id = "$old_id";
  
-- step 2: update references
UPDATE chart SET organization_id = "$new_id" WHERE organization_id = "$old_id";
UPDATE plugin_organization SET organization_id = "$new_id" WHERE organization_id = "$old_id";
UPDATE user_organization SET organization_id = "$new_id" WHERE organization_id = "$old_id";
UPDATE organization_theme SET organization_id = "$new_id" WHERE organization_id = "$old_id";
UPDATE organization_product SET organization_id = "$new_id" WHERE organization_id = "$old_id";
UPDATE pixeltracker_organization_day SET organization_id = "$new_id" WHERE organization_id = "$old_id";
UPDATE pixeltracker_organization_month SET organization_id = "$new_id" WHERE organization_id = "$old_id";
UPDATE pixeltracker_organization_week SET organization_id = "$new_id" WHERE organization_id = "$old_id";
    
-- step 3: remove old organization
DELETE FROM organization WHERE id = "$old_id";
EOT;

print $sql."\n";

try {
	$pdo = Propel::getConnection();
	$res = $pdo->query($sql);
} catch(PDOException $exception){ 
	print $exception->getMessage();
} catch (Exception $e) {
	print $e->getMessage();
}
