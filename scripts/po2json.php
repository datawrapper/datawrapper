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
        return stripslashes(str_replace('\n','', $str));
    }

    public function __construct($file) {
        $this->file = $file;
    }

    public function parse() {
        $contents = file_get_contents($this->file);
        $parts = preg_split('/(\r\n|\n){2}/', $contents, -1);
        $this->header = $parts[0];

        foreach ($parts as $part) {

            // parse comments
            $comments = array();
            preg_match_all('#^\\#: (.*?)$#m', $part, $matches, PREG_SET_ORDER);
            foreach ($matches as $m) $comments[] = $m[1];

            $isFuzzy = preg_match('#^\\#, fuzzy$#im', $part) ? true : false;

            /*preg_match_all('# ^ (msgid|msgstr)\ " ( (?: (?>[^"\\\\]++) | \\\\\\\\ | (?<!\\\\)\\\\(?!\\\\) | \\\\" )* ) (?<!\\\\)" $ #ixm', $part, $matches2, PREG_SET_ORDER);
            $k = NULL;
            if(isset($matches2[0][2])){
                $k = $this->_fixQuotes($matches2[0][2]);
            }

            $v = !empty($matches2[1][2]) ? $this->_fixQuotes($matches2[1][2]) : '';*/

            preg_match_all('# *(msgid|msgstr) *(".*"(?:\\n".*")*)#', $part, $matches2, PREG_SET_ORDER);

            $lines = explode("\n", $this->_fixQuotes($matches2[0][2]));
            $msgid = "";
            foreach ($lines as $l) {
                $l = preg_replace('/"(.*)"/', '\1', $l);
                $msgid .= $l . "\n";
            }
            $msgid = trim($msgid);
            # print $msgid."\n---\n";
            $msgstr = '';

            $this->strings[$msgid] = new PoeditString($msgid, $msgstr, $isFuzzy, $comments);
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
        return json_format(json_encode($str));
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

function json_format($json) {
    $tab = "  ";
    $new_json = "";
    $indent_level = 0;
    $in_string = false;

    $json_obj = json_decode($json);

    if($json_obj === false)
        return false;

    $json = json_encode($json_obj);
    $len = strlen($json);

    for($c = 0; $c < $len; $c++) {
        $char = $json[$c];
        switch($char) {
            case '{':
            case '[':
                if(!$in_string) {
                    $new_json .= $char . "\n" . str_repeat($tab, $indent_level+1);
                    $indent_level++;
                } else {
                    $new_json .= $char;
                }
                break;
            case '}':
            case ']':
                if(!$in_string) {
                    $indent_level--;
                    $new_json .= "\n" . str_repeat($tab, $indent_level) . $char;
                } else {
                    $new_json .= $char;
                }
                break;
            case ',':
                if(!$in_string) {
                    $new_json .= ",\n" . str_repeat($tab, $indent_level);
                } else {
                    $new_json .= $char;
                }
                break;
            case ':':
                if(!$in_string) {
                    $new_json .= ": ";
                } else {
                    $new_json .= $char;
                }
                break;
            case '"':
                if($c > 0 && $json[$c-1] != '\\') {
                    $in_string = !$in_string;
                }
            default:
                $new_json .= $char;
                break;
        }
    }

    return $new_json;
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
} else {
    echo "Cannor write to file '{$options['-o']}'.\n";
}