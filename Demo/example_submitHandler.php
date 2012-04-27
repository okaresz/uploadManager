<?php

	include "../php/uploadhelper.php";

	foreach( $_POST[$_POST['uploadManager_postArrayName']] as $uploadName => $files )
	{
		foreach( $files as $file )
		{
			echo $file['name']."\n";
			echo $file['file']."\n"."\n";

			//move file to some new place
			//rename( uploadhelper::decrypt($file['file']), 'wherewer you want' );

			//remove file from temp directory
			if( isset($file['guid']) )
				{ uploadhelper::removeFromTmp($file['guid']); }
			else
				{ uploadhelper::removeFromTmp($file['file']); }
		}
	}

?>