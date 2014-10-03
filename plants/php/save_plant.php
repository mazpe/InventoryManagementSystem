<?php
include("../../jsonwrapper.php");
include("../../util/connection.php");

$level = 1;

$params = array_merge($_GET, $_POST);

$plant_date 	= $params['date'];

if($plant_date != "")
	$plant_date = substr($plant_date, 6, 4).substr($plant_date, 0, 2).substr($plant_date, 3, 2);
	 
$plant_name 	= $params['name'];
$block_id 		= $params['block'];
$plant_size		= $params['size'];
$plant_days 	= $params['days'];
$sell 			= $params['sell'];
$margin 		= $params['margin'];
$budget 		= $params['budget'];
$profit 		= $params['profit'];
$task 			= $params['task'];
$qty 			= $params['qty'];
$pieceWorkData = $params['pieceWorkData'];
$pieceWorkType = $params['piece_work'];
$laborCost = $params['labor_cost'];

$connection = new Connection();

$sql = "INSERT INTO inventory (plant, block, size, date_planted, last_modified, sell_price,	margin,	" .
								"budget_cost, qty, days, profit) 
				values ( '$plant_name',	'$block_id','$plant_size', '$plant_date', now(),		'$sell',	'$margin',	'$budget',	'$qty','$plant_days','$profit')  ";

if($connection->exec_query($sql) != null)
{
	$plant_id = mysql_insert_id();

	saveJobs($plant_id, json_decode($params['gridData']), $pieceWorkData, $pieceWorkType, $laborCost);
	
	echo "{success:true, level:$level}";
}
else
{
	echo $sql;
	print_r($_POST);
}

function saveJobs($plant_id, $jobs, $pieceWorkData, $pieceWorkType, $laborCost) 
{
	global $connection;
	
	if(count($jobs) > 0)
	{
		foreach($jobs as $id => $job)
		{
			$query = "SELECT ref FROM jobs WHERE (type = 2 OR type = 4) AND id = $job->id_job";			
			$ref = $connection->get_row($query);
			$ref = $ref['ref'];
			$materialId = 0;
			$nextMaterialId = 0;
			
			if($ref != null && $ref != "" && $ref !== false)
			{	
				$auxRow = null;

				if($ref == 'fertilizers')
				{
					$query = "SELECT id, ifnull(next, id) AS next FROM $ref WHERE name = '$job->material'";
					$auxRow = $connection->get_row($query);
													
					$nextMaterialId = $auxRow['next'];	
				}				
				else
				{
					$query = "SELECT id FROM $ref WHERE name = '$job->material'";
					$auxRow = $connection->get_row($query);
				}
				
				$materialId = $auxRow['id'];
				
				if($nextMaterialId == 0)
					$nextMaterialId = $materialId;
			}
			
			if($materialId == "")
			{			
				$materialId = 0;
				$nextMaterialId = 0;
			}
			
			$query = "SELECT id FROM labor WHERE name = '$job->labor'";
			$auxRow = $connection->get_row($query);
				
			$laborId = $auxRow['id'];
			
			if($laborId == "")
				$laborId = 0;
			
			if($job->completed)
				$query = "INSERT INTO inventory_activity (inventory_id, job_id, schedule_date, ref_id, material_cost, labor_cost, completed, completed_date, status, labor_id)  					
							SELECT $plant_id, '{$job->id_job}', '$job->date', '$materialId', '$job->material_cost', '$job->labor_cost', '{$job->completed}', '{$job->date}', 'Closed', '$laborId' ";
			else
				 $query = "INSERT INTO inventory_activity (inventory_id, job_id, schedule_date, ref_id, material_cost, labor_cost, completed, status, labor_id)  					
							SELECT $plant_id, '{$job->id_job}', '$job->date', '$materialId', '$job->material_cost', '$job->labor_cost', '{$job->completed}', 'Pending', '$laborId' ";
			
			$connection->exec_query($query);
			
			$parentId = mysql_insert_id();
			
			//Create a new pending job
			if($job->completed && $job->scheduled_date != "")
			{ 
				 $query = "INSERT INTO inventory_activity (inventory_id, job_id, schedule_date, ref_id, material_cost, labor_cost, completed, status, labor_id, depends_on)  					
							SELECT $plant_id, '{$job->id_job}', '$job->scheduled_date', '$nextMaterialId', '$job->material_cost', '$job->labor_cost', '0', 'Pending', '$laborId', '$parentId' ";
							
				$connection->exec_query($query);
			}
		}
		
		//Create ticket for completed jobs
	
		$query = "INSERT INTO ticket (id, created, status, type) VALUES (0, now(), 'Closed', '$pieceWorkType') ";
		$success = mysql_query($query);
		
		$ticketId = mysql_insert_id();	
		
		if($ticketId != 0)
		{
			$query = "UPDATE inventory_activity SET ticket = '$ticketId' WHERE status = 'Closed' AND inventory_id = '$plant_id'";
			
			$success = mysql_query($query);
			
			$rows = json_decode($pieceWorkData);
		 
			$query = "";	
	
			$errorCount = 0;
			
			$first = false;
			
	 		foreach($rows as $i => $row)
	 		{
 				$query = "INSERT INTO ticket_piece_work (id, ticket, employee_id, cost, type, date) " .
									"VALUES (0, '$ticketId', '$row->id', '$row->cost', '$pieceWorkType', now())";
 					
				$success = mysql_query($query);						
		 	}
		}
	}
}
?>