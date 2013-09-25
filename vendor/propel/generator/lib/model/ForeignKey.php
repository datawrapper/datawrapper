<?php

/**
 * This file is part of the Propel package.
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 *
 * @license    MIT License
 */

require_once dirname(__FILE__) . '/XMLElement.php';

/**
 * A Class for information about foreign keys of a table.
 *
 * @author     Hans Lellelid <hans@xmpl.org>
 * @author     Fedor <fedor.karpelevitch@home.com>
 * @author     Daniel Rall <dlr@finemaltcoding.com>
 * @author     Ulf Hermann <ulfhermann@kulturserver.de>
 * @version    $Revision$
 * @package    propel.generator.model
 */
class ForeignKey extends XMLElement
{

    protected $foreignTableCommonName;
    protected $foreignSchemaName;
    protected $name;
    protected $phpName;
    protected $refPhpName;
    protected $defaultJoin;
    protected $onUpdate = '';
    protected $onDelete = '';
    protected $parentTable;
    protected $localColumns = array();
    protected $foreignColumns = array();

    /**
     * Whether to skip generation of SQL for this foreign key.
     *
     * @var       boolean
     */
    protected $skipSql = false;

    // the uppercase equivalent of the onDelete/onUpdate values in the dtd
    const NONE     = "";            // No "ON [ DELETE | UPDATE]" behaviour specified.
    const NOACTION  = "NO ACTION";
    const CASCADE  = "CASCADE";
    const RESTRICT = "RESTRICT";
    const SETDEFAULT  = "SET DEFAULT";
    const SETNULL  = "SET NULL";

    /**
     * Constructs a new ForeignKey object.
     *
     * @param string $name
     */
    public function __construct($name=null)
    {
        $this->name = $name;
    }

    /**
     * Sets up the ForeignKey object based on the attributes that were passed to loadFromXML().
     * @see        parent::loadFromXML()
     */
    protected function setupObject()
    {
        $this->foreignTableCommonName = $this->getTable()->getDatabase()->getTablePrefix() . $this->getAttribute("foreignTable");
        $this->foreignSchemaName = $this->getAttribute("foreignSchema");
        if (!$this->foreignSchemaName) {
            if ($this->getTable()->getSchema()) {
                $this->foreignSchemaName = $this->getTable()->getSchema();
            }
        }
        $this->name = $this->getAttribute("name");
        $this->phpName = $this->getAttribute("phpName");
        $this->refPhpName = $this->getAttribute("refPhpName");
        $this->defaultJoin = $this->getAttribute('defaultJoin');
        $this->onUpdate = $this->normalizeFKey($this->getAttribute("onUpdate"));
        $this->onDelete = $this->normalizeFKey($this->getAttribute("onDelete"));
        $this->skipSql = $this->booleanValue($this->getAttribute("skipSql"));
    }

    /**
     * normalizes the input of onDelete, onUpdate attributes
     */
    public function normalizeFKey($attrib)
    {
        if ($attrib === null  || strtoupper($attrib) == "NONE") {
            $attrib = self::NONE;
        }
        $attrib = strtoupper($attrib);
        if ($attrib == "SETNULL") {
            $attrib =  self::SETNULL;
        }

        return $attrib;
    }

    /**
     * returns whether or not the onUpdate attribute is set
     */
    public function hasOnUpdate()
    {
        return ($this->onUpdate !== self::NONE);
    }

    /**
     * returns whether or not the onDelete attribute is set
     */
    public function hasOnDelete()
    {
        return ($this->onDelete !== self::NONE);
    }

    /**
     * returns the onUpdate attribute
     * @return string
     */
    public function getOnUpdate()
    {
        return $this->onUpdate;
    }

    /**
     * Returns the onDelete attribute
     * @return string
     */
    public function getOnDelete()
    {
        return $this->onDelete;
    }

    /**
     * sets the onDelete attribute
     */
    public function setOnDelete($value)
    {
        $this->onDelete = $this->normalizeFKey($value);
    }

    /**
     * sets the onUpdate attribute
     */
    public function setOnUpdate($value)
    {
        $this->onUpdate = $this->normalizeFKey($value);
    }

    /**
     * Returns the name attribute.
     */
    public function getName()
    {
        return $this->name;
    }

