<?php

// kept for legacy reasons, not used in Datawrapper 1.0

/**
 *
 * @author  Kevin van Zonneveld <kevin@vanzonneveld.net>
 * @author  Simon Franz
 * @author  Deadfish
 * @copyright 2008 Kevin van Zonneveld (http://kevin.vanzonneveld.net)
 * @license   http://www.opensource.org/licenses/bsd-license.php New BSD Licence
 * @version   SVN: Release: $Id: alphaID.inc.php 344 2009-06-10 17:43:59Z kevin $
 * @link    http://kevin.vanzonneveld.net/
 *
 * @param mixed   $in    String or long input to translate
 * @param boolean $to_num  Reverses translation when true
 * @param mixed   $pad_up  Number or boolean padds the result up to a specified length
 * @param string  $passKey Supplying a password makes it harder to calculate the original ID
 *
 * @return mixed string or long
 */
function alphaID($in, $to_num = false, $pad_up = false, $passKey = null)
{
  $index = "abcdefghijklmnopqrstuvwxyz0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  if ($passKey !== null) {
 
    for ($n = 0; $n<strlen($index); $n++) {
      $i[] = substr( $index,$n ,1);
    }
 
    $passhash = hash('sha256',$passKey);
    $passhash = (strlen($passhash) < strlen($index))
      ? hash('sha512',$passKey)
      : $passhash;
 
    for ($n=0; $n < strlen($index); $n++) {
      $p[] =  substr($passhash, $n ,1);
    }
 
    array_multisort($p,  SORT_DESC, $i);
    $index = implode($i);
  }
 
  $base  = strlen($index);
 
  if ($to_num) {
    // Digital number  <<--  alphabet letter code
    $in  = strrev($in);
    $out = 0;
    $len = strlen($in) - 1;
    for ($t = 0; $t <= $len; $t++) {
      $bcpow = bcpow($base, $len - $t);
      $out   = $out + strpos($index, substr($in, $t, 1)) * $bcpow;
    }
 
    if (is_numeric($pad_up)) {
      $pad_up--;
      if ($pad_up > 0) {
        $out -= pow($base, $pad_up);
      }
    }
    $out = sprintf('%F', $out);
    $out = substr($out, 0, strpos($out, '.'));
  } else {
    // Digital number  -->>  alphabet letter code
    if (is_numeric($pad_up)) {
      $pad_up--;
      if ($pad_up > 0) {
        $in += pow($base, $pad_up);
      }
    }
 
    $out = "";
    for ($t = floor(log($in, $base)); $t >= 0; $t--) {
      $bcp = bcpow($base, $t);
      $a   = floor($in / $bcp) % $base;
      $out = $out . substr($index, $a, 1);
      $in  = $in - ($a * $bcp);
    }
    $out = strrev($out); // reverse
  }
 
  return $out;
}
