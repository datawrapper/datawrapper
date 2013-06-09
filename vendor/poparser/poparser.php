<?php

class PO_Parser
{
	protected $entries;

	/*! Reads and parses strings in a .po file.

		\return An array of entries located in the file:
		Format: array(
			'msgid'		=> <string> ID of the message.
			'msgctxt'	=> <string> Message context.
			'msgstr'	=> <string> Message translation.
			'tcomment'	=> <string> Comment from translator.
			'ccomment'	=> <string> Extracted comments from code.
			'reference'	=> <string> Location of string in code.
			'obsolete'  => <bool> Is the message obsolete?
			'fuzzy'		=> <bool> Is the message "fuzzy"?
			'flags'		=> <string> Flags of the entry. Internal usage.
		)

		\todo: What means the line "#@ "???

		#~ (old entry)
		# @ default
		#, fuzzy
		#~ msgid "Editar datos"
		#~ msgstr "editar dades"
	*/
	public function read( $pofile )
	{
		if( empty($pofile) )
		{
			throw new Pofile_Exception('Input File not defined.');
		}
		else if( file_exists($pofile)===false )
		{
			throw new Pofile_Exception('File does not exists: "'.htmlspecialchars($pofile).'".');
		}
		else if( is_readable( $pofile )===false )
		{
			throw new Pofile_Exception('The file could not be readed.');
		}

		// Comenzar su parsing
		$handle = fopen( $pofile, 'r' );
		$hash = array();
		$fuzzy = false;
		$tcomment = $ccomment = $reference = null;
		$entry = $entryTemp = array();
		$state = null;
		$just_new_entry = false;		// A new entry has ben just inserted


		while( !feof($handle) )
		{
			$line = trim( fgets($handle) );

			if( $line==='' )
			{
				if( $just_new_entry )
				{
					// Two consecutive blank lines
					continue;
				}

				// A new entry is found!
				$hash[] = $entry;
				$entry = array();
				$state= null;
				$just_new_entry = true;
				continue;
			}

			$just_new_entry = false;

			$split = preg_split('/\s/ ', $line, 2 );
			$key = $split[0];
			$data = isset($split[1])? $split[1]:null;
			
			switch( $key )
			{
				case '#,':	//flag
							$entry['fuzzy'] = in_array('fuzzy', preg_split('/,\s*/', $data) );
							$entry['flags'] = $data;
							break;

				case '#':	//translation-comments
							$entryTemp['tcomment'] = $data;
							$entry['tcomment'] = $data;
							break;

				case '#.':	//extracted-comments
							$entryTemp['ccomment'] = $data;
							break;

				case '#:':	//reference
							$entryTemp['reference'][] = addslashes($data);
							$entry['reference'][] = addslashes($data);
							break;

				case '#|':	//msgid previous-untranslated-string
							// start a new entry
							break;
				
				case '#@':	// ignore #@ default
							$entry['@'] = $data;
							break;

				// old entry
				case '#~':
							$key = explode(' ', $data );
							$entry['obsolete'] = true;
							switch( $key[0] )
							{
								case 'msgid': $entry['msgid'] = trim($data,'"');
												break;

								case 'msgstr':	$entry['msgstr'][] = trim($data,'"');
												break;
								default:	break;
							}
							
							continue;
							break;

				case 'msgctxt' :
					// context
				case 'msgid' :
					// untranslated-string
				case 'msgid_plural' :
							// untranslated-string-plural
							$state = $key;
							$entry[$state] = $data;
							break;
				
				case 'msgstr' :
							// translated-string
							$state = 'msgstr';
							$entry[$state][] = $data;
							break;

				default :

							if( strpos($key, 'msgstr[') !== FALSE )
							{
								// translated-string-case-n
								$state = 'msgstr';
								$entry[$state][] = $data;
							}
							else
							{
								// continued lines
								//echo "O NDE ELSE:".$state.':'.$entry['msgid'];
								switch( $state )
								{
									case 'msgctxt' :
									case 'msgid' :
									case 'msgid_plural' :
											//$entry[$state] .= "\n" . $line;
											if( is_string($entry[$state]) )
											{
												// Convert it to array
												$entry[$state] = array( $entry[$state] );
											}
											$entry[$state][] = $line;
											break;
								
									case 'msgstr' :
											//Special fix where msgid is ""
											if( $entry['msgid']=="\"\"" )
											{
												$entry['msgstr'][] = trim($line,'"');
											}
											else
											{
												//$entry['msgstr'][sizeof($entry['msgstr']) - 1] .= "\n" . $line;
												$entry['msgstr'][]= trim($line,'"');
											}
											break;
								
									default :
										throw new Pofile_Exception('Parse ERROR!');
										return FALSE;
								}
							}
							break;
			}
		}
		fclose($handle);

		// add final entry
		if( $state == 'msgstr' )
		{
			$hash[] = $entry;
		}

		// Cleanup data, merge multiline entries, reindex hash for ksort
		$temp = $hash;
		$this->entries = array ();
		foreach( $temp as $entry )
		{
			foreach( $entry as & $v )
			{
				$v = $this->clean($v);
				if( $v === FALSE )
				{
					// parse error
					return FALSE;
				}
			}

			if (isset($entry['msgid'])) {
				$id = is_array($entry['msgid'])? implode('',$entry['msgid']):$entry['msgid'];
				
				$this->entries[ $id ] = $entry;	
			}
		}

		return $this->entries;
	}




