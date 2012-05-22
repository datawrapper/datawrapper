<?php

class SchemaPlatform {
	public function supportsSchemas() {return true;}
}

class NoSchemaPlatform {
	public function supportsSchemas() {return false;}
}