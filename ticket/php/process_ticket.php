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
 			if($row->delete)
			{
				$query = "UPDATE inventory_activity SET completed = 0, status = 'Pending' WHERE ticket = ".$row->id;
				$success = mysql_query($query);
				
				if($success)	
					$query = "DELETE FROM ticket WHERE id = ".$row->id;
				else
					$query = "";
			}					
			else
				if($row->close)
				{
					$query = "UPDATE inventory_activity SET completed = 1, status = 'Closed', completed_date = now() WHERE ticket = ".$row->id;
					$success = mysql_query($query);
					
					if($success)
						$query = "UPDATE ticket SET status = 'Closed' ".
						  			"WHERE id = ".$row->id;
					else
						$query = "";
				}
				else
					if($row->open)
						$query = "UPDATE ticket SET status = 'Open' WHERE id = ".$row->id;
				
			$success = mysql_query($query);

			if(!$success)
				++$errorCount;			
	 	}
	 	
	 	$rowCount = count($rows);
	 	
	 	$level = ($errorCount > 0)? (($errorCount == $rowCount)? 3 : 2) : 1;
	 	
	 	showStatus($level);
	}
?>