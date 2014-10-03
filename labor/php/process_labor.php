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
 					$query = "INSERT INTO labor (id, job_id, name, `desc`, cost, days) VALUES (0, ".$row->job_id.", '".$row->name."', '".$row->desc."', ".$row->cost.", '".$row->days."')"; 		
 			else
 				if($row->delete)
 					$query = "DELETE FROM labor WHERE id = ".$row->id;				
				else
					$query = "UPDATE labor SET job_id = ".$row->job_id.", `name` = '".$row->name."', `desc` = '".$row->desc."', cost = ".$row->cost.", `days` = '".$row->days."' ".
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