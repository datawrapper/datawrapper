<?php

/**
 * This file is part of the Propel package.
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 *
 * @license    MIT License
 */

/**
 * Gives a model class the ability to remain in database even when the user deletes object
 * Uses an additional column storing the deletion date
 * And an additional condition for every read query to only consider rows with no deletion date
 *
 * @author     François Zaninotto
 * @version    $Revision$
 * @package    propel.generator.behavior
 */
class SoftDeleteBehavior extends Behavior
{
    // default parameters value
    protected $parameters = array(
        'deleted_column' => 'deleted_at',
    );

    /**
     * Add the deleted_column to the current table
     */
    public function modifyTable()
    {
        if (!$this->getTable()->containsColumn($this->getParameter('deleted_column'))) {
            $this->getTable()->addColumn(array(
                'name' => $this->getParameter('deleted_column'),
                'type' => 'TIMESTAMP'
            ));
        }
    }

    protected function getColumnSetter()
    {
        return 'set' . $this->getColumnForParameter('deleted_column')->getPhpName();
    }

    public function objectMethods($builder)
    {
        $this->builder = $builder;
        $script = '';
        $this->addObjectForceDelete($script);
        $this->addObjectUndelete($script);

        return $script;
    }

    public function addObjectForceDelete(&$script)
    {
        $peerClassName = $this->builder->getPeerClassname();
        $script .= "
/**
 * Bypass the soft_delete behavior and force a hard delete of the current object
 */
public function forceDelete(PropelPDO \$con = null)
{
    if (\$isSoftDeleteEnabled = {$peerClassName}::isSoftDeleteEnabled()) {
        {$peerClassName}::disableSoftDelete();
    }
    \$this->delete(\$con);
    if (\$isSoftDeleteEnabled) {
        {$peerClassName}::enableSoftDelete();
    }
}
";
    }

    public function addObjectUndelete(&$script)
    {
        $script .= "
/**
 * Undelete a row that was soft_deleted
 *
 * @return		 int The number of rows affected by this update and any referring fk objects' save() operations.
 */
public function unDelete(PropelPDO \$con = null)
{
    \$this->{$this->getColumnSetter()}(null);

    return \$this->save(\$con);
}
";
    }

    public function preDelete($builder)
    {
        $script = "if (!empty(\$ret) && {$builder->getStubQueryBuilder()->getClassname()}::isSoftDeleteEnabled()) {";

        // prevent updated_at from changing when using a timestampable behavior
        if ($this->getTable()->hasBehavior('timestampable')) {
            $script .= "
    \$this->keepUpdateDateUnchanged();";
        }

        $script .= "
    \$this->{$this->getColumnSetter()}(time());
    \$this->save(\$con);";

        if ($builder->getGeneratorConfig()->getBuildProperty('addHooks')) {
            $script .= "
    \$this->postDelete(\$con);";
        }

        $script .= "
    \$con->commit();
    {$builder->getStubPeerBuilder()->getClassname()}::removeInstanceFromPool(\$this);

    return;
}
";

