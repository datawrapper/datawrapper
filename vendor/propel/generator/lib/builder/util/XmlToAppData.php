<?php

/**
 * This file is part of the Propel package.
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 *
 * @license    MIT License
 */

require_once dirname(__FILE__) . '/../../model/AppData.php';
require_once dirname(__FILE__) . '/../../exception/SchemaException.php';

/**
 * A class that is used to parse an input xml schema file and creates an AppData
 * PHP object.
 *
 * @author     Hans Lellelid <hans@xmpl.org> (Propel)
 * @author     Leon Messerschmidt <leon@opticode.co.za> (Torque)
 * @author     Jason van Zyl <jvanzyl@apache.org> (Torque)
 * @author     Martin Poeschl <mpoeschl@marmot.at> (Torque)
 * @author     Daniel Rall <dlr@collab.net> (Torque)
 * @version    $Revision$
 * @package    propel.generator.builder.util
 */
class XmlToAppData
{
    /** enables debug output */
    const DEBUG = false;

    private $app;
    private $currDB;
    private $currTable;
    private $currColumn;
    private $currFK;
    private $currIndex;
    private $currUnique;
    private $currValidator;
    private $currBehavior;
    private $currVendorObject;

    private $isForReferenceOnly;
    private $currentPackage;
    private $currentXmlFile;
    private $defaultPackage;

    private $encoding;

    /** two-dimensional array,
        first dimension is for schemas(key is the path to the schema file),
        second is for tags within the schema */
    private $schemasTagsStack = array();

    /**
     * Creates a new instance for the specified database type.
     *
     * @param PropelPlatformInterface $defaultPlatform The default database platform for the application.
     * @param string                  $defaultPackage  the default PHP package used for the om
     * @param string                  $encoding        The database encoding.
     */
    public function __construct(PropelPlatformInterface $defaultPlatform = null, $defaultPackage = null, $encoding = 'iso-8859-1')
    {
        $this->app            = new AppData($defaultPlatform);
        $this->defaultPackage = $defaultPackage;
        $this->firstPass      = true;
        $this->encoding       = $encoding;
    }

    /**
     * Set the AppData generator configuration
     *
     * @param GeneratorConfigInterface $generatorConfig
     */
    public function setGeneratorConfig(GeneratorConfigInterface $generatorConfig)
    {
        $this->app->setGeneratorConfig($generatorConfig);
    }

    /**
     * Parses a XML input file and returns a newly created and
     * populated AppData structure.
     *
     * @param  string  $xmlFile The input file to parse.
     * @return AppData populated by <code>xmlFile</code>.
     */
    public function parseFile($xmlFile)
    {
        // we don't want infinite recursion
        if ($this->isAlreadyParsed($xmlFile)) {
            return;
        }

        return $this->parseString(file_get_contents($xmlFile), $xmlFile);
    }

    /**
     * Parses a XML input string and returns a newly created and
     * populated AppData structure.
     *
     * @param  string    $xmlString The input string to parse.
     * @param  string    $xmlFile   The input file name.
     * @return AppData   populated by <code>xmlFile</code>.
     * @throws Exception
     */
    public function parseString($xmlString, $xmlFile = null)
    {
        // we don't want infinite recursion
        if ($this->isAlreadyParsed($xmlFile)) {
            return;
        }
        // store current schema file path
        $this->schemasTagsStack[$xmlFile] = array();
        $this->currentXmlFile = $xmlFile;

        $parser = xml_parser_create();
        xml_parser_set_option($parser, XML_OPTION_CASE_FOLDING, 0);
        xml_set_object($parser, $this);
        xml_set_element_handler($parser, 'startElement', 'endElement');
        if (!xml_parse($parser, $xmlString)) {
            throw new Exception(sprintf("XML error: %s at line %d",
                xml_error_string(xml_get_error_code($parser)),
                xml_get_current_line_number($parser))
            );
        }
        xml_parser_free($parser);

        array_pop($this->schemasTagsStack);

        return $this->app;
    }