    /**
     * Sets the name attribute.
     */
    public function setName($name)
    {
        $this->name = $name;
    }

    /**
     * Gets the phpName for this foreign key (if any).
     * @return string
     */
    public function getPhpName()
    {
        return $this->phpName;
    }

    /**
     * Sets a phpName to use for this foreign key.
     * @param string $name
     */
    public function setPhpName($name)
    {
        $this->phpName = $name;
    }

    /**
     * Gets the refPhpName for this foreign key (if any).
     * @return string
     */
    public function getRefPhpName()
    {
        return $this->refPhpName;
    }

    /**
     * Sets a refPhpName to use for this foreign key.
     * @param string $name
     */
    public function setRefPhpName($name)
    {
        $this->refPhpName = $name;
    }

    /**
     * Gets the defaultJoin for this foreign key (if any).
     * @return string
     */
    public function getDefaultJoin()
    {
        return $this->defaultJoin;
    }

    /**
     * Sets a defaultJoin to use for this foreign key.
     * @param string $name
     */
    public function setDefaultJoin($defaultJoin)
    {
        $this->defaultJoin = $defaultJoin;
    }

    /**
     * Get the foreignTableName of the FK
     * @return string foreign table qualified name
     */
    public function getForeignTableName()
    {
        if ($this->foreignSchemaName && $this->getTable()->getDatabase()->getPlatform()->supportsSchemas()) {
            return $this->foreignSchemaName . '.' . $this->foreignTableCommonName;
        } else {
            return $this->foreignTableCommonName;
        }
    }

    /**
     * Get the foreign table name without schema
     * @return string foreign table common name
     */
    public function getForeignTableCommonName()
    {
        return $this->foreignTableCommonName;
    }

    /**
     * Set the foreignTableCommonName of the FK
     */
    public function setForeignTableCommonName($tableName)
    {
        $this->foreignTableCommonName = $tableName;
    }

    /**
     * Gets the resolved foreign Table model object.
     * @return Table
     */
    public function getForeignTable()
    {
        return $this->getTable()->getDatabase()->getTable($this->getForeignTableName());
    }

    /**
     * Get the foreignSchemaName of the FK
     */
    public function getForeignSchemaName()
    {
        return $this->foreignSchemaName;
    }

    /**
     * Set the foreignSchemaName of the FK
     */
    public function setForeignSchemaName($schemaName)
    {
        $this->foreignSchemaName = $schemaName;
    }

    /**
     * Set the parent Table of the foreign key
     */
    public function setTable(Table $parent)
    {
        $this->parentTable = $parent;
    }

    /**
     * Get the parent Table of the foreign key
     */
    public function getTable()
    {
        return $this->parentTable;
    }

    /**
     * Returns the Name of the table the foreign key is in
     */
    public function getTableName()
    {
        return $this->parentTable->getName();
    }

    /**
     * Returns the Name of the schema the foreign key is in
     */
    public function getSchemaName()
    {
        return $this->parentTable->getSchema();
    }

    /**
     * Adds a new reference entry to the foreign key.
     */
    public function addReference($p1, $p2 = null)
    {
        if (is_array($p1)) {
            $this->addReference(@$p1["local"], @$p1["foreign"]);
        } else {
            if ($p1 instanceof Column) {
                $p1 = $p1->getName();
            }
            if ($p2 instanceof Column) {
                $p2 = $p2->getName();
            }
            $this->localColumns[] = $p1;
            $this->foreignColumns[] = $p2;
        }
    }

    /**
     * Clear the references of this foreign key
     */
    public function clearReferences()
    {
        $this->localColumns[] = array();
        $this->foreignColumns[] = array();
    }

    /**
     * Return a comma delimited string of local column names
     * @deprecated because Column::makeList() is deprecated; use the array-returning getLocalColumns() instead.
     */
    public function getLocalColumnNames()
    {
        return Column::makeList($this->getLocalColumns(), $this->getTable()->getDatabase()->getPlatform());
    }

    /**
     * Return a comma delimited string of foreign column names
     * @deprecated because Column::makeList() is deprecated; use the array-returning getForeignColumns() instead.
     */
    public function getForeignColumnNames()
    {
        return Column::makeList($this->getForeignColumns(), $this->getTable()->getDatabase()->getPlatform());
    }