        return $script;
    }

    public function queryAttributes()
    {
        return "protected static \$softDelete = true;
protected \$localSoftDelete = true;
";
    }

    public function queryMethods($builder)
    {
        $this->builder = $builder;
        $script = '';
        $this->addQueryIncludeDeleted($script);
        $this->addQuerySoftDelete($script);
        $this->addQueryForceDelete($script);
        $this->addQueryForceDeleteAll($script);
        $this->addQueryUnDelete($script);
        $this->addQueryEnableSoftDelete($script);
        $this->addQueryDisableSoftDelete($script);
        $this->addQueryIsSoftDeleteEnabled($script);

        return $script;
    }

    public function addQueryIncludeDeleted(&$script)
    {
        $script .= "
/**
 * Temporarily disable the filter on deleted rows
 * Valid only for the current query
 *
 * @see {$this->builder->getStubQueryBuilder()->getClassname()}::disableSoftDelete() to disable the filter for more than one query
 *
 * @return {$this->builder->getStubQueryBuilder()->getClassname()} The current query, for fluid interface
 */
public function includeDeleted()
{
    \$this->localSoftDelete = false;

    return \$this;
}
";
    }

    public function addQuerySoftDelete(&$script)
    {
        $script .= "
/**
 * Soft delete the selected rows
 *
 * @param			PropelPDO \$con an optional connection object
 *
 * @return		int Number of updated rows
 */
public function softDelete(PropelPDO \$con = null)
{
    return \$this->update(array('{$this->getColumnForParameter('deleted_column')->getPhpName()}' => time()), \$con);
}
";
    }

    public function addQueryForceDelete(&$script)
    {
        $script .= "
/**
 * Bypass the soft_delete behavior and force a hard delete of the selected rows
 *
 * @param			PropelPDO \$con an optional connection object
 *
 * @return		int Number of deleted rows
 */
public function forceDelete(PropelPDO \$con = null)
{
    return {$this->builder->getPeerClassname()}::doForceDelete(\$this, \$con);
}
";
    }

    public function addQueryForceDeleteAll(&$script)
    {
        $script .= "
/**
 * Bypass the soft_delete behavior and force a hard delete of all the rows
 *
 * @param			PropelPDO \$con an optional connection object
 *
 * @return		int Number of deleted rows
 */
public function forceDeleteAll(PropelPDO \$con = null)
{
    return {$this->builder->getPeerClassname()}::doForceDeleteAll(\$con);}
";
    }

    public function addQueryUnDelete(&$script)
    {
        $script .= "
/**
 * Undelete selected rows
 *
 * @param			PropelPDO \$con an optional connection object
 *
 * @return		int The number of rows affected by this update and any referring fk objects' save() operations.
 */
public function unDelete(PropelPDO \$con = null)
{
    return \$this->update(array('{$this->getColumnForParameter('deleted_column')->getPhpName()}' => null), \$con);
}
";
    }

    public function addQueryEnableSoftDelete(&$script)
    {
        $script .= "
/**
 * Enable the soft_delete behavior for this model
 */
public static function enableSoftDelete()
{
    self::\$softDelete = true;
}
";
    }

    public function addQueryDisableSoftDelete(&$script)
    {
        $script .= "
/**
 * Disable the soft_delete behavior for this model
 */
public static function disableSoftDelete()
{
    self::\$softDelete = false;
}
";
    }

    public function addQueryIsSoftDeleteEnabled(&$script)
    {
        $script .= "
/**
 * Check the soft_delete behavior for this model
 *
 * @return boolean true if the soft_delete behavior is enabled
 */
public static function isSoftDeleteEnabled()
{
    return self::\$softDelete;
}
";
    }

    public function preSelectQuery($builder)
    {
        return <<<EOT
if ({$builder->getStubQueryBuilder()->getClassname()}::isSoftDeleteEnabled() && \$this->localSoftDelete) {
    \$this->addUsingAlias({$builder->getColumnConstant($this->getColumnForParameter('deleted_column'))}, null, Criteria::ISNULL);
} else {
    {$builder->getPeerClassname()}::enableSoftDelete();
}
EOT;
    }

    public function preDeleteQuery($builder)
    {
        return <<<EOT
if ({$builder->getStubQueryBuilder()->getClassname()}::isSoftDeleteEnabled() && \$this->localSoftDelete) {
    return \$this->softDelete(\$con);
} else {
    return \$this->hasWhereClause() ? \$this->forceDelete(\$con) : \$this->forceDeleteAll(\$con);
}
EOT;
    }

    public function staticMethods($builder)
    {
        $builder->declareClassFromBuilder($builder->getStubQueryBuilder());
        $this->builder = $builder;
        $script = '';
        $this->addPeerEnableSoftDelete($script);
        $this->addPeerDisableSoftDelete($script);
        $this->addPeerIsSoftDeleteEnabled($script);
        $this->addPeerDoSoftDelete($script);
        $this->addPeerDoDelete2($script);
        $this->addPeerDoSoftDeleteAll($script);
        $this->addPeerDoDeleteAll2($script);

        return $script;
    }

    public function addPeerEnableSoftDelete(&$script)
    {
        $script .= "
/**
 * Enable the soft_delete behavior for this model
 */
public static function enableSoftDelete()
{
    {$this->builder->getStubQueryBuilder()->getClassname()}::enableSoftDelete();
    // some soft_deleted objects may be in the instance pool
    {$this->builder->getStubPeerBuilder()->getClassname()}::clearInstancePool();
}
";
    }

    public function addPeerDisableSoftDelete(&$script)
    {
        $script .= "
/**
 * Disable the soft_delete behavior for this model
 */
public static function disableSoftDelete()
{
    {$this->builder->getStubQueryBuilder()->getClassname()}::disableSoftDelete();
}
";
    }

    public function addPeerIsSoftDeleteEnabled(&$script)
    {
        $script .= "
/**
 * Check the soft_delete behavior for this model
 * @return boolean true if the soft_delete behavior is enabled
 */
public static function isSoftDeleteEnabled()
{
    return {$this->builder->getStubQueryBuilder()->getClassname()}::isSoftDeleteEnabled();
}
";
    }

    public function addPeerDoSoftDelete(&$script)
    {
        $script .= "
/**
 * Soft delete records, given a {$this->builder->getStubObjectBuilder()->getClassname()} or Criteria object OR a primary key value.
 *
 * @param			 mixed \$values Criteria or {$this->builder->getStubObjectBuilder()->getClassname()} object or primary key or array of primary keys
 *							which is used to create the DELETE statement
 * @param			 PropelPDO \$con the connection to use
 * @return		 int	The number of affected rows (if supported by underlying database driver).
 * @throws		 PropelException Any exceptions caught during processing will be
 *							rethrown wrapped into a PropelException.
 */
public static function doSoftDelete(\$values, PropelPDO \$con = null)
{
    if (\$con === null) {
        \$con = Propel::getConnection({$this->getTable()->getPhpName()}Peer::DATABASE_NAME, Propel::CONNECTION_WRITE);
    }
    if (\$values instanceof Criteria) {
        // rename for clarity
        \$selectCriteria = clone \$values;
     } elseif (\$values instanceof {$this->builder->getStubObjectBuilder()->getClassname()}) {
        // create criteria based on pk values
        \$selectCriteria = \$values->buildPkeyCriteria();
    } else {
        // it must be the primary key
        \$selectCriteria = new Criteria(self::DATABASE_NAME);";
        $pks = $this->getTable()->getPrimaryKey();
        if (count($pks)>1) {
            $i = 0;
            foreach ($pks as $col) {
                $script .= "
         \$selectCriteria->add({$this->builder->getColumnConstant($col)}, \$values[$i], Criteria::EQUAL);";
                $i++;
            }
        } else {
            $col = $pks[0];
            $script .= "
         \$selectCriteria->add({$this->builder->getColumnConstant($col)}, (array) \$values, Criteria::IN);";
        }
        $script .= "
    }
    // Set the correct dbName
    \$selectCriteria->setDbName({$this->getTable()->getPhpName()}Peer::DATABASE_NAME);
    \$updateCriteria = new Criteria(self::DATABASE_NAME);
    \$updateCriteria->add({$this->builder->getColumnConstant($this->getColumnForParameter('deleted_column'))}, time());

     return {$this->builder->getBasePeerClassname()}::doUpdate(\$selectCriteria, \$updateCriteria, \$con);
}
";
    }

    public function addPeerDoDelete2(&$script)
    {
        $script .= "
/**
 * Delete or soft delete records, depending on {$this->builder->getPeerClassname()}::\$softDelete
 *
 * @param			 mixed \$values Criteria or {$this->builder->getStubObjectBuilder()->getClassname()} object or primary key or array of primary keys
 *							which is used to create the DELETE statement
 * @param			 PropelPDO \$con the connection to use
 * @return		 int	The number of affected rows (if supported by underlying database driver).
 * @throws		 PropelException Any exceptions caught during processing will be
 *							rethrown wrapped into a PropelException.
 */
public static function doDelete2(\$values, PropelPDO \$con = null)
{
    if ({$this->builder->getPeerClassname()}::isSoftDeleteEnabled()) {
        return {$this->builder->getPeerClassname()}::doSoftDelete(\$values, \$con);
    } else {
        return {$this->builder->getPeerClassname()}::doForceDelete(\$values, \$con);
    }
}";
    }

    public function addPeerDoSoftDeleteAll(&$script)
    {
        $script .= "
/**
 * Method to soft delete all rows from the {$this->getTable()->getName()} table.
 *
 * @param			 PropelPDO \$con the connection to use
 * @return		 int The number of affected rows (if supported by underlying database driver).
 * @throws		 PropelException Any exceptions caught during processing will be
 *							rethrown wrapped into a PropelException.
 */
public static function doSoftDeleteAll(PropelPDO \$con = null)
{
    if (\$con === null) {
        \$con = Propel::getConnection({$this->builder->getPeerClassname()}::DATABASE_NAME, Propel::CONNECTION_WRITE);
    }
    \$selectCriteria = new Criteria();
    \$selectCriteria->add({$this->builder->getColumnConstant($this->getColumnForParameter('deleted_column'))}, null, Criteria::ISNULL);
    \$selectCriteria->setDbName({$this->builder->getPeerClassname()}::DATABASE_NAME);
    \$modifyCriteria = new Criteria();
    \$modifyCriteria->add({$this->builder->getColumnConstant($this->getColumnForParameter('deleted_column'))}, time());

    return BasePeer::doUpdate(\$selectCriteria, \$modifyCriteria, \$con);
}
";
    }

    public function addPeerDoDeleteAll2(&$script)
    {
        $script .= "
/**
 * Delete or soft delete all records, depending on {$this->builder->getPeerClassname()}::\$softDelete
 *
 * @param			 PropelPDO \$con the connection to use
 * @return		 int	The number of affected rows (if supported by underlying database driver).
 * @throws		 PropelException Any exceptions caught during processing will be
 *							rethrown wrapped into a PropelException.
 */
public static function doDeleteAll2(PropelPDO \$con = null)
{
    if ({$this->builder->getPeerClassname()}::isSoftDeleteEnabled()) {
        return {$this->builder->getPeerClassname()}::doSoftDeleteAll(\$con);
    } else {
        return {$this->builder->getPeerClassname()}::doForceDeleteAll(\$con);
    }
}
";
    }

    public function preSelect($builder)
    {
        return <<<EOT
if ({$builder->getStubQueryBuilder()->getClassname()}::isSoftDeleteEnabled()) {
    \$criteria->add({$builder->getColumnConstant($this->getColumnForParameter('deleted_column'))}, null, Criteria::ISNULL);
} else {
    {$builder->getPeerClassname()}::enableSoftDelete();
}
EOT;
    }

    public function peerFilter(&$script)
    {
        $script = str_replace(array(
            'public static function doDelete(',
            'public static function doDelete2(',
            'public static function doDeleteAll(',
            'public static function doDeleteAll2('
        ), array(
            'public static function doForceDelete(',
            'public static function doDelete(',
            'public static function doForceDeleteAll(',
            'public static function doDeleteAll('
        ), $script);
    }
}
