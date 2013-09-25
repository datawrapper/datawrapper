<?php

/**
 * This file is part of the Propel package.
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 *
 * @license    MIT License
 */

/**
 * DateTime subclass which supports serialization.
 *
 * Currently Propel is not using this for storing date/time objects
 * within model objeects; however, we are keeping it in the repository
 * because it is useful if you want to store a DateTime object in a session.
 *
 * @author     Alan Pinstein
 * @author     Soenke Ruempler
 * @author     Hans Lellelid
 * @package    propel.runtime.util
 */
class PropelDateTime extends DateTime
{

    /**
     * A string representation of the date, for serialization.
     * @var        string
     */
    private $dateString;

    /**
     * A string representation of the time zone, for serialization.
     * @var        string
     */
    private $tzString;

    /**
     * Factory method to get a DateTime object from a temporal input
     *
     * @param mixed        $value         The value to convert (can be a string, a timestamp, or another DateTime)
     * @param DateTimeZone $timeZone      (optional) timezone
     * @param string       $dateTimeClass The class of the object to create, defaults to DateTime
     *
     * @return mixed null, or an instance of $dateTimeClass
     *
     * @throws PropelException
     */
    public static function newInstance($value, DateTimeZone $timeZone = null, $dateTimeClass = 'DateTime')
    {
        if ($value instanceof DateTime) {
            return $value;
        }
        if ($value === null || $value === '') {
            // '' is seen as NULL for temporal objects
            // because DateTime('') == DateTime('now') -- which is unexpected
            return null;
        }
        try {
            if (self::isTimestamp($value)) { // if it's a unix timestamp
                $dateTimeObject = new $dateTimeClass('@' . $value, new DateTimeZone('UTC'));
                // timezone must be explicitly specified and then changed
                // because of a DateTime bug: http://bugs.php.net/bug.php?id=43003
                $dateTimeObject->setTimeZone(new DateTimeZone(date_default_timezone_get()));
            } else {
                if ($timeZone === null) {
                    // stupid DateTime constructor signature
                    $dateTimeObject = new $dateTimeClass($value);
                } else {
                    $dateTimeObject = new $dateTimeClass($value, $timeZone);
                }
            }
        } catch (Exception $e) {
            throw new PropelException('Error parsing date/time value: ' . var_export($value, true), $e);
        }

        return $dateTimeObject;
    }

    public static function isTimestamp($value)
    {
        if (!is_numeric($value)) {
            return false;
        }

        $stamp = strtotime($value);

        if (false === $stamp) {
            return true;
        }

        $month = date('m', $value);
        $day   = date('d', $value);
        $year  = date('Y', $value);

        return checkdate($month, $day, $year);
    }

    /**
     * PHP "magic" function called when object is serialized.
     * Sets an internal property with the date string and returns properties
     * of class that should be serialized.
     * @return array string[]
     */
    public function __sleep()
    {
        // We need to use a string without a time zone, due to
        // PHP bug: http://bugs.php.net/bug.php?id=40743
        $this->dateString = $this->format('Y-m-d H:i:s');
        $this->tzString = $this->getTimeZone()->getName();

        return array('dateString', 'tzString');
    }

    /**
     * PHP "magic" function called when object is restored from serialized state.
     * Calls DateTime constructor with previously stored string value of date.
     */
    public function __wakeup()
    {
        parent::__construct($this->dateString, new DateTimeZone($this->tzString));
    }

}