    /**
     * Return an array of local column names.
     * @return array string[]
     */
    public function getLocalColumns()
    {
        return $this->localColumns;
    }

    /**
     * Return an array of local column objects.
     * @return array Column[]
     */
    public function getLocalColumnObjects()
    {
        $columns = array();
        $localTable = $this->getTable();
        foreach ($this->localColumns as $columnName) {
            $columns []= $localTable->getColumn($columnName);
        }

        return $columns;
    }

    /**
     * Return a local column name.
     * @return string
     */
    public function getLocalColumnName($index = 0)
    {
        return $this->localColumns[$index];
    }

    /**
     * Return a local column object.
     * @return Column
     */
    public function getLocalColumn($index = 0)
    {
        return $this->getTable()->getColumn($this->getLocalColumnName($index));
    }

    /**
     * Utility method to get local column to foreign column
     * mapping for this foreign key.
     */
    public function getLocalForeignMapping()
    {
        $h = array();
        for ($i=0, $size=count($this->localColumns); $i < $size; $i++) {
            $h[$this->localColumns[$i]] = $this->foreignColumns[$i];
        }

        return $h;
    }

    /**
     * Utility method to get local column to foreign column
     * mapping for this foreign key.
     */
    public function getForeignLocalMapping()
    {
        $h = array();
        for ($i=0, $size=count($this->localColumns); $i < $size; $i++) {
            $h[$this->foreignColumns[$i]] = $this->localColumns[$i];
        }

        return $h;
    }

    /**
     * Utility method to get local and foreign column objects
     * mapping for this foreign key.
     */
    public function getColumnObjectsMapping()
    {
        $mapping = array();
        $localTable = $this->getTable();
        $foreignTable = $this->getForeignTable();
        for ($i=0, $size=count($this->localColumns); $i < $size; $i++) {
            $mapping[]= array(
                'local'   => $localTable->getColumn($this->localColumns[$i]),
                'foreign' => $foreignTable->getColumn($this->foreignColumns[$i]),
            );
        }

        return $mapping;
    }

    /**
     * Get the foreign column mapped to specified local column.
     * @return string Column name.
     */
    public function getMappedForeignColumn($local)
    {
        $m = $this->getLocalForeignMapping();
        if (isset($m[$local])) {
            return $m[$local];
        }

        return null;
    }

    /**
     * Get the local column mapped to specified foreign column.
     * @return string Column name.
     */
    public function getMappedLocalColumn($foreign)
    {
        $m = $this->getForeignLocalMapping();
        if (isset($m[$foreign])) {
            return $m[$foreign];
        }

        return null;
    }

    /**
     * Return an array of foreign column names.
     * @return array string[]
     */
    public function getForeignColumns()
    {
        return $this->foreignColumns;
    }

    /**
     * Return an array of foreign column objects.
     * @return array Column[]
     */
    public function getForeignColumnObjects()
    {
        $columns = array();
        $foreignTable = $this->getForeignTable();
        foreach ($this->foreignColumns as $columnName) {
            $columns []= $foreignTable->getColumn($columnName);
        }

        return $columns;
    }

    /**
     * Return a foreign column name.
     * @return string
     */
    public function getForeignColumnName($index = 0)
    {
        return $this->foreignColumns[$index];
    }

    /**
     * Return a foreign column object.
     * @return Column
     */
    public function getForeignColumn($index = 0)
    {
        return $this->getForeignTable()->getColumn($this->getForeignColumnName($index));
    }

    /**
     * Whether this foreign key uses a required column, or a list of required columns.
     *
     * @return boolean
     */
    public function isLocalColumnsRequired()
    {
        foreach ($this->getLocalColumns() as $columnName) {
            if (!$this->getTable()->getColumn($columnName)->isNotNull()) {
                return false;
            }
        }

        return true;
    }

    /**
     * Whether this foreign key is also the primary key of the foreign table.
     *
     * @return boolean
     */
    public function isForeignPrimaryKey()
    {
        $lfmap = $this->getLocalForeignMapping();
        $foreignTable = $this->getForeignTable();

        $foreignPKCols = array();
        foreach ($foreignTable->getPrimaryKey() as $fPKCol) {
            $foreignPKCols[] = $fPKCol->getName();
        }

        $foreignCols = array ();
        foreach ($this->getLocalColumns() as $colName) {
            $foreignCols[] = $foreignTable->getColumn($lfmap[$colName])->getName();
        }

        return ((count($foreignPKCols) === count($foreignCols)) &&
            !array_diff($foreignPKCols, $foreignCols));
    }