    /**
     * Handles opening elements of the xml file.
     *
     * @param string $uri
     * @param string $localName The local name (without prefix), or the empty string if
     *		 Namespace processing is not being performed.
     * @param string $rawName The qualified name (with prefix), or the empty string if
     *		 qualified names are not available.
     * @param string $attributes The specified or defaulted attributes
     *
     * @throws SchemaException
     */
    public function startElement($parser, $name, $attributes)
    {
      $parentTag = $this->peekCurrentSchemaTag();

      if ($parentTag === false) {

                switch ($name) {
                    case "database":
                        if ($this->isExternalSchema()) {
                            $this->currentPackage = @$attributes["package"];
                            if ($this->currentPackage === null) {
                                $this->currentPackage = $this->defaultPackage;
                            }
                        } else {
                            $this->currDB = $this->app->addDatabase($attributes);
                        }
                    break;

                    default:
                        $this->_throwInvalidTagException($parser, $name);
                }

        } elseif ($parentTag == "database") {

            switch ($name) {

                case "external-schema":
                    $xmlFile = @$attributes["filename"];

                    // "referenceOnly" attribute is valid in the main schema XML file only,
                    // and it's ignored in the nested external-schemas
                    if (!$this->isExternalSchema()) {
                        $isForRefOnly = @$attributes["referenceOnly"];
                        $this->isForReferenceOnly = ($isForRefOnly !== null ? (strtolower($isForRefOnly) === "true") : true); // defaults to TRUE
                    }

                    if (!$this->isAbsolutePath($xmlFile)) {
                        $xmlFile = realpath(dirname($this->currentXmlFile) . DIRECTORY_SEPARATOR . $xmlFile);
                        if (!file_exists($xmlFile)) {
                            throw new SchemaException(sprintf('Unknown include external "%s"', $xmlFile));
                        }
                    }

                    $this->parseFile($xmlFile);
                break;

            case "domain":
                  $this->currDB->addDomain($attributes);
              break;

                case "table":
                    $this->currTable = $this->currDB->addTable($attributes);
                    if ($this->isExternalSchema()) {
                        $this->currTable->setForReferenceOnly($this->isForReferenceOnly);
                        $this->currTable->setPackage($this->currentPackage);
                    }
                break;

                case "vendor":
                    $this->currVendorObject = $this->currDB->addVendorInfo($attributes);
                break;

                case "behavior":
                  $this->currBehavior = $this->currDB->addBehavior($attributes);
                break;

                default:
                    $this->_throwInvalidTagException($parser, $name);
            }

        } elseif ($parentTag == "table") {

            switch ($name) {
                case "column":
                    $this->currColumn = $this->currTable->addColumn($attributes);
                break;

                case "foreign-key":
                    $this->currFK = $this->currTable->addForeignKey($attributes);
                break;

                case "index":
                    $this->currIndex = $this->currTable->addIndex($attributes);
                break;

                case "unique":
                    $this->currUnique = $this->currTable->addUnique($attributes);
                break;

                case "vendor":
                    $this->currVendorObject = $this->currTable->addVendorInfo($attributes);
                break;

              case "validator":
                  $this->currValidator = $this->currTable->addValidator($attributes);
              break;

              case "id-method-parameter":
                    $this->currTable->addIdMethodParameter($attributes);
                break;

                case "behavior":
                  $this->currBehavior = $this->currTable->addBehavior($attributes);
                break;

                default:
                    $this->_throwInvalidTagException($parser, $name);
            }

        } elseif ($parentTag == "column") {

            switch ($name) {
                case "inheritance":
                    $this->currColumn->addInheritance($attributes);
                break;

                case "vendor":
                    $this->currVendorObject = $this->currColumn->addVendorInfo($attributes);
                break;

                default:
                    $this->_throwInvalidTagException($parser, $name);
            }

        } elseif ($parentTag == "foreign-key") {

            switch ($name) {
                case "reference":
                    $this->currFK->addReference($attributes);
                break;

                case "vendor":
                    $this->currVendorObject = $this->currUnique->addVendorInfo($attributes);
                break;

                default:
                    $this->_throwInvalidTagException($parser, $name);
            }

        } elseif ($parentTag == "index") {

            switch ($name) {
                case "index-column":
                    $this->currIndex->addColumn($attributes);
                break;

                case "vendor":
                    $this->currVendorObject = $this->currIndex->addVendorInfo($attributes);
                break;

                default:
                    $this->_throwInvalidTagException($parser, $name);
            }

        } elseif ($parentTag == "unique") {

            switch ($name) {
                case "unique-column":
                    $this->currUnique->addColumn($attributes);
                break;

                case "vendor":
                    $this->currVendorObject = $this->currUnique->addVendorInfo($attributes);
                break;

                default:
                    $this->_throwInvalidTagException($parser, $name);
            }
        } elseif ($parentTag == "behavior") {

            switch ($name) {
                case "parameter":
                    $this->currBehavior->addParameter($attributes);
                break;

                default:
                    $this->_throwInvalidTagException($parser, $name);
            }
        } elseif ($parentTag == "validator") {
            switch ($name) {
                case "rule":
                    $this->currValidator->addRule($attributes);
                break;
                default:
                    $this->_throwInvalidTagException($parser, $name);
            }
        } elseif ($parentTag == "vendor") {

            switch ($name) {
                case "parameter":
                    $this->currVendorObject->addParameter($attributes);
                break;
                default:
                    $this->_throwInvalidTagException($parser, $name);
            }

        } else {
            // it must be an invalid tag
            $this->_throwInvalidTagException($parser, $name);
        }

        $this->pushCurrentSchemaTag($name);
    }

