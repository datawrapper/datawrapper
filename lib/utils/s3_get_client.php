<?php


function s3_get_client($region, $accessKey, $secret) {
    $assets_s3 = new Aws\S3\S3Client([
        'region' => $region,
        'version' => 'latest',
        'credentials' => [
            'key' => $accessKey,
            'secret' => $secret
        ]
    ]);

    return $assets_s3;
}
