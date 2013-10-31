<?php

/**
 * This file is part of the Propel package.
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 *
 * @license    MIT License
 */

require_once dirname(__FILE__) . '/SortableBehaviorObjectBuilderModifier.php';
require_once dirname(__FILE__) . '/SortableBehaviorQueryBuilderModifier.php';
require_once dirname(__FILE__) . '/SortableBehaviorPeerBuilderModifier.php';
require_once dirname(__FILE__) . '/SortableRelationBehavior.php';

/**
 * Gives a model class the ability to be ordered
 * Uses one additional column storing the rank
 *
 * @author      Massimiliano Arione
 * @author      rozwell
 * @version     $Revision$
 * @package     propel.generator.behavior.sortable
 */
class SortableBehavior extends Behavior
{
    // default parameters value
    protected $parameters = array(
        'rank_column'  => 'sortable_rank',
        'use_scope'    => 'false',
        'scope_column' => 'sortable_scope',
    );

    protected $objectBuilderModifier, $queryBuilderModifier, $peerBuilderModifier;

    /**
     * Add the rank_column to the current table
     */
    public function modifyTable()
    {
        $table = $this->getTable();

        if (!$table->containsColumn($this->getParameter('rank_column'))) {
            $table->addColumn(array(
                'name' => $this->getParameter('rank_column'),
                'type' => 'INTEGER'
            ));
        }
        if ($this->useScope() &&
             !$table->containsColumn($this->getParameter('scope_column'))) {
            $table->addColumn(array(
                'name' => $this->getParameter('scope_column'),
                'type' => 'INTEGER'
            ));
        }

        if ($this->useScope()) {
            $keys = $table->getColumnForeignKeys($this->getParameter('scope_column'));
            foreach ($keys as $key) {
                if ($key->isForeignPrimaryKey() && $key->getOnDelete() == ForeignKey::SETNULL) {
                    $foreignTable = $key->getForeignTable();
                    $relationBehavior = new SortableRelationBehavior();
                    $relationBehavior->addParameter(array('name' => 'foreign_table', 'value' => $table->getName()));
                    $relationBehavior->addParameter(array('name' => 'foreign_scope_column', 'value' => $this->getParameter('scope_column')));
                    $relationBehavior->addParameter(array('name' => 'foreign_rank_column', 'value' => $this->getParameter('rank_column')));
                    $foreignTable->addBehavior($relationBehavior);
                }
            }
        }
    }

    public function getObjectBuilderModifier()
    {
        if (is_null($this->objectBuilderModifier)) {
            $this->objectBuilderModifier = new SortableBehaviorObjectBuilderModifier($this);
        }

        return $this->objectBuilderModifier;
    }

    public function getQueryBuilderModifier()
    {
        if (is_null($this->queryBuilderModifier)) {
            $this->queryBuilderModifier = new SortableBehaviorQueryBuilderModifier($this);
        }

        return $this->queryBuilderModifier;
    }

    public function getPeerBuilderModifier()
    {
        if (is_null($this->peerBuilderModifier)) {
            $this->peerBuilderModifier = new SortableBehaviorPeerBuilderModifier($this);
        }

        return $this->peerBuilderModifier;
    }

    public function useScope()
    {
        return $this->getParameter('use_scope') == 'true';
    }

}
