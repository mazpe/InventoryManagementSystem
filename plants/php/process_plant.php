<?php
/*
 * Created on Dec 22, 2008
 *
 * To change the template for this generated file go to
 * Window - Preferences - PHPeclipse - PHP - Code Templates
 */
   	include("../../util/connection.php");
   	
  	$params = array_merge($_POST, $_GET);
	
	$connection = new Connection();
	
	if(isset($params['split']))
		splitPlant($params);
	else
		if(isset($params['dump']))
			dumpPlant($params, $connection);
		else
			process($params);
		
	function process($params)
 	{
		$reader_root = "data";
		
		$data = $params[$reader_root];
		
		/**
		 * Be careful
		 * This only for brittongr (localhost) and access the values as $row->key otherwise $row->key
		 */
		//$data = str_replace("\\", "", $data);
		
		$rows = Array();
		  
		$rows = json_decode($data);
		 
		$query = "";	

		$errorCount = 0;
		foreach($rows as $i => $row)
 		{
 			if($row->delete_job)
 				$query = "DELETE FROM inventory_activity WHERE id = $row->id OR depends_on = $row->id";
 			else
 				if($row->delete)
 				{
 					$query = "DELETE FROM inventory_activity WHERE inventory_id = ".$row->id;
 					$success = mysql_query($query);
 					
 					$query = "DELETE FROM inventory WHERE id = $row->id";
 				}					
				else
					$query = "UPDATE inventory SET plant = '".$row->name."', `block` = '".$row->block."', size = '".$row->size."', date_planted = '".$row->date."', 
													last_modified = now(), sell_price = '".$row->sell."', margin = '".$row->margin."', budget_cost = '".$row->budget."', 
													qty = '".$row->qty."', days = '".$row->days."', profit = '".$row->profit."'  										
							  WHERE id = ".$row->id;
			
			$success = mysql_query($query);

			if(!$success)
				++$errorCount;			
	 	}
	 	
	 	$rowCount = count($rows);
	 	
	 	$level = ($errorCount > 0)? (($errorCount == $rowCount)? 3 : 2) : 1;
	 	
	 	showStatus($level);
	} 
	
	function dumpPlant($params, $connection)
	{
		$plantId = $params['plant_id'];
		$qty = $params['qty'];
		$totalQTY = 0;
		$jobId = 26;
		$laborCost = 0;
		$materialCost = 0;
		
		$notes = "Dumped $qty plants.";
		
		$query = "SELECT qty FROM inventory WHERE id = '$plantId'";		
		$row = $connection->get_row($query);
		
		if($row != null)
			$totalQTY = $row['qty'];
			
		$query = "SELECT SUM(material_cost) AS material_cost, SUM(labor_cost)  AS labor_cost FROM inventory_activity WHERE inventory_id = '$plantId' AND status = 'Closed'";
		
		$row = $connection->get_row($query);
		
		if($row != null )		
		{			
			$materialCost = $row['material_cost'] * $qty / ($totalQTY  - $qty);			
			$laborCost = $row['labor_cost'] * $qty / ($totalQTY  - $qty);
		}	
			
		//Job has to be compoleted one.
		//Hardcode dump job_id = 26 
		$query = "INSERT INTO inventory_activity (id, inventory_id, job_id, employee_id, schedule_date, ref_id, material_cost, completed, labor_id, status, completed_date, depends_on, ticket, labor_cost, notes) " .
						"VALUES (0, '$plantId', $jobId, 0, now(), 0, '$materialCost', 1, (SELECT id FROM labor WHERE job_id = $jobId LIMIT 1), 'Closed', now(), 0, 0, $laborCost, '$notes' )";
	
		$success = mysql_query($query);
		
		if($success)
		{
			$query = "UPDATE inventory SET qty = qty - '$qty' WHERE id = '$plantId'";
			
			$success = mysql_query($query);
		}				
	}
?>