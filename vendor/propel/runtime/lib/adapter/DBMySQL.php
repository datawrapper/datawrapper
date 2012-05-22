<?php

/**
 * This file is part of the Propel package.
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 *
 * @license    MIT License
 */

/**
 * This is used in order to connect to a MySQL database.
 *
 * @author     Hans Lellelid <hans@xmpl.org> (Propel)
 * @author     Jon S. Stevens <jon@clearink.com> (Torque)
 * @author     Brett McLaughlin <bmclaugh@algx.net> (Torque)
 * @author     Daniel Rall <dlr@finemaltcoding.com> (Torque)
 * @version    $Revision$
 * @package    propel.runtime.adapter
 */
class DBMySQL extends DBAdapter
{
	/**
	 * This method is used to ignore case.
	 *
	 * @param     string  $in  The string to transform to upper case.
	 * @return    string  The upper case string.
	 */
	public function toUpperCase($in)
	{
		return "UPPER(" . $in . ")";
	}

	/**
	 * This method is used to ignore case.
	 *
	 * @param     string  $in  The string whose case to ignore.
	 * @return    string  The string in a case that can be ignored.
	 */
	public function ignoreCase($in)
	{
		return "UPPER(" . $in . ")";
	}

	/**
	 * Returns SQL which concatenates the second string to the first.
	 *
	 * @param     string  $s1  String to concatenate.
	 * @param     string  $s2  String to append.
	 *
	 * @return    string
	 */
	public function concatString($s1, $s2)
	{
		return "CONCAT($s1, $s2)";
	}

	/**
	 * Returns SQL which extracts a substring.
	 *
	 * @param     string   $s  String to extract from.
	 * @param     integer  $pos  Offset to start from.
	 * @param     integer  $len  Number of characters to extract.
	 *
	 * @return    string
	 */
	public function subString($s, $pos, $len)
	{
		return "SUBSTRING($s, $pos, $len)";
	}

	/**
	 * Returns SQL which calculates the length (in chars) of a string.
	 *
	 * @param     string  $s  String to calculate length of.
	 * @return    string
	 */
	public function strLength($s)
	{
		return "CHAR_LENGTH($s)";
	}


	/**
	 * Locks the specified table.
	 *
	 * @param     PDO     $con  The Propel connection to use.
	 * @param     string  $table  The name of the table to lock.
	 *
	 * @throws    PDOException  No Statement could be created or executed.
	 */
	public function lockTable(PDO $con, $table)
	{
		$con->exec("LOCK TABLE " . $table . " WRITE");
	}

	/**
	 * Unlocks the specified table.
	 *
	 * @param     PDO     $con  The PDO connection to use.
	 * @param     string  $table  The name of the table to unlock.
	 *
	 * @throws    PDOException  No Statement could be created or executed.
	 */
	public function unlockTable(PDO $con, $table)
	{
		$statement = $con->exec("UNLOCK TABLES");
	}

	/**
	 * @see       DBAdapter::quoteIdentifier()
	 *
	 * @param     string  $text
	 * @return    string
	 */
	public function quoteIdentifier($text)
	{
		return '`' . $text . '`';
	}

	/**
	 * @see       DBAdapter::quoteIdentifierTable()
	 *
	 * @param     string  $table
	 * @return    string
	 */
	public function quoteIdentifierTable($table)
	{
		// e.g. 'database.table alias' should be escaped as '`database`.`table` `alias`'
		return '`' . strtr($table, array('.' => '`.`', ' ' => '` `')) . '`';
	}

	/**
	 * @see       DBAdapter::useQuoteIdentifier()
	 *
	 * @return    boolean
	 */
	public function useQuoteIdentifier()
	{
		return true;
	}

	/**
	 * @see       DBAdapter::applyLimit()
	 *
	 * @param     string   $sql
	 * @param     integer  $offset
	 * @param     integer  $limit
	 */
	public function applyLimit(&$sql, $offset, $limit)
	{
		if ( $limit > 0 ) {
			$sql .= " LIMIT " . ($offset > 0 ? $offset . ", " : "") . $limit;
		} else if ( $offset > 0 ) {
			$sql .= " LIMIT " . $offset . ", 18446744073709551615";
		}
	}

