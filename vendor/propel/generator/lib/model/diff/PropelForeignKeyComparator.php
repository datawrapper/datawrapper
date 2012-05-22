<?php

/**
 * This file is part of the Propel package.
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 *
 * @license     MIT License
 */

require_once dirname(__FILE__) . '/../ForeignKey.php';

/**
 * Service class for comparing ForeignKey objects
 * Heavily inspired by Doctrine2's Migrations
 * (see http://github.com/doctrine/dbal/tree/master/lib/Doctrine/DBAL/Schema/)
 *
 * @package     propel.generator.model.diff
 */
class PropelForeignKeyComparator
{
	/**
	 * Compute the difference between two Foreign key objects
	 *
	 * @param ForeignKey $fromFk
	 * @param ForeignKey $toFk
	 *
	 * @param boolean $caseInsensitive Whether the comparison is case insensitive.
	 *                                 False by default.
	 *
	 * @return boolean false if the two fks are similar, true if they have differences
	 */
	static public function computeDiff(ForeignKey $fromFk, ForeignKey $toFk, $caseInsensitive = false)
	{
		// Check for differences in local and remote table
		$test = $caseInsensitive ?
			strtolower($fromFk->getTableName()) != strtolower($toFk->getTableName()) :
			$fromFk->getTableName() != $toFk->getTableName();
		if ($test) {
			return true;
		}
		$test = $caseInsensitive ?
			strtolower($fromFk->getForeignTableName()) != strtolower($toFk->getForeignTableName()) :
			$fromFk->getForeignTableName() != $toFk->getForeignTableName();
		if ($test) {
			return true;
		}

		// compare columns
		$fromFkLocalColumns = $fromFk->getLocalColumns();
		sort($fromFkLocalColumns);
		$toFkLocalColumns = $toFk->getLocalColumns();
		sort($toFkLocalColumns);
		if (array_map('strtolower', $fromFkLocalColumns) != array_map('strtolower', $toFkLocalColumns)) {
			return true;
		}
		$fromFkForeignColumns = $fromFk->getForeignColumns();
		sort($fromFkForeignColumns);
		$toFkForeignColumns = $toFk->getForeignColumns();
		sort($toFkForeignColumns);
		if (array_map('strtolower', $fromFkForeignColumns) != array_map('strtolower', $toFkForeignColumns)) {
			return true;
		}

		// compare on
		if ($fromFk->normalizeFKey($fromFk->getOnUpdate()) != $toFk->normalizeFKey($toFk->getOnUpdate())) {
			return true;
		}
		if ($fromFk->normalizeFKey($fromFk->getOnDelete()) != $toFk->normalizeFKey($toFk->getOnDelete())) {
			return true;
		}

		// compare skipSql
		if ($fromFk->isSkipSql() != $toFk->isSkipSql()) {
			return true;
		}

		return false;
	}

}