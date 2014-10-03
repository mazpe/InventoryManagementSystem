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
 				$query = "INSERT INTO vendor_type VALUES (0, '".$row->type_name."')";
 			else
 				if($row->delete)
 				{
 					$query = "SELECT COUNT(vendor_prefer_type) AS result FROM vendors WHERE vendor_prefer_type = $row->id";
 					
 					$rs = mysql_query($query);
 					
 					if($rs !== false)
 					{
 						$auxRow = mysql_fetch_assoc($rs);
 						
 						if($auxRow['result'] == 0)
	 						$query = "DELETE FROM vendor_type WHERE id = ".$row->id; 						
 					}	
 					else
 						$query = "";
 				}				
				else
					$query = "UPDATE vendor_type SET type_name = '".$row->type_name."'
							  WHERE id = ".$row->id;
				
			$success = mysql_query($query);

			if(!$success)
				++$errorCount;			
	 	}
	 	
	 	$rowCount = count($rows);
	 	
	 	$level = ($errorCount > 0)? (($errorCount == $rowCount)? 3 : 2) : 1;
	 	
	 	showStatus($level);
	}
?>