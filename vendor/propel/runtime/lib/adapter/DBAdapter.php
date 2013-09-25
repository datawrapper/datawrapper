<?php

/**
 * This file is part of the Propel package.
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 *
 * @license    MIT License
 */

/**
 * DBAdapter</code> defines the interface for a Propel database adapter.
 *
 * <p>Support for new databases is added by subclassing
 * <code>DBAdapter</code> and implementing its abstract interface, and by
 * registering the new database adapter and corresponding Propel
 * driver in the private adapters map (array) in this class.</p>
 *
 * <p>The Propel database adapters exist to present a uniform
 * interface to database access across all available databases.  Once
 * the necessary adapters have been written and configured,
 * transparent swapping of databases is theoretically supported with
 * <i>zero code change</i> and minimal configuration file
 * modifications.</p>
 *
 * @author     Hans Lellelid <hans@xmpl.org> (Propel)
 * @author     Jon S. Stevens <jon@latchkey.com> (Torque)
 * @author     Brett McLaughlin <bmclaugh@algx.net> (Torque)
 * @author     Daniel Rall <dlr@finemaltcoding.com> (Torque)
 * @version    $Revision$
 * @package    propel.runtime.adapter
 */
abstract class DBAdapter
{
    const ID_METHOD_NONE = 0;
    const ID_METHOD_AUTOINCREMENT = 1;
    const ID_METHOD_SEQUENCE = 2;

    /**
     * Propel driver to Propel adapter map.
     * @var array
     */
    private static $adapters = array(
        'mysql'  => 'DBMySQL',
        'mysqli' => 'DBMySQLi',
        'mssql'  => 'DBMSSQL',
        'sqlsrv' => 'DBSQLSRV',
        'oracle' => 'DBOracle',
        'oci'    => 'DBOracle',
        'pgsql'  => 'DBPostgres',
        'sqlite' => 'DBSQLite',
        ''       => 'DBNone',
    );

    /**
     * Creates a new instance of the database adapter associated
     * with the specified Propel driver.
     *
     * @param string $driver The name of the Propel driver to create a new adapter instance
     *                            for or a shorter form adapter key.
     *
     * @throws PropelException If the adapter could not be instantiated.
     * @return DBAdapter       An instance of a Propel database adapter.
     */
    public static function factory($driver)
    {
        $adapterClass = isset(self::$adapters[$driver]) ? self::$adapters[$driver] : null;
        if ($adapterClass !== null) {
            $a = new $adapterClass();

            return $a;
        } else {
            throw new PropelException("Unsupported Propel driver: " . $driver . ": Check your configuration file");
        }
    }

    /**
     * Prepare connection parameters.
     *
     * @param  array $params
     * @return array
     */
    public function prepareParams($settings)
    {
        return $settings;
    }

    /**
     * This method is called after a connection was created to run necessary
     * post-initialization queries or code.
     *
     * If a charset was specified, this will be set before any other queries
     * are executed.
     *
     * This base method runs queries specified using the "query" setting.
     *
     * @see       setCharset()
     *
     * @param PDO   $con      A PDO connection instance.
     * @param array $settings An array of settings.
     */
    public function initConnection(PDO $con, array $settings)
    {
        if (isset($settings['charset']['value'])) {
            $this->setCharset($con, $settings['charset']['value']);
        }
        if (isset($settings['queries']) && is_array($settings['queries'])) {
            foreach ($settings['queries'] as $queries) {
                foreach ((array) $queries as $query) {
                    $con->exec($query);
                }
            }
        }
    }

    /**
     * Sets the character encoding using SQL standard SET NAMES statement.
     *
     * This method is invoked from the default initConnection() method and must
     * be overridden for an RDMBS which does _not_ support this SQL standard.
     *
     * @see       initConnection()
     *
     * @param PDO    $con     A $PDO PDO connection instance.
     * @param string $charset The $string charset encoding.
     */
    public function setCharset(PDO $con, $charset)
    {
        $con->exec("SET NAMES '" . $charset . "'");
    }

    /**
     * This method is used to ignore case.
     *
     * @param  string $in The string to transform to upper case.
     * @return string The upper case string.
     */
    abstract public function toUpperCase($in);

    /**
     * Returns the character used to indicate the beginning and end of
     * a piece of text used in a SQL statement (generally a single
     * quote).
     *
     * @return string The text delimeter.
     */
    public function getStringDelimiter()
    {
        return '\'';
    }

    /**
     * This method is used to ignore case.
     *
     * @param  string $in The string whose case to ignore.
     * @return string The string in a case that can be ignored.
     */
    abstract public function ignoreCase($in);

