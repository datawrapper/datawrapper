<?php

/**
 * This file is part of the Propel package.
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 *
 * @license    MIT License
 */

/**
 * Moves objects to the end of null scope of related table
 *
 * @author     rozwell
 * @version    $Revision$
 * @package    propel.generator.behavior.sortable
 */
class SortableRelationBehavior extends Behavior
{
    protected $builder;
    protected $name = 'sortable_relation';
    // default parameters value
    protected $parameters = array(
        'foreign_table'        => '',
        'foreign_scope_column' => '',
        'foreign_rank_column'  => '',
    );

    public function objectMethods($builder)
    {
        $script = '';
        $this->addObjectMoveRelatedToNullScope($script);

        return $script;
    }

    public function preDelete($builder)
    {
        $this->builder = $builder;

        $script = "\$this->{$this->getObjectMoveRelatedToNullScopeMethodName()}(\$con);
";
        return $script;
    }

    protected function getForeignTable()
    {
        return $this->getTable()->getDatabase()->getTable($this->getParameter('foreign_table'));
    }

    protected function getForeignColumnForParameter($param)
    {
        return $this->getForeignTable()->getColumn($this->getParameter($param));
    }

    protected function getRelatedClassPluralForm()
    {
        $relatedClass = $this->getForeignTable()->getPhpName();
        return $this->builder->getPluralizer()->getPluralForm($relatedClass);
    }

    protected function getObjectMoveRelatedToNullScopeMethodName()
    {

        return "moveRelated{$this->getRelatedClassPluralForm()}ToNullScope";
    }

    protected function addObjectMoveRelatedToNullScope(&$script)
    {
        $peerClass = $this->builder->getNewStubPeerBuilder($this->getForeignTable())->getClassname();
        $queryClass = $this->builder->getNewStubQueryBuilder($this->getForeignTable())->getClassname();

        $script .= "
/**
 * Moves related {$this->getRelatedClassPluralForm()} to null scope
 * @param PropelPDO \$con A connection object
 */
public function {$this->getObjectMoveRelatedToNullScopeMethodName()}(PropelPDO \$con = null)
{
    \$maxRank = $queryClass::create()->getMaxRank(\$this->getPrimaryKey(), \$con);
    if (null !== \$maxRank) { // getMaxRank() returns null for empty tables
        $peerClass::shiftRank(\$maxRank, null, null, \$this->getPrimaryKey(), \$con);
    }
}
";

        return $script;
    }

}
