<?php

/**
 * This file is part of the Propel package.
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 *
 * @license    MIT License
 */

/**
 * Class for iterating over a list of Propel objects
 *
 * @author     Francois Zaninotto
 * @package    propel.runtime.collection
 */
class PropelObjectCollection extends PropelCollection
{
    /**
     * Save all the elements in the collection
     *
     * @param PropelPDO $con
     *
     * @throws PropelException
     */
    public function save($con = null)
    {
        if (!method_exists($this->getModel(), 'save')) {
            throw new PropelException('Cannot save objects on a read-only model');
        }
        if (null === $con) {
            $con = $this->getConnection(Propel::CONNECTION_WRITE);
        }
        $con->beginTransaction();
        try {
            /** @var $element BaseObject */
            foreach ($this as $element) {
                $element->save($con);
            }
            $con->commit();
        } catch (PropelException $e) {
            $con->rollback();
            throw $e;
        }
    }

    /**
     * Delete all the elements in the collection
     *
     * @param PropelPDO $con
     *
     * @throws PropelException
     */
    public function delete($con = null)
    {
        if (!method_exists($this->getModel(), 'delete')) {
            throw new PropelException('Cannot delete objects on a read-only model');
        }
        if (null === $con) {
            $con = $this->getConnection(Propel::CONNECTION_WRITE);
        }
        $con->beginTransaction();
        try {
            /** @var $element BaseObject */
            foreach ($this as $element) {
                $element->delete($con);
            }
            $con->commit();
        } catch (PropelException $e) {
            $con->rollback();
            throw $e;
        }
    }

    /**
     * Get an array of the primary keys of all the objects in the collection
     *
     * @param  boolean $usePrefix
     * @return array   The list of the primary keys of the collection
     */
    public function getPrimaryKeys($usePrefix = true)
    {
        $ret = array();

        /** @var $obj BaseObject */
        foreach ($this as $key => $obj) {
            $key = $usePrefix ? ($this->getModel() . '_' . $key) : $key;
            $ret[$key]= $obj->getPrimaryKey();
        }

        return $ret;
    }

    /**
     * Populates the collection from an array
     * Each object is populated from an array and the result is stored
     * Does not empty the collection before adding the data from the array
     *
     * @param array $arr
     */
    public function fromArray($arr)
    {
        $class = $this->getModel();
        foreach ($arr as $element) {
            /** @var $obj BaseObject */
            $obj = new $class();
            $obj->fromArray($element);
            $this->append($obj);
        }
    }

    /**
     * Get an array representation of the collection
     *
     * @param string $keyColumn If null, the returned array uses an incremental index.
     *                                 Otherwise, the array is indexed using the specified column
     * @param boolean $usePrefix If true, the returned array prefixes keys
     *                                 with the model class name ('Article_0', 'Article_1', etc).
     *
     * <code>
     *   $bookCollection->getArrayCopy();
     *   array(
     *    0 => $book0,
     *    1 => $book1,
     *   )
     *   $bookCollection->getArrayCopy('Id');
     *   array(
     *    123 => $book0,
     *    456 => $book1,
     *   )
     *   $bookCollection->getArrayCopy(null, true);
     *   array(
     *    'Book_0' => $book0,
     *    'Book_1' => $book1,
     *   )
     * </code>
     *
     * @return array
     */
    public function getArrayCopy($keyColumn = null, $usePrefix = false)
    {
        if (null === $keyColumn && false === $usePrefix) {
            return parent::getArrayCopy();
        }
        $ret = array();
        $keyGetterMethod = 'get' . $keyColumn;
        foreach ($this as $key => $obj) {
            $key = null === $keyColumn ? $key : $obj->$keyGetterMethod();
            $key = $usePrefix ? ($this->getModel() . '_' . $key) : $key;
            $ret[$key] = $obj;
        }

        return $ret;
    }

