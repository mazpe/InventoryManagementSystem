<?php
/*
 * Created on Jun 20, 2007
 *
 * To change the template for this generated file go to
 * Window - Preferences - PHPeclipse - PHP - Code Templates
 */
  	include("../../util/connection.php");
  
	$connection = new Connection();

	process();
		
	function process()
 	{
		$reader_root = "data";

		$data = $_REQUEST[$reader_root];
		 
		$rows = Array();
		  
		$rows = json_decode($data);
		 
		$query = "";	

		$errorCount = 0;
		
 		foreach($rows as $i => $row)
 		{
 			if($row->insert)
 				$query = "INSERT INTO vendors VALUES (0, '".$row->vendor_name."', '".$row->vendor_prefer_type."', '".$row->vendor_phone."', '".$row->vendor_fax."') ";
 			else
 				if($row->delete)
 					$query = "DELETE FROM vendors WHERE id = ".$row->id;				
				else
					$query = "UPDATE vendors SET `vendor_name` = '".$row->vendor_name."', `vendor_prefer_type` = '".$row->vendor_prefer_type."', `vendor_phone` = '".$row->vendor_phone."', vendor_fax = '".$row->vendor_fax."'".
							  "WHERE id = ".$row->id;
				
			$success = mysql_query($query);

			if(!$success)
				++$errorCount;			
	 	}
	 	
	 	$rowCount = count($rows);
	 	
	 	$level = ($errorCount > 0)? (($errorCount == $rowCount)? 3 : 2) : 1;
	 	
	 	showStatus($level);
	}
?>