<?php



/**
 * Skeleton subclass for representing a row from the 'auth_token' table.
 *
 *
 *
 * You should add additional methods to this class to meet the
 * application requirements.  This class will only be generated as
 * long as it does not already exist in the output directory.
 *
 * @package    propel.generator.datawrapper
 */
class AuthToken extends BaseAuthToken
{
	public function use() {
		$this->setLastUsedAt(time());
		$this->save();
	}
}
