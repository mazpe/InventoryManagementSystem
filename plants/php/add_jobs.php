<?php
include("../../jsonwrapper.php");
include("../../util/connection.php");

$level = 1;

$params = array_merge($_GET, $_POST);

$id	= $params['id'];

$connection = new Connection();

//$_POST['gridData'] = str_replace("\\", "", $_POST['gridData']);

saveJobs($id, json_decode($params['gridData']));

echo "{success:true, level:$level}";

function saveJobs($plant_id, $jobs) 
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
			$laborId = 0;
						
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
				
			/*$sql = "INSERT INTO inventory_activity (inventory_id, job_id, schedule_date, ref_id, material_cost, labor_id, completed, status) " .
					"VALUES ('$plant_id', '{$job->id_job}', '{$job->date}','{$materialId}', '{$job->material_cost}', '$laborId', '{$job->completed}'), ";

			$connection->exec_query($sql);
			
			if($days > 0)
			{
				if($job->date != "")
				{
					$query = "INSERT INTO inventory_activity (inventory_id, job_id, schedule_date, ref_id, material_cost, labor_id, completed) " .
					"VALUES ('$plant_id', '{$job->id_job}', DATE_ADD('{$job->date}', INTERVAL $days DAY),'{$materialId}', '{$job->material_cost}', '$laborId', '0') ";
					
					$connection->exec_query($query);
				}
					
			}*/
			
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
							SELECT $plant_id, '{$job->id_job}', '$job->scheduled_date', '$nextMaterialId', '$job->material_cost', '$job->labor_cost','0', 'Pending', '$laborId', '$parentId' ";
							
				$connection->exec_query($query);
			}
		}
	}
}
?>