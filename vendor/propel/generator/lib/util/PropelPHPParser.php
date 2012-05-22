<?php

/**
 * This file is part of the Propel package.
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 *
 * @license    MIT License
 */

if (!defined('T_ML_COMMENT')) {
	define('T_ML_COMMENT', T_COMMENT);
}
else {
	define('T_DOC_COMMENT', T_ML_COMMENT);
}

/**
 * Service class for parsing PHP code strings and editing them
 * @example Basic usage:
 * <code>
 * $script = file_get_contents($fileName);
 * $parser = new PropelPHPParser($script);
 * $parser->removeMethod('foo');
 * $parser->replaceMethod('bar', '// bar method was removed');
 * file_put_contents($fileName, $parser->getCode());
 * </code>
 *
 * @author     François Zaninotto
 * @version    $Revision$
 * @package    propel.generator.util
 */
class PropelPHPParser
{
	protected $code;
	protected $isAddPhp = false;

	/**
	 * Parser constructor
	 *
	 * @param string  $code     PHP code to parse
	 * @param boolean $isAddPhp Whether the supplied code needs a supplementary '<?php '
	 *                          to be seen as code by the tokenizer.
	 */
	public function __construct($code, $isAddPhp = false)
	{
		$this->code = $isAddPhp ? $this->addPhp($code) : $code;
		$this->isAddPhp = $isAddPhp;
	}

	/**
	 * Get the modified code
	 *
	 * @return string PHP code
	 */
	public function getCode()
	{
		return $this->isAddPhp ? $this->removePhp($this->code) : $this->code;
	}

	protected function addPhp($code)
	{
	  return '<?php '. $code;
	}

	protected function removePhp($code)
	{
	  return substr($code, 6);
	}

	/**
	 * Parse the code looking for a method definition, and returns the code if found
	 *
	 * @param string $methodName The name of the method to find, e.g. 'getAuthor'
	 *
	 * @return mixed false if not found, or the method code string if found
	 */
	public function findMethod($methodName)
	{
		// Tokenize the source
		$tokens = token_get_all($this->code);
		$methodCode = '';

		// Some flags and counters
		$isInFunction = false;
		$functionBracketBalance = 0;
		$buffer = '';

		// Iterate over all tokens
		foreach ($tokens as $token) {
			// Single-character tokens.
			if(is_string($token)) {
				if(!$isInFunction) {
					if ($token == '{' || $token == ';') {
						// class-opening bracket or end of line
						$buffer = '';
					} else {
						// comment or public|protected|private
						$buffer .= $token;
					}
					continue;
				}
				$methodCode .= $token;
				if($token == '{') {
					// Increase the bracket-counter (not the class-brackets: `$isInFunction` must be true!)
					$functionBracketBalance++;
				}
				if($token == '}') {
					// Decrease the bracket-counter (not the class-brackets: `$isInFunction` must be true!)
					$functionBracketBalance--;
					if ($functionBracketBalance == 0) {
						if (strpos($methodCode, 'function ' . $methodName . '(') !== false) {
							return $methodCode;
						} else {
							// If it's the closing bracket of the function, reset `$isInFunction`
							$isInFunction = false;
							$methodCode = '';
							$buffer = '';
						}
					}
				}
			} else {
				// Tokens consisting of (possibly) more than one character.
				list($id, $text) = $token;
				switch ($id) {
					case T_FUNCTION:
						// If we encounter the keyword 'function', flip the `isInFunction` flag to
						// true and reset the `buffer`
						$isInFunction = true;
						$methodCode .= $buffer . $text;
						$buffer = '';
						break;
					default:
						if ($isInFunction) {
							$methodCode .= $text;
						} else {
							$buffer .= $text;
						}
						break;
				}
			}
		}

		// method not found
		return false;
	}

	/**
	 * Parse the code looking for a method definition, and removes the code if found
	 *
	 * @param string $methodName The name of the method to find, e.g. 'getAuthor'
	 *
	 * @return mixed false if not found, or the method code string if found
	 */
	public function removeMethod($methodName)
	{
		if ($methodCode = $this->findMethod($methodName)) {
			$this->code = str_replace($methodCode, '', $this->code);
			return $methodCode;
		}
		return false;
	}

	/**
	 * Parse the code looking for a method definition, and replaces the code if found
	 *
	 * @param string $methodName The name of the method to find, e.g. 'getAuthor'
	 * @param string $newCode    The code to use in place of the old method definition
	 *
	 * @return mixed false if not found, or the method code string if found
	 */
	public function replaceMethod($methodName, $newCode)
	{
		if ($methodCode = $this->findMethod($methodName)) {
			$this->code = str_replace($methodCode, $newCode, $this->code);
			return $methodCode;
		}
		return false;
	}

	/**
	 * Parse the code looking for a method definition, and adds the code after if found
	 *
	 * @param string $methodName The name of the method to find, e.g. 'getAuthor'
	 * @param string $newCode    The code to add to the class
	 *
	 * @return mixed false if not found, or the method code string if found
	 */
	public function addMethodAfter($methodName, $newCode)
	{
		if ($methodCode = $this->findMethod($methodName)) {
			$this->code = str_replace($methodCode, $methodCode. $newCode, $this->code);
			return $methodCode;
		}
		return false;
	}

	/**
	 * Parse the code looking for a method definition, and adds the code before if found
	 *
	 * @param string $methodName The name of the method to find, e.g. 'getAuthor'
	 * @param string $newCode    The code to add to the class
	 *
	 * @return mixed false if not found, or the method code string if found
	 */
	public function addMethodBefore($methodName, $newCode)
	{
		if ($methodCode = $this->findMethod($methodName)) {
			$this->code = str_replace($methodCode, $newCode . $methodCode, $this->code);
			return $methodCode;
		}
		return false;
	}
}