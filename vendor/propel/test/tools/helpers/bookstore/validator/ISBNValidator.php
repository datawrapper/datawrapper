<?php

/**
 * This file is part of the Propel package.
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 *
 * @license    MIT License
 */

/**
 * A custom validator for ISBN.
 *
 * @author     Hans Lellelid <hans@xmpl.org>
 * @version    $Revision$
 * @package    propel.validator
 */
class ISBNValidator implements BasicValidator
{
	const NOT_ISBN_REGEXP = '/[^0-9A-Z]/';

	/**
	 * Whether the passed string matches regular expression.
	 */
	public function isValid (ValidatorMap $map, $str)
	{
		return !(preg_match(self::NOT_ISBN_REGEXP, $str));
	}
}
