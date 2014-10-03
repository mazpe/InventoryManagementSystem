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
		
		$ticketId = 0;
		
 		foreach($rows as $i => $row)
 		{
		
			if($row->status == 'Closed')
				$query = "UPDATE inventory_activity SET status = 'Closed', `employee_id` = '".$row->employee_id."', completed = 1 ".
						  "WHERE id = ".$row->id;	
			else				
				if($row->ticket)					
				{
					if($ticketId == 0)
					{
						$query = "INSERT INTO ticket (id, created) VALUES (0, now()) ";
						$success = mysql_query($query);
						
						$ticketId = mysql_insert_id();	
					}								
					
					if($ticketId != 0)
					{
						$query = "UPDATE inventory_activity set ticket = $ticketId, status = 'Open' WHERE id = ".$row->id;
						
 						$success = mysql_query($query);
					}
 				}	
 				else					
				{
					//if($row->employee_id > 0)
					//	$row->status = 'Open';
						
					//$query = "UPDATE inventory_activity SET status = '".$row->status."', `employee_id` = '".$row->employee_id."', completed = 0 ".
					//		  "WHERE id = ".$row->id;
					
					$completed = 0;
					
					if($row->status == 'Closed')
						$completed = 1;
					else
						$completed = 0;
								
					$query = "UPDATE inventory_activity SET status = '".$row->status."', `employee_id` = '".$row->employee_id."', completed = $completed ".
							  "WHERE id = ".$row->id;
				}
			
			if($query != "")	
				$success = mysql_query($query);

			if(!$success)
				++$errorCount;			
	 	}
	 	
	 	$rowCount = count($rows);
	 	
	 	$level = ($errorCount > 0)? (($errorCount == $rowCount)? 3 : 2) : 1;
	 	
	 	echo "{success:true, level:$level}\n";
	}
?>