    /**
     * This method is used to ignore case in an ORDER BY clause.
     * Usually it is the same as ignoreCase, but some databases
     * (Interbase for example) does not use the same SQL in ORDER BY
     * and other clauses.
     *
     * @param  string $in The string whose case to ignore.
     * @return string The string in a case that can be ignored.
     */
    public function ignoreCaseInOrderBy($in)
    {
        return $this->ignoreCase($in);
    }

    /**
     * Returns SQL which concatenates the second string to the first.
     *
     * @param string $s1 String to concatenate.
     * @param string $s2 String to append.
     *
     * @return string
     */
    abstract public function concatString($s1, $s2);

    /**
     * Returns SQL which extracts a substring.
     *
     * @param string  $s   String to extract from.
     * @param integer $pos Offset to start from.
     * @param integer $len Number of characters to extract.
     *
     * @return string
     */
    abstract public function subString($s, $pos, $len);

    /**
     * Returns SQL which calculates the length (in chars) of a string.
     *
     * @param  string $s String to calculate length of.
     * @return string
     */
    abstract public function strLength($s);

    /**
     * Quotes database objec identifiers (table names, col names, sequences, etc.).
     * @param  string $text The identifier to quote.
     * @return string The quoted identifier.
     */
    public function quoteIdentifier($text)
    {
        return '"' . $text . '"';
    }

    /**
     * Quotes a database table which could have space seperating it from an alias, both should be identified seperately
     * This doesn't take care of dots which separate schema names from table names. Adapters for RDBMs which support
     * schemas have to implement that in the platform-specific way.
     *
     * @param  string $table The table name to quo
     * @return string The quoted table name
     **/
    public function quoteIdentifierTable($table)
    {
        return implode(" ", array_map(array($this, "quoteIdentifier"), explode(" ", $table) ) );
    }

    /**
     * Returns the native ID method for this RDBMS.
     *
     * @return integer One of DBAdapter:ID_METHOD_SEQUENCE, DBAdapter::ID_METHOD_AUTOINCREMENT.
     */
    protected function getIdMethod()
    {
        return DBAdapter::ID_METHOD_AUTOINCREMENT;
    }

    /**
     * Whether this adapter uses an ID generation system that requires getting ID _before_ performing INSERT.
     *
     * @return boolean
     */
    public function isGetIdBeforeInsert()
    {
        return ($this->getIdMethod() === DBAdapter::ID_METHOD_SEQUENCE);
    }

    /**
     * Whether this adapter uses an ID generation system that requires getting ID _before_ performing INSERT.
     *
     * @return boolean
     */
    public function isGetIdAfterInsert()
    {
        return ($this->getIdMethod() === DBAdapter::ID_METHOD_AUTOINCREMENT);
    }

    /**
     * Gets the generated ID (either last ID for autoincrement or next sequence ID).
     * Warning: duplicates logic from DefaultPlatform::getIdentifierPhp().
     * Any code modification here must be ported there.
     *
     * @param PDO    $con
     * @param string $name
     *
     * @return mixed
     */
    public function getId(PDO $con, $name = null)
    {
        return $con->lastInsertId($name);
    }

    /**
     * Formats a temporal value brefore binding, given a ColumnMap object.
     *
     * @param mixed $value The temporal value
     * @param mixed $type  PropelColumnTypes constant, or ColumnMap object
     *
     * @return string The formatted temporal value
     */
    public function formatTemporalValue($value, $type)
    {
        /** @var $dt PropelDateTime */
        if ($dt = PropelDateTime::newInstance($value)) {
            if ($type instanceof ColumnMap) {
                $type = $type->getType();
            }
            switch ($type) {
                case PropelColumnTypes::TIMESTAMP:
                case PropelColumnTypes::BU_TIMESTAMP:
                    $value = $dt->format($this->getTimestampFormatter());
                    break;
                case PropelColumnTypes::DATE:
                case PropelColumnTypes::BU_DATE:
                    $value = $dt->format($this->getDateFormatter());
                    break;
                case PropelColumnTypes::TIME:
                    $value = $dt->format($this->getTimeFormatter());
                    break;
            }
        }

        return $value;
    }

    /**
     * Returns timestamp formatter string for use in date() function.
     *
     * @return string
     */
    public function getTimestampFormatter()
    {
        return 'Y-m-d H:i:s';
    }

    /**
     * Returns date formatter string for use in date() function.
     *
     * @return string
     */
    public function getDateFormatter()
    {
        return "Y-m-d";
    }

