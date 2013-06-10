<?php

/**
 * String object
 */
class PoeditString {
    public $key;
    public $value;
    public $fuzzy;
    public $comments;

    function __construct($key, $value = '', $fuzzy = false, $comments = array()) {
        $this->key = $key;
        $this->value = $value;
        $this->fuzzy = $fuzzy;
        $this->comments = (array)$comments;
    }

    public function __toString() {
        $str ='';
        foreach ($this->comments as $c) {
            $str .= "#: $c\n";
        }
        if ($this->fuzzy) $str .= "#, fuzzy\n";
        $str .= 'msgid "'.str_replace('"', '\\"', $this->key).'"' . "\n";
        $str .= 'msgstr "'.str_replace('"', '\\"', $this->value).'"' . "\n";
        $str .= "\n";
        return $str;
    }
}

/**
 * Parser object
 */
class PoeditParser {

    protected $file;
    protected $header = '';
    protected $strings = array();

    protected function _fixQuotes($str) {
        return stripslashes($str);
    }

    public function __construct($file) {
        $this->file = $file;
    }

    public function parse() {
        $contents = file_get_contents($this->file);
        $parts = preg_split('#(\r\n|\n){2}#', $contents, -1, PREG_SPLIT_NO_EMPTY);
        $this->header = array_shift($parts);

        foreach ($parts as $part) {

            // parse comments
            $comments = array();
            preg_match_all('#^\\#: (.*?)$#m', $part, $matches, PREG_SET_ORDER);
            foreach ($matches as $m) $comments[] = $m[1];

            $isFuzzy = preg_match('#^\\#, fuzzy$#im', $part) ? true : false;

            preg_match_all('# ^ (msgid|msgstr)\ " ( (?: (?>[^"\\\\]++) | \\\\\\\\ | (?<!\\\\)\\\\(?!\\\\) | \\\\" )* ) (?<!\\\\)" $ #ixm', $part, $matches2, PREG_SET_ORDER);
            $k = NULL;
            if(isset($matches2[0][2])){
                $k = $this->_fixQuotes($matches2[0][2]);    
            }
            
            $v = !empty($matches2[1][2]) ? $this->_fixQuotes($matches2[1][2]) : '';

            $this->strings[$k] = new PoeditString($k, $v, $isFuzzy, $comments);
        }

    }

    public function merge($strings) {
        foreach ((array)$strings as $str) {
            if (!in_array($str, array_keys($this->strings))) {
                $this->strings[$str] = new PoeditString($str);
            }
        }
    }

    public function getHeader() {
        return $this->header;
    }

    public function getStrings() {
        return $this->strings;
    }

    public function getJSON() {
        $str = array();
        foreach ($this->strings as $s) {
            if ($s->value /*&& strlen($s->value) > 0*/){
        $str[$s->key] = $s->value;
            } else {
            $str[$s->key] = $s->key;
            }       
        }
        return json_readable_encode($str);
    }

    public function toJSON($outputFilename, $varName = 'l10n') {
        $str = $this->getJSON();
        return file_put_contents($outputFilename, $str) !== false;
    }

    public function save($filename = null) {
        $data = $this->header . "\n\n";
        foreach ($this->strings as $str) {
            $data .= $str;
        }
        return file_put_contents($filename ? $filename : $this->file, $data) !== false;
    }
}

function json_readable_encode($in, $indent = 0, $from_array = false)
{
    $_myself = __FUNCTION__;
    $_escape = function ($str)
    {
        return preg_replace("!([\b\t\n\r\f\"])!", "\\\\\\1", $str);
    };

    $out = '';

    foreach ($in as $key=>$value)
    {
        $out .= str_repeat("\t", $indent + 1);
        $out .= "\"".$_escape((string)$key)."\": ";

        if (is_object($value) || is_array($value))
        {
            $out .= "\n";
            $out .= $_myself($value, $indent + 1);
        }
        elseif (is_bool($value))
        {
            $out .= $value ? 'true' : 'false';
        }
        elseif (is_null($value))
        {
            $out .= 'null';
        }
        elseif (is_string($value))
        {
            $out .= "\"" . $_escape($value) ."\"";
        }
        else
        {
            $out .= $value;
        }

        $out .= ",\n";
    }

    if (!empty($out))
    {
        $out = substr($out, 0, -2);
    }

    $out = str_repeat("  ", $indent) . "{\n" . $out;
    $out .= "\n" . str_repeat("  ", $indent) . "}";

    return $out;
}


/**
 * 
 * @param unknown_type $args
 */
function buildOptions($args) {
    $options = array(
        '-o'    => null,
        '-i'    => null,
        '-n'    => 'l10n'
    );
    $len = count($args);
    $i = 0;
    while ($i < $len) {
        if (preg_match('#^-[a-z]$#i', $args[$i])) {
            $options[$args[$i]] = isset($args[$i+1]) ? trim($args[$i+1]) : true;
            $i += 2;
        }
        else {
            $options[] = $args[$i];
            $i++;
        }
    }
    return $options;
}

/**
 * Script entry point
 * 
 * Usage :
 * ======= 
 * php po2json -i <path/to/file.po> -o <path/to/file.json> {optional} -n <variable name (default is l10n)>
 * 
 * This script is based on the project jsgettext : http://code.google.com/p/jsgettext/
 * I've updated it slightly to meet my need
 */
$options = buildOptions($argv);

if (!file_exists($options['-i']) || !is_readable($options['-i'])) {
    die("Invalid input file. Make sure it exists and is readable."."\n");
}

$poeditParser = new PoeditParser($options['-i']);
$poeditParser->parse();

if ($poeditParser->toJSON($options['-o'], $options['-n'])) {
    $strings = count($poeditParser->getStrings());
    echo "Successfully exported " . count($strings) . " strings.\n";
} else {
    echo "Cannor write to file '{$options['-o']}'.\n";
}