<?php

/**
 * This file is part of the Propel package.
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 *
 * @license    MIT License
 */

/**
 * Speeds up queries on a model by caching the query
 *
 * @author     François Zaninotto
 * @version    $Revision$
 * @package    propel.generator.behavior.cacheable
 */
class QueryCacheBehavior extends Behavior
{
	// default parameters value
	protected $parameters = array(
		'backend'     => 'apc',
		'lifetime'    => 3600,
	);

	public function queryAttributes($builder)
	{
		$script = "protected \$queryKey = '';
";
		switch ($this->getParameter('backend')) {
			case 'backend':
				$script .= "protected static \$cacheBackend = array();
			";
				break;
			case 'apc':
				break;
			case 'custom':
			default:
				$script .= "protected static \$cacheBackend;
			";
				break;
		}

		return $script;
	}

	public function queryMethods($builder)
	{
		$builder->declareClasses('BasePeer');
		$this->peerClassname = $builder->getStubPeerBuilder()->getClassname();
		$script = '';
		$this->addSetQueryKey($script);
		$this->addGetQueryKey($script);
		$this->addCacheContains($script);
		$this->addCacheFetch($script);
		$this->addCacheStore($script);
		$this->addDoSelect($script);
		$this->addDoCount($script);

		return $script;
	}

	protected function addSetQueryKey(&$script)
	{
		$script .= "
public function setQueryKey(\$key)
{
	\$this->queryKey = \$key;
	return \$this;
}
";
	}

	protected function addGetQueryKey(&$script)
	{
		$script .= "
public function getQueryKey()
{
	return \$this->queryKey;
}
";
	}

	protected function addCacheContains(&$script)
	{
		$script .= "
public function cacheContains(\$key)
{";
		switch ($this->getParameter('backend')) {
			case 'apc':
				$script .= "
	return apc_fetch(\$key);";
				break;
			case 'array':
				$script .= "
	return isset(self::\$cacheBackend[\$key]);";
				break;
			case 'custom':
			default:
				$script .= "
	throw new PropelException('You must override the cacheContains(), cacheStore(), and cacheFetch() methods to enable query cache');";
				break;

		}
		$script .= "
}
";
	}

	protected function addCacheStore(&$script)
	{
		$script .= "
public function cacheStore(\$key, \$value, \$lifetime = " .$this->getParameter('lifetime') . ")
{";
		switch ($this->getParameter('backend')) {
			case 'apc':
				$script .= "
	apc_store(\$key, \$value, \$lifetime);";
				break;
			case 'array':
				$script .= "
	self::\$cacheBackend[\$key] = \$value;";
				break;
			case 'custom':
			default:
				$script .= "
	throw new PropelException('You must override the cacheContains(), cacheStore(), and cacheFetch() methods to enable query cache');";
				break;
		}
		$script .= "
}
";
	}

	protected function addCacheFetch(&$script)
	{
		$script .= "
public function cacheFetch(\$key)
{";
		switch ($this->getParameter('backend')) {
			case 'apc':
				$script .= "
	return apc_fetch(\$key);";
				break;
			case 'array':
				$script .= "
	return isset(self::\$cacheBackend[\$key]) ? self::\$cacheBackend[\$key] : null;";
				break;
			case 'custom':
			default:
				$script .= "
	throw new PropelException('You must override the cacheContains(), cacheStore(), and cacheFetch() methods to enable query cache');";
				break;
		}
		$script .= "
}
";
	}

	protected function addDoSelect(&$script)
	{
		$script .= "
protected function doSelect(\$con)
{
	// check that the columns of the main class are already added (if this is the primary ModelCriteria)
	if (!\$this->hasSelectClause() && !\$this->getPrimaryCriteria()) {
		\$this->addSelfSelectColumns();
	}
	\$this->configureSelectColumns();

	\$dbMap = Propel::getDatabaseMap(" . $this->peerClassname ."::DATABASE_NAME);
	\$db = Propel::getDB(" . $this->peerClassname ."::DATABASE_NAME);

	\$key = \$this->getQueryKey();
	if (\$key && \$this->cacheContains(\$key)) {
		\$params = \$this->getParams();
		\$sql = \$this->cacheFetch(\$key);
	} else {
		\$params = array();
		\$sql = BasePeer::createSelectSql(\$this, \$params);
		if (\$key) {
			\$this->cacheStore(\$key, \$sql);
		}
	}

	try {
		\$stmt = \$con->prepare(\$sql);
		\$db->bindValues(\$stmt, \$params, \$dbMap);
		\$stmt->execute();
		} catch (Exception \$e) {
			Propel::log(\$e->getMessage(), Propel::LOG_ERR);
			throw new PropelException(sprintf('Unable to execute SELECT statement [%s]', \$sql), \$e);
		}

	return \$stmt;
}
";
	}

	protected function addDoCount(&$script)
	{
		$script .= "
protected function doCount(\$con)
{
	\$dbMap = Propel::getDatabaseMap(\$this->getDbName());
	\$db = Propel::getDB(\$this->getDbName());

	\$key = \$this->getQueryKey();
	if (\$key && \$this->cacheContains(\$key)) {
		\$params = \$this->getParams();
		\$sql = \$this->cacheFetch(\$key);
	} else {
		// check that the columns of the main class are already added (if this is the primary ModelCriteria)
		if (!\$this->hasSelectClause() && !\$this->getPrimaryCriteria()) {
			\$this->addSelfSelectColumns();
		}

		\$this->configureSelectColumns();

		\$needsComplexCount = \$this->getGroupByColumns()
			|| \$this->getOffset()
			|| \$this->getLimit()
			|| \$this->getHaving()
			|| in_array(Criteria::DISTINCT, \$this->getSelectModifiers());

		\$params = array();
		if (\$needsComplexCount) {
			if (BasePeer::needsSelectAliases(\$this)) {
				if (\$this->getHaving()) {
					throw new PropelException('Propel cannot create a COUNT query when using HAVING and  duplicate column names in the SELECT part');
				}
				\$db->turnSelectColumnsToAliases(\$this);
			}
			\$selectSql = BasePeer::createSelectSql(\$this, \$params);
			\$sql = 'SELECT COUNT(*) FROM (' . \$selectSql . ') propelmatch4cnt';
		} else {
			// Replace SELECT columns with COUNT(*)
			\$this->clearSelectColumns()->addSelectColumn('COUNT(*)');
			\$sql = BasePeer::createSelectSql(\$this, \$params);
		}

		if (\$key) {
			\$this->cacheStore(\$key, \$sql);
		}
	}

	try {
		\$stmt = \$con->prepare(\$sql);
		\$db->bindValues(\$stmt, \$params, \$dbMap);
		\$stmt->execute();
	} catch (Exception \$e) {
		Propel::log(\$e->getMessage(), Propel::LOG_ERR);
		throw new PropelException(sprintf('Unable to execute COUNT statement [%s]', \$sql), \$e);
	}

	return \$stmt;
}
";
	}

}