    /**
     * Returns time formatter string for use in date() function.
     *
     * @return string
     */
    public function getTimeFormatter()
    {
        return "H:i:s";
    }

    /**
     * Should Column-Names get identifiers for inserts or updates.
     * By default false is returned -> backwards compability.
     *
     * it`s a workaround...!!!
     *
     * @todo       should be abstract
     * @deprecated
     *
     * @return boolean
     */
    public function useQuoteIdentifier()
    {
        return false;
    }

    /**
     * Allows manipulation of the query string before PDOStatement is instantiated.
     *
     * @param string      $sql    The sql statement
     * @param array       $params array('column' => ..., 'table' => ..., 'value' => ...)
     * @param Criteria    $values
     * @param DatabaseMap $dbMap
     */
    public function cleanupSQL(&$sql, array &$params, Criteria $values, DatabaseMap $dbMap)
    {
    }

    /**
     * Modifies the passed-in SQL to add LIMIT and/or OFFSET.
     *
     * @param string  $sql
     * @param integer $offset
     * @param integer $limit
     */
    abstract public function applyLimit(&$sql, $offset, $limit);

    /**
     * Gets the SQL string that this adapter uses for getting a random number.
     *
     * @param mixed $seed (optional) seed value for databases that support this
     */
    abstract public function random($seed = null);

    /**
     * Returns the "DELETE FROM <table> [AS <alias>]" part of DELETE query.
     *
     * @param Criteria $criteria
     * @param string   $tableName
     *
     * @return string
     */
    public function getDeleteFromClause($criteria, $tableName)
    {
        $sql = 'DELETE ';
        if ($queryComment = $criteria->getComment()) {
            $sql .= '/* ' . $queryComment . ' */ ';
        }
        if ($realTableName = $criteria->getTableForAlias($tableName)) {
            if ($this->useQuoteIdentifier()) {
                $realTableName = $this->quoteIdentifierTable($realTableName);
            }
            $sql .= $tableName . ' FROM ' . $realTableName . ' AS ' . $tableName;
        } else {
            if ($this->useQuoteIdentifier()) {
                $tableName = $this->quoteIdentifierTable($tableName);
            }
            $sql .= 'FROM ' . $tableName;
        }

        return $sql;
    }

    /**
     * Builds the SELECT part of a SQL statement based on a Criteria
     * taking into account select columns and 'as' columns (i.e. columns aliases)
     * Move from BasePeer to DBAdapter and turn from static to non static
     *
     * @param Criteria $criteria
     * @param array    $fromClause
     * @param boolean  $aliasAll
     *
     * @return string
     */
    public function createSelectSqlPart(Criteria $criteria, &$fromClause, $aliasAll = false)
    {
        $selectClause = array();

        if ($aliasAll) {
            $this->turnSelectColumnsToAliases($criteria);
            // no select columns after that, they are all aliases
        } else {
            foreach ($criteria->getSelectColumns() as $columnName) {

                // expect every column to be of "table.column" formation
                // it could be a function:  e.g. MAX(books.price)

                $tableName = null;

                $selectClause[] = $columnName; // the full column name: e.g. MAX(books.price)

                $parenPos = strrpos($columnName, '(');
                $dotPos = strrpos($columnName, '.', ($parenPos !== false ? $parenPos : 0));

                if ($dotPos !== false) {
                    if ($parenPos === false) { // table.column
                        $tableName = substr($columnName, 0, $dotPos);
                    } else { // FUNC(table.column)
                        // functions may contain qualifiers so only take the last
                        // word as the table name.
                        // COUNT(DISTINCT books.price)
                        $tableName = substr($columnName, $parenPos + 1, $dotPos - ($parenPos + 1));
                        $lastSpace = strrpos($tableName, ' ');
                        if ($lastSpace !== false) { // COUNT(DISTINCT books.price)
                            $tableName = substr($tableName, $lastSpace + 1);
                        }
                    }
                    // is it a table alias?
                    $tableName2 = $criteria->getTableForAlias($tableName);
                    if ($tableName2 !== null) {
                        $fromClause[] = $tableName2 . ' ' . $tableName;
                    } else {
                        $fromClause[] = $tableName;
                    }
                } // if $dotPost !== false
            }
        }

        // set the aliases
        foreach ($criteria->getAsColumns() as $alias => $col) {
            $selectClause[] = $col . ' AS ' . $alias;
        }

        $selectModifiers = $criteria->getSelectModifiers();
        $queryComment = $criteria->getComment();

        // Build the SQL from the arrays we compiled
        $sql =  "SELECT "
            . ($queryComment ? '/* ' . $queryComment . ' */ ' : '')
            . ($selectModifiers ? (implode(' ', $selectModifiers) . ' ') : '')
            . implode(", ", $selectClause);

        return $sql;
    }

