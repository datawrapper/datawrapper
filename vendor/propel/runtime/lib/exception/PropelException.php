<?php

/**
 * This file is part of the Propel package.
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 *
 * @license    MIT License
 */

/**
 * The base class of all exceptions thrown by Propel.
 * @author     Hans Lellelid <hans@xmpl.org>
 * @version    $Revision$
 * @package    propel.runtime.exception
 */
class PropelException extends Exception
{
	/**
	 * The nested "cause" exception.
	 *
	 * @var       Exception
	 */
	protected $cause;

	/**
	 * Emulates wrapped exceptions for PHP < 5.3
	 *
	 * @param     string     $message
	 * @param     Exception  $previous
	 *
	 * @return    PropelException
	 */
	public function __construct($message = null, Exception $previous = null)
	{
		if ($previous === null && $message instanceof Exception) {
			$previous = $message;
			$message = "";
		}

		if ($previous !== null) {
			$message .= " [wrapped: " . $previous->getMessage() ."]";
			if (version_compare(PHP_VERSION, '5.3.0') >= 0) {
				parent::__construct($message, 0, $previous);
			} else {
				parent::__construct($message);
				$this->cause = $previous;
			}
		} else {
			parent::__construct($message);
		}
	}

	/**
	 * Get the previous Exception
	 * We can't override getPrevious() since it's final
	 *
	 * @return    Exception  The previous exception
	 */
	public function getCause()
	{
		if (version_compare(PHP_VERSION, '5.3.0') >= 0) {
			return $this->getPrevious();
		} else {
			return $this->cause;
		}
	}
}
