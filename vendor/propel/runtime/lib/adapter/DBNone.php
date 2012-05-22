<?php

/**
 * This file is part of the Propel package.
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 *
 * @license    MIT License
 */

/**
 * This adapter  is used when you do not have a database installed.
 *
 * @author     Hans Lellelid <hans@xmpl.org> (Propel)
 * @author     Jon S. Stevens <jon@clearink.com> (Torque)
 * @author     Brett McLaughlin <bmclaugh@algx.net> (Torque)
 * @version    $Revision$
 * @package    propel.runtime.adapter
 */
class DBNone extends DBAdapter
{

	/**
	 * @see        DBAdapter::initConnection()
	 *
	 * @param     PDO    $con
	 * @param     array  $settings
	 */
	public function initConnection(PDO $con, array $settings)
	{
	}

	/**
	 * This method is used to ignore case.
	 *
	 * @param     string  $in  The string to transform to upper case.
	 * @return    string  The upper case string.
	 */
	public function toUpperCase($in)
	{
		return $in;
	}

	/**
	 * This method is used to ignore case.
	 *
	 * @param     string  $in  The string whose case to ignore.
	 * @return    string  The string in a case that can be ignored.
	 */
	public function ignoreCase($in)
	{
		return $in;
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
		return ($s1 . $s2);
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
		return substr($s, $pos, $len);
	}

	/**
	 * Returns SQL which calculates the length (in chars) of a string.
	 *
	 * @param     string  $s  String to calculate length of.
	 * @return    string
	 */
	public function strLength($s)
	{
		return strlen($s);
	}

	/**
	 * Modifies the passed-in SQL to add LIMIT and/or OFFSET.
	 *
	 * @param     string   $sql
	 * @param     integer  $offset
	 * @param     integer  $limit
	 */
	public function applyLimit(&$sql, $offset, $limit)
	{
	}

	/**
	 * Gets the SQL string that this adapter uses for getting a random number.
	 *
	 * @param     string  $seed (optional) seed value for databases that support this
	 */
	public function random($seed = null)
	{
	}
}