    /**
     * Ensures uniqueness of select column names by turning them all into aliases
     * This is necessary for queries on more than one table when the tables share a column name
     * Moved from BasePeer to DBAdapter and turned from static to non static
     *
     * @see http://propel.phpdb.org/trac/ticket/795
     *
     * @param  Criteria $criteria
     * @return Criteria The input, with Select columns replaced by aliases
     */
    public function turnSelectColumnsToAliases(Criteria $criteria)
    {
        $selectColumns = $criteria->getSelectColumns();
        // clearSelectColumns also clears the aliases, so get them too
        $asColumns = $criteria->getAsColumns();
        $criteria->clearSelectColumns();
        $columnAliases = $asColumns;
        // add the select columns back
        foreach ($selectColumns as $clause) {
            // Generate a unique alias
            $baseAlias = preg_replace('/\W/', '_', $clause);
            $alias = $baseAlias;
            // If it already exists, add a unique suffix
            $i = 0;
            while (isset($columnAliases[$alias])) {
                $i++;
                $alias = $baseAlias . '_' . $i;
            }
            // Add it as an alias
            $criteria->addAsColumn($alias, $clause);
            $columnAliases[$alias] = $clause;
        }
        // Add the aliases back, don't modify them
        foreach ($asColumns as $name => $clause) {
            $criteria->addAsColumn($name, $clause);
        }

        return $criteria;
    }

    /**
     * Binds values in a prepared statement.
     *
     * This method is designed to work with the BasePeer::createSelectSql() method, which creates
     * both the SELECT SQL statement and populates a passed-in array of parameter
     * values that should be substituted.
     *
     * <code>
     * $db = Propel::getDB($criteria->getDbName());
     * $sql = BasePeer::createSelectSql($criteria, $params);
     * $stmt = $con->prepare($sql);
     * $params = array();
     * $db->populateStmtValues($stmt, $params, Propel::getDatabaseMap($critera->getDbName()));
     * $stmt->execute();
     * </code>
     *
     * @param PDOStatement $stmt
     * @param array        $params array('column' => ..., 'table' => ..., 'value' => ...)
     * @param DatabaseMap  $dbMap
     */
    public function bindValues(PDOStatement $stmt, array $params, DatabaseMap $dbMap)
    {
        $position = 0;
        foreach ($params as $param) {
            $position++;
            $parameter = ':p' . $position;
            $value = $param['value'];
            if (null === $value) {
                $stmt->bindValue($parameter, null, PDO::PARAM_NULL);
                continue;
            }
            $tableName = $param['table'];
            if (null === $tableName) {
                $type = isset($param['type']) ? $param['type'] : PDO::PARAM_STR;
                $stmt->bindValue($parameter, $value, $type);
                continue;
            }
            $cMap = $dbMap->getTable($tableName)->getColumn($param['column']);
            $this->bindValue($stmt, $parameter, $value, $cMap, $position);
        }
    }

    /**
     * Binds a value to a positioned parameted in a statement,
     * given a ColumnMap object to infer the binding type.
     * Warning: duplicates logic from DefaultPlatform::getColumnBindingPHP().
     * Any code modification here must be ported there.
     *
     * @param PDOStatement $stmt      The statement to bind
     * @param string       $parameter Parameter identifier
     * @param mixed        $value     The value to bind
     * @param ColumnMap    $cMap      The ColumnMap of the column to bind
     * @param null|integer $position  The position of the parameter to bind
     *
     * @return boolean
     */
    public function bindValue(PDOStatement $stmt, $parameter, $value, ColumnMap $cMap, $position = null)
    {
        if ($cMap->isTemporal()) {
            $value = $this->formatTemporalValue($value, $cMap);
        } elseif (is_resource($value) && $cMap->isLob()) {
            // we always need to make sure that the stream is rewound, otherwise nothing will
            // get written to database.
            rewind($value);
        }

        return $stmt->bindValue($parameter, $value, $cMap->getPdoType());
    }

    /**
     * Do Explain Plan for query object or query string
     *
     * @param  PropelPDO            $con   propel connection
     * @param  ModelCriteria|string $query query the criteria or the query string
     * @throws PropelException      if explain plan is not implemented for adapter
     * @return PDOStatement         A PDO statement executed using the connection, ready to be fetched
     */
    public function doExplainPlan(PropelPDO $con, $query)
    {
        throw new PropelException("Explain plan is not implemented for this adapter");
    }
}
