<?php

/**
 * This file is part of the Propel package.
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 *
 * @license    MIT License
 */

/**
 * CSV parser. Converts data between associative array and CSV formats.
 * CSV parsing code borrowed from php-csv-utils by Luke Visinoni
 * http://code.google.com/p/php-csv-utils/
 *
 * @author     Francois Zaninotto
 * @package    propel.runtime.parser
 */
class PropelCSVParser extends PropelParser
{
    const QUOTE_NONE = 0;
    const QUOTE_ALL = 1;
    const QUOTE_NONNUMERIC = 2;
    const QUOTE_MINIMAL = 3;

    // these settings are predefined for Excel CSV format

    public $delimiter = ',';
    public $lineTerminator = "\r\n";
    public $quotechar = '"';
    public $escapechar = "\\";
    public $quoting = self::QUOTE_MINIMAL;

    /**
     * Converts data from an associative array to CSV.
     *
     * @param array   $array          Source data to convert
     * @param boolean $isList         Whether the input data contains more than one row
     * @param boolean $includeHeading Whether the output should contain a heading line
     *
     * @return string Converted data, as a CSV string
     */
    public function fromArray($array, $isList = false, $includeHeading = true)
    {
        $rows = array();
        if ($isList) {
            if ($includeHeading) {
                $rows[] = implode($this->formatRow(array_keys(reset($array))), $this->delimiter);
            }
            foreach ($array as $row) {
                $rows[] = implode($this->formatRow($row), $this->delimiter);
            }
        } else {
            if ($includeHeading) {
                $rows[] = implode($this->formatRow(array_keys($array)), $this->delimiter);
            }
            $rows[] = implode($this->formatRow($array), $this->delimiter);
        }

        return implode($rows, $this->lineTerminator) . $this->lineTerminator;
    }

    public function listFromArray($array)
    {
        return $this->fromArray($array, true);
    }

    /**
     * Accepts a row of data and returns it formatted
     *
     * @param  array $row An array of data to be formatted for output to the file
     * @return array The formatted array
     */
    protected function formatRow($row)
    {
        foreach ($row as &$column) {
            if (!is_scalar($column)) {
                $column = $this->serialize($column);
            }
            switch ($this->quoting) {
                case self::QUOTE_NONE:
                    // do nothing... no quoting is happening here
                    break;
                case self::QUOTE_ALL:
                    $column = $this->quote($this->escape($column));
                    break;
                case self::QUOTE_NONNUMERIC:
                    if (preg_match("/[^0-9]/", $column)) {
                        $column = $this->quote($this->escape($column));
                    }
                    break;
                case self::QUOTE_MINIMAL:
                default:
                    if ($this->containsSpecialChars($column)) {
                        $column = $this->quote($this->escape($column));
                    }
                    break;
            }
        }

        return $row;
    }

    /**
    * Escapes a column (escapes quotechar with escapechar)
    *
    * @param string $input	A single value to be escaped for output
    * @return string	Escaped input value
    */
    protected function escape($input)
    {
        return str_replace(
            $this->quotechar,
            $this->escapechar . $this->quotechar,
            $input
        );
    }

    /**
     * Quotes a column with quotechar
     *
     * @param  string $input A single value to be quoted for output
     * @return string Quoted input value
     */
    protected function quote($input)
    {
        return $this->quotechar . $input . $this->quotechar;
    }

    /**
     * Returns true if input contains quotechar, delimiter or any of the characters in lineTerminator
     *
     * @param  string  $input A single value to be checked for special characters
     * @return boolean True if contains any special characters
     */
    protected function containsSpecialChars($input)
    {
        $special_chars = str_split($this->lineTerminator, 1);
        $special_chars[] = $this->quotechar;
        $special_chars[] = $this->delimiter;
        foreach ($special_chars as $char) {
            if (strpos($input, $char) !== false) {
                return true;
            }
        }

        return false;
    }