  /**
   * Whether this foreign key relies on more than one column binding
   *
   * @return Boolean
   */
  public function isComposite()
  {
    return count($this->getLocalColumns()) > 1;
  }

    /**
     * Whether this foreign key is also the primary key of the local table.
     *
     * @return boolean
     */
    public function isLocalPrimaryKey()
    {
        $localCols = $this->getLocalColumns();

        $localPKColumnObjs = $this->getTable()->getPrimaryKey();

        $localPKCols = array();
        foreach ($localPKColumnObjs as $lPKCol) {
            $localPKCols[] = $lPKCol->getName();
        }

        return ((count($localPKCols) === count($localCols)) &&
            !array_diff($localPKCols, $localCols));
    }

    /**
     * Set whether this foreign key should have its creation sql generated.
     * @param boolean $v Value to assign to skipSql.
     */
    public function setSkipSql($v)
    {
        $this->skipSql = $v;
    }

    /**
     * Skip generating sql for this foreign key.
     * @return boolean Value of skipSql.
     */
    public function isSkipSql()
    {
        return $this->skipSql;
    }

    /**
     * Whether this foreign key is matched by an invertes foreign key (on foreign table).
     *
     * This is to prevent duplicate columns being generated for a 1:1 relationship that is represented
     * by foreign keys on both tables.  I don't know if that's good practice ... but hell, why not
     * support it.
     *
     * @param  ForeignKey $fk
     * @return boolean
     * @link       http://propel.phpdb.org/trac/ticket/549
     */
    public function isMatchedByInverseFK()
    {
        return (bool) $this->getInverseFK();
    }

    public function getInverseFK()
    {
        $foreignTable = $this->getForeignTable();
        $map = $this->getForeignLocalMapping();

        foreach ($foreignTable->getForeignKeys() as $refFK) {
            $fkMap = $refFK->getLocalForeignMapping();
            if ( ($refFK->getTableName() == $this->getTableName()) && ($map == $fkMap) ) { // compares keys and values, but doesn't care about order, included check to make sure it's the same table (fixes #679)

                return $refFK;
            }
        }
    }

    /**
     * Get the other foreign keys starting on the same table
     * Used in many-to-many relationships
     *
     * @return ForeignKey
     */
    public function getOtherFks()
    {
        $fks = array();
        foreach ($this->getTable()->getForeignKeys() as $fk) {
            if ($fk !== $this) {
                $fks[]= $fk;
            }
        }

        return $fks;
    }

    /**
     * @see        XMLElement::appendXml(DOMNode)
     */
    public function appendXml(DOMNode $node)
    {
        $doc = ($node instanceof DOMDocument) ? $node : $node->ownerDocument;

        $fkNode = $node->appendChild($doc->createElement('foreign-key'));

        $fkNode->setAttribute('foreignTable', $this->getForeignTableCommonName());
        if ($schema = $this->getForeignSchemaName()) {
            $fkNode->setAttribute('foreignSchema', $schema);
        }
        $fkNode->setAttribute('name', $this->getName());

        if ($this->getPhpName()) {
            $fkNode->setAttribute('phpName', $this->getPhpName());
        }

        if ($this->getRefPhpName()) {
            $fkNode->setAttribute('refPhpName', $this->getRefPhpName());
        }

        if ($this->getDefaultJoin()) {
            $fkNode->setAttribute('defaultJoin', $this->getDefaultJoin());
        }

        if ($this->getOnDelete()) {
            $fkNode->setAttribute('onDelete', $this->getOnDelete());
        }

        if ($this->getOnUpdate()) {
            $fkNode->setAttribute('onUpdate', $this->getOnUpdate());
        }

        for ($i=0, $size=count($this->localColumns); $i < $size; $i++) {
            $refNode = $fkNode->appendChild($doc->createElement('reference'));
            $refNode->setAttribute('local', $this->localColumns[$i]);
            $refNode->setAttribute('foreign', $this->foreignColumns[$i]);
        }

        foreach ($this->vendorInfos as $vi) {
            $vi->appendXml($fkNode);
        }
    }
}