    public function _throwInvalidTagException($parser, $tag_name)
    {
        $location = '';
        if ($this->currentXmlFile !== null) {
            $location .= sprintf('file %s,', $this->currentXmlFile);
        }
        $location .= sprintf('line %d', xml_get_current_line_number($parser));
        if ($col = xml_get_current_column_number($parser)) {
            $location .= sprintf(', column %d', $col);
        }
        throw new SchemaException(sprintf('Unexpected tag <%s> in %s', $tag_name, $location));
    }

    /**
     * Handles closing elements of the xml file.
     *
     * @param      uri
     * @param      localName The local name (without prefix), or the empty string if
     *		 Namespace processing is not being performed.
     * @param      rawName The qualified name (with prefix), or the empty string if
     *		 qualified names are not available.
     */
    public function endElement($parser, $name)
    {
        if (self::DEBUG) {
            print("endElement(" . $name . ") called\n");
        }

        $this->popCurrentSchemaTag();
    }

    protected function peekCurrentSchemaTag()
    {
        $keys = array_keys($this->schemasTagsStack);

        return end($this->schemasTagsStack[end($keys)]);
    }

    protected function popCurrentSchemaTag()
    {
        $keys = array_keys($this->schemasTagsStack);
        array_pop($this->schemasTagsStack[end($keys)]);
    }

    protected function pushCurrentSchemaTag($tag)
    {
        $keys = array_keys($this->schemasTagsStack);
        $this->schemasTagsStack[end($keys)][] = $tag;
    }

    protected function isExternalSchema()
    {
        return count($this->schemasTagsStack) > 1;
    }

    protected function isAlreadyParsed($filePath)
    {
        return isset($this->schemasTagsStack[$filePath]);
    }

    /**
     * See: https://github.com/symfony/symfony/blob/master/src/Symfony/Component/Filesystem/Filesystem.php#L379
     */
    protected function isAbsolutePath($file)
    {
        if (strspn($file, '/\\', 0, 1)
            || (strlen($file) > 3 && ctype_alpha($file[0])
            && substr($file, 1, 1) === ':'
            && (strspn($file, '/\\', 2, 1))
        )
        || null !== parse_url($file, PHP_URL_SCHEME)
        ) {
            return true;
        }

        return false;
    }
}