    /**
     * Serializes a value to place it into a CSV output
     *
     * @param  mixed  $input
     * @return string
     */
    protected function serialize($input)
    {
        return serialize($input);
    }

    /**
     * Alias for PropelCSVParser::fromArray()
     *
     * @param array   $array          Source data to convert
     * @param boolean $isList         Whether the input data contains more than one row
     * @param boolean $includeHeading Whether the output should contain a heading line
     *
     * @return string Converted data, as a CSV string
     */
    public function toCSV($array, $isList = false, $includeHeading = true)
    {
        return $this->fromArray($array, $isList, $includeHeading);
    }

    /**
     * Converts data from CSV to an associative array.
     *
     * @param string  $data           Source data to convert, as a CSV string
     * @param boolean $isList         Whether the input data contains more than one row
     * @param boolean $includeHeading Whether the input contains a heading line
     *
     * @return array Converted data
     */
    public function toArray($data, $isList = false, $includeHeading = true)
    {
        $rows = explode($this->lineTerminator, $data);
        if ($includeHeading) {
            $heading = array_shift($rows);
            $keys = explode($this->delimiter, $heading);
        } else {
            $keys = range(0, count($this->getColumns($rows[0])) - 1);
        }
        if ($isList) {
            $array = array();
            foreach ($rows as $row) {
                $values = $this->cleanupRow($this->getColumns($row));
                if ($values !== array()) {
                    $array []= array_combine($keys, $values);
                }
            }
        } else {
            $values = $this->cleanupRow($this->getColumns(array_shift($rows)));
            if ($keys === array('') && $values === array()) {
                $array = array();
            } else {
                if (count($keys) > count($values)) {
                    // empty values at the end of the row are not match bu the getColumns() regexp
                    $values = array_pad($values, count($keys), null);
                }
                $array = array_combine($keys, $values);
            }
        }

        return $array;
    }

    public function listToArray($array)
    {
        return $this->toArray($array, true);
    }

    protected function getColumns($row)
    {
        $delim = preg_quote($this->delimiter, '/');
        preg_match_all('/(".+?"|[^' . $delim . ']+)(' . $delim . '|$)/', $row, $matches);

        return $matches[1];
    }

    /**
     * Accepts a formatted row of data and returns it raw
     *
     * @param array An array of data from a CSV output
     * @return array The cleaned up array
     */
    protected function cleanupRow($row)
    {
        foreach ($row as $key => $column) {
            if ($this->isQuoted($column)) {
                $column = $this->unescape($this->unquote($column));
            }
            if ($this->isSerialized($column)) {
                $column = $this->unserialize($column);
            }
            if ($column === 'N;') {
                $column = null;
            }
            $row[$key] = $column;
        }

        return $row;
    }

    protected function isQuoted($input)
    {
        $quote = preg_quote($this->quotechar, '/');

        return preg_match('/^' . $quote . '.*' . $quote . '$/', $input);
    }

    protected function unescape($input)
    {
        return str_replace(
            $this->escapechar . $this->quotechar,
            $this->quotechar,
            $input
        );
    }

    protected function unquote($input)
    {
        return trim($input, $this->quotechar);
    }

    /**
     * Checks whether a value from CSV output is serialized
     */
    protected function isSerialized($input)
    {
        return preg_match('/^\w\:\d+\:\{/', $input);
    }

    /**
     * Unserializes a value from CSV output
     *
     * @param  string $input
     * @return mixed
     */
    protected function unserialize($input)
    {
        return unserialize($input);
    }

    /**
     * Alias for PropelCSVParser::toArray()
     *
     * @param string  $data           Source data to convert, as a CSV string
     * @param boolean $isList         Whether the input data contains more than one row
     * @param boolean $includeHeading Whether the input contains a heading line
     *
     * @return array Converted data
     */
    public function fromCSV($data, $isList = false, $includeHeading = true)
    {
        return $this->toArray($data, $isList, $includeHeading);
    }

}
