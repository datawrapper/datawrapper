<?php

/**
 * This file is part of the Propel package.
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 *
 * @license    MIT License
 */

/**
 * Gives a model class the ability to track creation and last modification dates
 * Uses two additional columns storing the creation and update date
 *
 * @author     François Zaninotto
 * @version    $Revision$
 * @package    propel.generator.behavior
 */
class TimestampableBehavior extends Behavior
{
    // default parameters value
    protected $parameters = array(
        'create_column'      => 'created_at',
        'update_column'      => 'updated_at',
        'disable_updated_at' => 'false',
    );

    /**
     * Add the create_column and update_columns to the current table
     */
    public function modifyTable()
    {
        if (!$this->getTable()->containsColumn($this->getParameter('create_column'))) {
            $this->getTable()->addColumn(array(
                'name' => $this->getParameter('create_column'),
                'type' => 'TIMESTAMP'
            ));
        }

        if ($this->withUpdatedAt()) {
            if (!$this->getTable()->containsColumn($this->getParameter('update_column'))) {
                $this->getTable()->addColumn(array(
                    'name' => $this->getParameter('update_column'),
                    'type' => 'TIMESTAMP'
                ));
            }
        }
    }

    /**
     * Get the setter of one of the columns of the behavior
     *
     * @param  string $column One of the behavior colums, 'create_column' or 'update_column'
     * @return string The related setter, 'setCreatedOn' or 'setUpdatedOn'
     */
    protected function getColumnSetter($column)
    {
        return 'set' . $this->getColumnForParameter($column)->getPhpName();
    }

    protected function getColumnConstant($columnName, $builder)
    {
        return $builder->getColumnConstant($this->getColumnForParameter($columnName));
    }

    /**
     * Add code in ObjectBuilder::preUpdate
     *
     * @return string The code to put at the hook
     */
    public function preUpdate($builder)
    {
        if ($this->withUpdatedAt()) {
            return "if (\$this->isModified() && !\$this->isColumnModified(" . $this->getColumnConstant('update_column', $builder) . ")) {
    \$this->" . $this->getColumnSetter('update_column') . "(time());
}";
        }
    }

    /**
     * Add code in ObjectBuilder::preInsert
     *
     * @return string The code to put at the hook
     */
    public function preInsert($builder)
    {
        $script = "if (!\$this->isColumnModified(" . $this->getColumnConstant('create_column', $builder) . ")) {
    \$this->" . $this->getColumnSetter('create_column') . "(time());
}";

        if ($this->withUpdatedAt()) {
            $script .= "
if (!\$this->isColumnModified(" . $this->getColumnConstant('update_column', $builder) . ")) {
    \$this->" . $this->getColumnSetter('update_column') . "(time());
}";
        }

        return $script;
    }

    public function objectMethods($builder)
    {
        if ($this->withUpdatedAt()) {
            return "
/**
 * Mark the current object so that the update date doesn't get updated during next save
 *
 * @return     " . $builder->getStubObjectBuilder()->getClassname() . " The current object (for fluent API support)
 */
public function keepUpdateDateUnchanged()
{
    \$this->modifiedColumns[] = " . $this->getColumnConstant('update_column', $builder) . ";

    return \$this;
}
";
        }
    }

    public function queryMethods($builder)
    {
        $script = '';

        $queryClassName		  = $builder->getStubQueryBuilder()->getClassname();
        $createColumnConstant = $this->getColumnConstant('create_column', $builder);

        if ($this->withUpdatedAt()) {
            $updateColumnConstant = $this->getColumnConstant('update_column', $builder);

            $script .= "
/**
 * Filter by the latest updated
 *
 * @param      int \$nbDays Maximum age of the latest update in days
 *
 * @return     $queryClassName The current query, for fluid interface
 */
public function recentlyUpdated(\$nbDays = 7)
{
    return \$this->addUsingAlias($updateColumnConstant, time() - \$nbDays * 24 * 60 * 60, Criteria::GREATER_EQUAL);
}

/**
 * Order by update date desc
 *
 * @return     $queryClassName The current query, for fluid interface
 */
public function lastUpdatedFirst()
{
    return \$this->addDescendingOrderByColumn($updateColumnConstant);
}

/**
 * Order by update date asc
 *
 * @return     $queryClassName The current query, for fluid interface
 */
public function firstUpdatedFirst()
{
    return \$this->addAscendingOrderByColumn($updateColumnConstant);
}
";
        }

        $script .= "
/**
 * Filter by the latest created
 *
 * @param      int \$nbDays Maximum age of in days
 *
 * @return     $queryClassName The current query, for fluid interface
 */
public function recentlyCreated(\$nbDays = 7)
{
    return \$this->addUsingAlias($createColumnConstant, time() - \$nbDays * 24 * 60 * 60, Criteria::GREATER_EQUAL);
}

/**
 * Order by create date desc
 *
 * @return     $queryClassName The current query, for fluid interface
 */
public function lastCreatedFirst()
{
    return \$this->addDescendingOrderByColumn($createColumnConstant);
}

/**
 * Order by create date asc
 *
 * @return     $queryClassName The current query, for fluid interface
 */
public function firstCreatedFirst()
{
    return \$this->addAscendingOrderByColumn($createColumnConstant);
}";

        return $script;
    }

    protected function withUpdatedAt()
    {
        return 'true' !== $this->getParameter('disable_updated_at');
    }
}