	/*!	\brief Allows modification a msgid.

		By default disabled fuzzy flag if defined.

		\todo Allow change any of the fields of the entry.

	*/
	public function update_entry( $original, $translation )
	{
		$this->entries[ $original ]['fuzzy'] = false;
		$this->entries[ $original ]['msgstr'] = array($translation);

		if( isset( $this->entries[$original]['flags']) )
		{
			$flags = $this->entries[ $original ]['flags'];
			$this->entries[ $original ]['flags'] = str_replace('fuzzy', '', $flags );
		}

//		echo "================================\n";
//		debug::dump( $this->entries[$original] );
//		echo "================================\n";
//		debug::dump( $this->entries );
	}




	/*!	\brief Writes entries into the po file.

		It writes the entries stored in the object.
		Example:

		1. Parse the file:
			$pofile = new I18n_Pofile();
			$pofile->read( 'myfile.po' );

		2. Modify those entries you want.
			$pofile->update_entry( $msgid, $mgstr );

		3. Save changes
			$pofile->write( 'myfile.po' );

	*/
	public function write( $pofile )
	{
		$handle = @fopen($pofile, "wb");
	//	fwrite( $handle, "\xEF\xBB\xBF" );	//UTF-8 BOM header
		foreach( $this->entries AS $str )
		{
			if( isset($str['tcomment']) )
				fwrite( $handle, "# ". $str['tcomment'] . "\n" );

			if( isset($str['ccomment']) )
				fwrite( $handle, '#. '.$str['ccomment'] . "\n" );

			if( isset($str['reference']) )
			{
				foreach( $str['reference'] AS $ref )
					fwrite( $handle, '#: '.$ref . "\n" );
			}

			if( isset($str['flags'] ) && !empty($str['flags']) )
				fwrite( $handle, "#, ".$str['flags']."\n" );
			
			if( isset($str['@']) )
				fwrite( $handle, "#@ ".$str['@']."\n" );

			if( isset($str['msgctxt']) )
				fwrite( $handle, 'msgctxt '.$str['msgctxt'] . "\n" );

			if( isset($str['msgid']) )
			{
				// Special clean for msgid
				$msgid = explode("\n", $str['msgid']);

				fwrite( $handle, 'msgid ');
				foreach( $msgid AS $i=>$id )
				{
					fwrite( $handle, $this->clean_export($id). "\n");
				}
			}
			
			if( isset($str['msgid_plural']) )
			{
				fwrite( $handle, 'msgid_plural '.$str['msgid_plural'] . "\n" );
			}

			if( isset($str['msgstr']) )
			{
				foreach( $str['msgstr'] AS $i=>$t )
				{
					if( $i==0 )
						fwrite( $handle, 'msgstr '.$this->clean_export($str['msgstr'][0]). "\n");
					else
						fwrite( $handle, $this->clean_export($t) . "\n" );
				}
			}

			fwrite( $handle, "\n" );
		}

		fclose( $handle );
	}






	public function clear_fuzzy()
	{
		foreach( $this->entries AS &$str )
		{
			if( isset($str['fuzzy']) && $str['fuzzy']==true )
			{
				$flags = $str['flags'];
				$str['flags'] = str_replace('fuzzy', '', $flags );
				$str['fuzzy'] = false;
				$str['msgstr'] = array('');
			}
		}
	}






	protected function clean_export( $string )
	{
		$quote = '"';
		$slash = '\\';
		$newline = "\n";

		$replaces = array(
			"$slash" 	=> "$slash$slash",
			"$quote"	=> "$slash$quote",
			"\t" 		=> '\t',
		);

		$string = str_replace( array_keys($replaces), array_values($replaces), $string );

		$po = $quote.implode( "${slash}n$quote$newline$quote", explode($newline, $string) ).$quote;

		// remove empty strings
		return str_replace( "$newline$quote$quote", '', $po );
	}






	public function clean($x)
	{
		if( is_array($x) ) {
			foreach( $x as $k => $v )
			{
				$x[$k] = $this->clean($v);
			}
		}
		else
		{
			// Remove " from start and end
			if( $x=='' )
				return '';

			if( $x[0]=='"' )
				$x = substr( $x, 1, -1 );

			$x = stripcslashes( $x );
		}

		return $x;
	}
}



class Pofile_Exception extends Exception{
}
