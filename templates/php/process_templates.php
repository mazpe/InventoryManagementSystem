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
 				{
 					$query = "INSERT INTO plant_template VALUES (0, '".$row->template."', '".$row->plant."',  ".$row->size_id.")"; 		
 				}
 			else
 				if($row->delete)
 					$query = "DELETE FROM plant_template WHERE id = ".$row->id;				
				else
					$query = "UPDATE plant_template SET template = '".$row->template."', plant = '".$row->plant."',  size_id = ".$row->size_id."".
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