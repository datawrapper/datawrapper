<?php
namespace dw;

use Exception;
use Propel;
use PDO;
use PDOException;


class Migrations {

    const VERBOSE = false;

    static function sync($scope) {
        $version = self::getSchemaVersion($scope);
        $migrations = self::getMigrations($scope);

        if (empty($migrations)) {
            if (self::VERBOSE) self::log($scope, 'no db migrations found', 'gray');
            return;
        }
        if (self::VERBOSE) self::log($scope, 'currently on version '.$version);

        // print_r(($migrations[$scope]));
        foreach ($migrations as $migration) {
            if ($migration['version'] > $version) {
                if (self::canSkipMigration($migration)) {
                    self::log($scope, 'skipping migration '.$migration['version'].' ('.$migration['key'].')');
                    self::updateSchemaVersion($scope, $migration['version']);
                    $version = $migration['version'];
                } else {
                    self::log($scope, 'applying migration '.$migration['version'].' ('.$migration['key'].')', 'white');
                    try {
                        self::applyMigration($migration);
                    } catch (Exception $e) {
                        self::log($scope, 'migration '.$migration['version'].' ('.$migration['key'].') failed!', 'red', true);
                        self::log($scope, $e->getMessage(), 'red', true);
                        self::log($scope, 'stopping db migration at version '.$version, 'yellow');
                        return;
                    } finally {
                        self::updateSchemaVersion($scope, $migration['version']);
                        $version = $migration['version'];
                    }
                }
            } else {
                if (self::VERBOSE) self::log($scope, 'already on version '.$migration['version'].' ('.$migration['key'].')', 'gray');
            }
        }
    }

    static $tables = [];

    protected static function updateSchemaVersion($scope, $version) {
        try {
            self::dbQuery('INSERT INTO `schema` (scope, version) VALUES ("'.$scope.'", '.$version.') ON DUPLICATE KEY UPDATE version = '.$version, false);
        } catch (Exception $e) {
            self::log($scope, 'could not update schema version (yet)', 'yellow');
        }
    }

    protected static function applyMigration($migration) {
        self::dbQuery($migration['content']['up']);
    }

    protected static function canSkipMigration($migration) {
        if (!empty($migration['content']['adds'])) {
            $tables = self::dbFetchColumn('SHOW TABLES');
            $canSkip = true;
            foreach ($migration['content']['adds'] as $tableOrColumn) {
                $parts = explode('.', $tableOrColumn);
                $table = $parts[0];
                $tableExists = in_array(strtolower($table), $tables);
                if (count($parts) > 1) {
                    // table column
                    if ($tableExists) {
                        // see if column exists
                        $column = $parts[1];
                        $columns = self::dbFetchColumn('DESCRIBE '.$table);
                        $columnExists = in_array(strtolower($column), $columns);
                        $canSkip = $canSkip && $columnExists;
                    } else {
                        $canSkip = false;
                    }

                } else {
                    // check if table exists
                    $canSkip = $canSkip && $tableExists;
                }
                # code...
            }
            return $canSkip;
        }
        return false;
    }

    /**
     * splits a migration sql file into `adds`, `up` and `down`
     *
     * example migration.sql:
     * -- Adds chart.utf8
     * -- Up
     * ALTER TABLE chart ADD COLUMN utf8 INT;
     * -- Down
     * ALTER TABLE chart DROP COLUMN utf8;
     */
    protected static function parseMigrationSQL($sql) {
        $lines = explode("\n", $sql);
        $up = [];
        $down = [];
        $adds = [];
        $mode = '';
        foreach ($lines as $line) {
            if (substr($line, 0, 2) === '--') {
                if (trim(strtolower(substr($line, 2))) === 'up') $mode = 'up';
                if (trim(strtolower(substr($line, 2))) === 'down') $mode = 'down';
                if (trim(strtolower(substr($line, 2, 5))) === 'adds') {
                    $mode = '';
                    $adds = array_map('trim', explode(',', trim(strtolower(substr($line, 7)))));
                }
            } else {
                if ($mode === 'up') $up[] = $line;
                if ($mode === 'down') $down[] = $line;
            }
        }
        return [
            'adds' => $adds,
            'up' => implode("\n", $up),
            'down' => implode("\n", $down),
        ];
    }

    /**
     * reads latest schema version from the `schema` table
     */
    static function getSchemaVersion($scope) {
        if (empty(self::$tables)) {
            self::$tables = self::dbFetchColumn('SHOW TABLES', false);
        }
        if (in_array('schema', self::$tables)) {
            $version = self::dbFetchOne('SELECT version FROM `schema` WHERE scope = "'.$scope.'"', false);
            if (!empty($version)) return $version;
        }
        return 0;
    }

    /**
     * returns a list of all db migrations for a given `scope`
     */
    protected static function getMigrations($scope) {
        $path = $scope === 'core' ? ROOT_PATH  . 'migrations/*.sql' : get_plugin_path().$scope.'/migrations/*.sql';
        $result = [];
        foreach (glob($path) as $sql) {
            $file = basename($sql, '.sql');
            $parts = explode('-', $file);
            $result[] = [
                'version' => intval(array_shift($parts)),
                'key' => implode('-', $parts),
                'content' => self::parseMigrationSQL(file_get_contents($sql))
            ];
        }
        return $result;
    }


    protected static function dbQuery($sql, $verbose=true) {
        try {
            $pdo = Propel::getConnection();
            return $pdo->query($sql);
        } catch(PDOException $e){
            if ($verbose) self::log('mysql', $e->getMessage(), 'red');
            throw $e;
        } catch (Exception $e) {
            if ($verbose) self::log('php', $e->getMessage(), 'red');
            throw $e;
        }
    }

    protected static function dbFetchColumn($sql, $verbose=true) {
        $res = self::dbQuery($sql, $verbose);
        return $res->fetchAll(PDO::FETCH_COLUMN, 0);
    }

    protected static function dbFetchOne($sql, $verbose=true) {
        $res = self::dbQuery($sql, $verbose);
        return $res->fetchColumn(0);
    }

    protected static $colors = [
        'white' => '37',
        'lightgray' => '29',
        'gray' => '30',
        'red' => '31',
        'green' => '32',
        'yellow' => '33',
        'blue' => '34',
        'pink' => '35',
        'teal' => '36'
    ];

    protected static function log($scope, $message, $color = 'lightgray', $bold = false) {
        if (defined('NO_SLIM')) {
            print '['.$scope.'] ';
            if ($color && isset(self::$colors[$color])) print "\033[".($bold ? '1' : '0').';'.self::$colors[$color]."m";
            print $message;
            if ($color) print "\033[m";
            print "\n";
        }
    }

}