    /**
     * Get an associative array representation of the collection
     * The first parameter specifies the column to be used for the key,
     * And the seconf for the value.
     *
     * <code>
     *   $res = $coll->toKeyValue('Id', 'Name');
     * </code>
     * <code>
     *   $res = $coll->toKeyValue(array('RelatedModel', 'Name'), 'Name');
     * </code>
     *
     * @param string|array $keyColumn   The name of the column, or a list of columns to call.
     * @param string       $valueColumn
     *
     * @return array
     */
    public function toKeyValue($keyColumn = 'PrimaryKey', $valueColumn = null)
    {
        $ret = array();
        $valueGetterMethod = (null === $valueColumn) ? '__toString' : ('get' . $valueColumn);

        if (!is_array($keyColumn)) {
            $keyColumn = array($keyColumn);
        }

        foreach ($this as $obj) {
            $ret[$this->getValueForColumns($obj, $keyColumn)] = $obj->$valueGetterMethod();
        }

        return $ret;
    }

    /**
     * Return the value for a given set of key columns.
     *
     * Each column will be resolved on the value returned by the previous one.
     *
     * @param object $object  The object to start with.
     * @param array  $columns The sequence of key columns.
     *
     * @return mixed
     */
    protected function getValueForColumns($object, array $columns)
    {
        $value = $object;

        foreach ($columns as $eachKeyColumn) {
            $keyGetterMethod = 'get'.$eachKeyColumn;
            $value = $value->$keyGetterMethod();
        }

        return $value;
    }

    /**
     * Makes an additional query to populate the objects related to the collection objects
     * by a certain relation
     *
     * @param string    $relation Relation name (e.g. 'Book')
     * @param Criteria  $criteria Optional Criteria object to filter the related object collection
     * @param PropelPDO $con      Optional connection object
     *
     * @return PropelObjectCollection The list of related objects
     *
     * @throws PropelException
     */
    public function populateRelation($relation, $criteria = null, $con = null)
    {
        if (!Propel::isInstancePoolingEnabled()) {
            throw new PropelException('populateRelation() needs instance pooling to be enabled prior to populating the collection');
        }
        $relationMap = $this->getFormatter()->getTableMap()->getRelation($relation);
        if ($this->isEmpty()) {
            // save a useless query and return an empty collection
            $coll = new PropelObjectCollection();
            $coll->setModel($relationMap->getRightTable()->getClassname());

            return $coll;
        }
        $symRelationMap = $relationMap->getSymmetricalRelation();

        $query = PropelQuery::from($relationMap->getRightTable()->getClassname());
        if (null !== $criteria) {
            $query->mergeWith($criteria);
        }
        // query the db for the related objects
        $filterMethod = 'filterBy' . $symRelationMap->getName();
        $relatedObjects = $query
            ->$filterMethod($this)
            ->find($con);
        if ($relationMap->getType() == RelationMap::ONE_TO_MANY) {
            // initialize the embedded collections of the main objects
            $relationName = $relationMap->getName();
            foreach ($this as $mainObj) {
                $mainObj->initRelation($relationName);
            }
            // associate the related objects to the main objects
            $getMethod = 'get' . $symRelationMap->getName();
            $addMethod = 'add' . $relationName;
            foreach ($relatedObjects as $object) {
                $mainObj = $object->$getMethod();  // instance pool is used here to avoid a query
                $mainObj->$addMethod($object);
            }
            $relatedObjects->clearIterator();
        } elseif ($relationMap->getType() == RelationMap::MANY_TO_ONE) {
            // nothing to do; the instance pool will catch all calls to getRelatedObject()
            // and return the object in memory
        } else {
            throw new PropelException('populateRelation() does not support this relation type');
        }

        return $relatedObjects;
    }

    /**
     * {@inheritdoc}
     */
    public function search($element)
    {
        if ($element instanceof BaseObject) {
            if (null !== $elt = $this->getIdenticalObject($element)) {
                $element = $elt;
            }
        }

        return parent::search($element);
    }

    /**
     * {@inheritdoc}
     */
    public function contains($element)
    {
        if ($element instanceof BaseObject) {
            if (null !== $elt = $this->getIdenticalObject($element)) {
                $element = $elt;
            }
        }

        return parent::contains($element);
    }

    private function getIdenticalObject(BaseObject $object)
    {
        foreach ($this as $obj) {
            if ($obj instanceof BaseObject && $obj->hashCode() === $object->hashCode()) {
                return $obj;
            }
        }

        return null;
    }
}
