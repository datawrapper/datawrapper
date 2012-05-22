<?php

/**
 * This file is part of the Propel package.
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 *
 * @license     MIT License
 */

require_once dirname(__FILE__) . '/../Index.php';

/**
 * Service class for comparing Index objects
 * Heavily inspired by Doctrine2's Migrations
 * (see http://github.com/doctrine/dbal/tree/master/lib/Doctrine/DBAL/Schema/)
 *
 * @package     propel.generator.model.diff
 */
class PropelIndexComparator
{
	/**
	 * Compute the difference between two index objects
	 *
	 * @param Index $fromIndex
	 * @param Index $toIndex
	 * @param boolean $caseInsensitive Whether the comparison is case insensitive.
	 *                                 False by default.
	 *
	 * @return boolean false if the two indices are similar, true if they have differences
	 */
	static public function computeDiff(Index $fromIndex, Index $toIndex, $caseInsensitive = false)
	{
		// Check for removed index columns in $toIndex
		$fromIndexColumns = $fromIndex->getColumns();
		for($i = 0; $i < count($fromIndexColumns); $i++) {
			$indexColumn = $fromIndexColumns[$i];
			if (!$toIndex->hasColumnAtPosition($i, $indexColumn, null, $caseInsensitive)) {
				return true;
			}
		}

		// Check for new index columns in $toIndex
		$toIndexColumns = $toIndex->getColumns();
		for($i = 0; $i < count($toIndexColumns); $i++) {
			$indexColumn = $toIndexColumns[$i];
			if (!$fromIndex->hasColumnAtPosition($i, $indexColumn, null, $caseInsensitive)) {
				return true;
			}
		}

		// Check for difference in unicity
		if ($fromIndex->isUnique() != $toIndex->isUnique()) {
			return true;
		}

		return false;
	}

}