	/**
	 * @see       DBAdapter::random()
	 *
	 * @param     string  $seed
	 * @return    string
	 */
	public function random($seed = null)
	{
		return 'rand('.((int) $seed).')';
	}

	/**
	 * @see       DBAdapter::bindValue()
	 *
	 * @param     PDOStatement  $stmt
	 * @param     string        $parameter
	 * @param     mixed         $value
	 * @param     ColumnMap     $cMap
	 * @param     null|integer  $position
	 *
	 * @return    boolean
	 */
	public function bindValue(PDOStatement $stmt, $parameter, $value, ColumnMap $cMap, $position = null)
	{
		$pdoType = $cMap->getPdoType();
		// FIXME - This is a temporary hack to get around apparent bugs w/ PDO+MYSQL
		// See http://pecl.php.net/bugs/bug.php?id=9919
		if ($pdoType == PDO::PARAM_BOOL) {
			$value = (int) $value;
			$pdoType = PDO::PARAM_INT;
			return $stmt->bindValue($parameter, $value, $pdoType);
		} elseif ($cMap->isTemporal()) {
			$value = $this->formatTemporalValue($value, $cMap);
		} elseif (is_resource($value) && $cMap->isLob()) {
			// we always need to make sure that the stream is rewound, otherwise nothing will
			// get written to database.
			rewind($value);
		}

		return $stmt->bindValue($parameter, $value, $pdoType);
	}

	/**
	 * Prepare connection parameters.
	 * See: http://www.propelorm.org/ticket/1360
	 *
	 * @param array	$params
	 * @return array
	 */
	public function prepareParams($params)
	{
		$params = parent::prepareParams($params);
		// Whitelist based on https://bugs.php.net/bug.php?id=47802
		// And https://bugs.php.net/bug.php?id=47802
		$whitelist = array(
			'ASCII',
			'CP1250',
			'CP1251',
			'CP1252',
			'CP1256',
			'CP1257',
			'GREEK',
			'HEBREW',
			'LATIN1',
			'LATIN2',
			'LATIN5',
			'LATIN7',
			'SWE7',
			'UTF8',
			'UTF-8',
		);

		if(isset($params['settings']['charset']['value'])) {
			if(version_compare(PHP_VERSION, '5.3.6', '<')) {
				$charset = strtoupper($params['settings']['charset']['value']);

				if (!in_array($charset, $whitelist)) {
					throw new PropelException(<<<EXCEPTION
Connection option "charset" cannot be used for MySQL connections in PHP versions older than 5.3.6.
	Please refer to http://www.propelorm.org/ticket/1360 for instructions and details about the implications of
	using a SET NAMES statement in the "queries" setting.
EXCEPTION
				);
				}
			} else {
				if(strpos($params['dsn'], ';charset=') === false) {
					$params['dsn'] .= ';charset=' . $params['settings']['charset']['value'];
					unset($params['settings']['charset']);
				}
			}
		}

		return $params;
	}

	/**
	 * Do Explain Plan for query object or query string
	 *
	 * @param PropelPDO $con propel connection
	 * @param ModelCriteria|string $query query the criteria or the query string
	 * @throws PropelException
	 * @return PDOStatement A PDO statement executed using the connection, ready to be fetched
	 */
	public function doExplainPlan(PropelPDO $con, $query)
	{
		if ($query instanceof ModelCriteria) {
			$params = array();
			$dbMap = Propel::getDatabaseMap($query->getDbName());
			$sql = BasePeer::createSelectSql($query, $params);
			$sql = 'EXPLAIN ' . $sql;
		} else {
			$sql = 'EXPLAIN ' . $query;
		}

		$stmt = $con->prepare($sql);

		if ($query instanceof ModelCriteria) {
			$this->bindValues($stmt, $params, $dbMap);
		}

		$stmt->execute();

		return $stmt;
	}
}