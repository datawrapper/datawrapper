Po Parser
=========

Po Parser is a personal project to fulfill a need I got: parse po files and edit its content using PHP.


Usage
=====
## Read Po Content

    $poparser = new I18_Pofile();
    entries = $poparser->read( 'my-pofile.po' );
    // Now $entries contains every string information in your pofile
    
    echo '<ul>';
    foreach( $entries AS $entry )
    {
       echo '<li>'.
       '<b>msgid:</b> '.$entry['msgid'].'<br>'.         // Message ID
       '<b>msgstr:</b> '.$entry['msgstr'].'<br>'.       // Translation
       '<b>reference:</b> '.$entry['reference'].'<br>'. // Reference
       '<b>msgctxt:</b> ' . $entry['msgctxt'].'<br>'.   // Message Context
       '<b>tcomment:</b> ' . $entry['tcomment'].'<br>'. // Translator comment
	   '<b>ccomment:</b> ' . $entry['ccomment'].'<br>'. // Code Comment
	   '<b>obsolete?:</b> '.(string)$entry['obsolete'].'<br>'. // Is obsolete?
		'<b>fuzzy?:</b> ' .(string)$entry['fuzzy'].     // Is fuzzy?
		'</li>';
	}
	echo '</ul>';
	
	
## Modify Content

    $poparser = new I18_Pofile();
    $poparser->read( 'my-pofile.po' );
    // Entries are stored in `$pofile` object, so you can modify them.
    
    // Use `update_entry( msgid, msgstr )` to change the messages you want.
    $poparser->update_entry( 'Write your email', 'Escribe tu email' );
    $poparser->write( 'my-pofile.po' );


Todo
====
* Improve interface to edit entries.
* Discover what's the meaning of the line "#@ ".