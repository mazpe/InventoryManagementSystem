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
 				$query = "INSERT INTO sell (id, order_no, date, plant_id, qty) VALUES (0, 0, now(), '$row->plant_id', '$row->sell_qty') ";
 				$success = mysql_query($query);
 				
 				if($success)
 					$query = "UPDATE inventory SET qty = qty - '$row->sell_qty' WHERE id = '$row->plant_id'";
 				else
 					$query = "";
 			}	
 			else
 				if($row->delete)
 					$query = "SELECT COUNT(id) AS result FROM inventory WHERE block = $row->id";
				else
					$query = "UPDATE blocks SET name = '".$row->name."', `desc` = '".$row->desc."' ".
							  "WHERE id = ".$row->id;
			
			if($query != "")	
				$success = mysql_query($query);

			if(!$success)
				++$errorCount;			
	 	}
	 	
	 	$rowCount = count($rows);
	 	
	 	$level = ($errorCount > 0)? (($errorCount == $rowCount)? 3 : 2) : 1;
	 	
	 	showStatus($level);
	}
?>