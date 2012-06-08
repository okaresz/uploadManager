<?php

	include "../php/uploadhelper.php";

	foreach( $_POST as $key => $val )
	{
		//We will ASSUME, if a POST data key starts with "file_", then it's an uploadManager file...
		if( strpos( $key, "file_" ) !== 0 ) continue;
		
		$fileUploadName = substr( $key, 5 );
		
		$guid = $_POST['guid_'.$fileUploadName];
		
		if( !is_array( $val ) )
		{
			$val = array($val);
			$guid = array($guid);
		}
		
		foreach( $val as $index => $file )
		{
			$filePath = uploadhelper::decrypt($file);
			$fileGuid = $guid[$index];
			echo 'name: '.$fileUploadName."<br/>\n";
			echo 'path: '.$filePath."<br/>\n";
			echo 'guid: '.$fileGuid."<br/>\n"."<br/>\n";

			//move file to some new place
			//rename( $filePath, 'wherewer you want' );

			//remove file from temp directory
			/*
			if( isset($file['guid']) )
				{ uploadhelper::removeFromTmp($file['guid']); }
			else
				{ uploadhelper::removeFromTmp($file['file']); }
			*/
		}
	}

?>