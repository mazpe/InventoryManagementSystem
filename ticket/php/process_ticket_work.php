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
		
		$first = false;
		
 		foreach($rows as $i => $row)
 		{
 			if($row->insert)
 			{ 	
 				if(!$first)
 				{			
	 				$query = "DELETE FROM ticket_piece_work WHERE ticket = '$row->ticket'";
					$success = mysql_query($query);
	
					//0 is piece work, 1 is by hours
					if($_REQUEST['piece_work'] == 1)
					{
						$query = "UPDATE inventory_activity SET labor_cost = '".$_REQUEST['labor_cost']."', completed_date = now()  WHERE ticket = '$row->ticket'";
						$success = mysql_query($query);
					}
					
					$query = "UPDATE ticket SET `type` = '".$_REQUEST['piece_work']."' WHERE id = '$row->ticket'";
					$success = mysql_query($query);
					
					$first = true;	
 				}
								
 				$query = "INSERT INTO ticket_piece_work (id, ticket, employee_id, cost, type, date) " .
									"VALUES (0, '$row->ticket', '$row->id', '$row->cost', '".$_REQUEST['piece_work']."', now())";
 			}	 				
				
			$success = mysql_query($query);

			if(!$success)
				++$errorCount;			
	 	}
	 	
	 	$rowCount = count($rows);
	 	
	 	$level = ($errorCount > 0)? (($errorCount == $rowCount)? 3 : 2) : 1;
	 	
	 	showStatus($level);
	}
?>