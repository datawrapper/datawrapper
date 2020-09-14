<?php

class Redis {
	private static $redis;
	private static $initialized;

	public static function init($host, $port, $password) {
		self::$redis = new Predis\Client([
		    'scheme' => 'tcp',
		    'host' => $host,
		    'port' => $port,
		    'password' => $password
		]);

		self::$initialized = true;
	}

	public static function isInitialized() {
		return self::$initialized;
	}

	public static function get($key) {
		return self::$redis->get($key);
	}

	public static function set($key, $val) {
		return self::$redis->set($key, $val);
	}

	public static function del($key) {
		return self::$redis->del($key);
	}

	public static function keys($key) {
		return self::$redis->keys($key);
	}
}
