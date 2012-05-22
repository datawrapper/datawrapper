<?php

$result = array('status'=>'ok');

if (isset($this->data)) {
    $data = $this->data;
    if (is_array($data) && count($data) == 1) $data = $data[0];
    $result['data'] = $data;
}

print json_encode($result);