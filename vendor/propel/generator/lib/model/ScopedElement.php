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
 * Data about an element with a name and optional namespace/schema/package attributes
 *
 * @author     Ulf Hermann <ulfhermann@kulturserver.de>
 * @version    $Revision$
 * @package    propel.generator.model
 */
abstract class ScopedElement extends XMLElement
{
	/**
	 * The package for the generated OM.
	 *
	 * @var       string
	 */
	protected $pkg;

	/**
	 * Whether the package was automatically overridden.
	 * If propel.schema.autoPackage or propel.namespace.AutoPackage is true.
	 */
	protected $pkgOverridden = false;

	/**
	 * Namespace for the generated OM.
	 *
	 * @var       string
	 */
	protected $namespace;

	/**
	 * Schema this element belongs to.
	 *
	 * @var       string
	 */
	protected $schema;

	/**
	 * retrieves a build property.
	 *
	 * @param unknown_type $name
	 */
	abstract protected function getBuildProperty($name);

	/**
	 * Sets up the Rule object based on the attributes that were passed to loadFromXML().
	 * @see       parent::loadFromXML()
	 */
	protected function setupObject()
	{
		$this->setPackage($this->getAttribute("package", $this->pkg));
		$this->setSchema($this->getAttribute("schema", $this->schema));
		$this->setNamespace($this->getAttribute("namespace", $this->namespace));
	}

	/**
	 * Get the value of the namespace.
	 * @return     value of namespace.
	 */
	public function getNamespace()
	{
		return $this->namespace;
	}

	/**
	 * Set the value of the namespace.
	 * @param      v  Value to assign to namespace.
	 */
	public function setNamespace($v)
	{
		if ($v == $this->namespace) {
			return;
		}
		$this->namespace = $v;
		if ($v && (!$this->pkg || $this->pkgOverridden) && $this->getBuildProperty('namespaceAutoPackage')) {
			$this->pkg = str_replace('\\', '.', $v);
			$this->pkgOverridden = true;
		}
	}

	/**
	 * Get the value of package.
	 * @return     value of package.
	 */
	public function getPackage()
	{
		return $this->pkg;
	}

	/**
	 * Set the value of package.
	 * @param      v  Value to assign to package.
	 */
	public function setPackage($v)
	{
		if ($v == $this->pkg) {
			return;
		}
		$this->pkg = $v;
		$this->pkgOverridden = false;
	}

	/**
	 * Get the value of schema.
	 * @return     value of schema.
	 */
	public function getSchema()
	{
		return $this->schema;
	}

	/**
	 * Set the value of schema.
	 * @param      v  Value to assign to schema.
	 */
	public function setSchema($v)
	{
		if ($v == $this->schema) {
			return;
		}
		$this->schema = $v;
		if ($v && !$this->pkg && $this->getBuildProperty('schemaAutoPackage')) {
			$this->pkg = $v;
			$this->pkgOverridden = true;
		}
		if ($v && !$this->namespace && $this->getBuildProperty('schemaAutoNamespace')) {
			$this->namespace = $v;
		}
	}
}