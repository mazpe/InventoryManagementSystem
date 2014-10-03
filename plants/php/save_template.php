<?php
include("../../jsonwrapper.php");

include("../../util/connection.php");

$level = 1;

$params = array_merge($_GET, $_POST);

$plant_name 	= $params['name'];
$template		= $params['template'];
$templateId 	= $params['template_id'];
$plant_size		= $params['size'];
$plant_days 	= $params['days'];
$sell 			= $params['sell'];
$margin 		= $params['margin'];
$budget 		= $params['budget'];
$profit 		= $params['profit'];
$task 			= $params['task'];

$connection = new Connection();

$sql = "INSERT INTO plant_template (id, template, plant, size_id, sell,	margin,	" .
								"cost, days, profit) 
				VALUE (0, '$template', '$plant_name', '$plant_size', '$sell',	'$margin',	'$budget', '$plant_days', '$profit')  ";

if($connection->exec_query($sql) != null)
{
	$template_id = mysql_insert_id();

	saveJobs($template_id);
	
	echo "{success:true, level:$level}";
}

function saveJobs($template_id) 
{
	global $connection;
	
	$gridData = "";
	
	if(isset($_POST['data']))
		$gridData = $_POST['data'];
	else
		if(isset($_GET['data']))
			$gridData = $_GET['data'];
	
	//$gridData = str_replace("\\", "", $gridData);
	
	$jobs = json_decode($gridData);
	
	if(count($jobs) > 0)
	{
		foreach($jobs as $job)
		{
			$query = "SELECT ref FROM jobs WHERE (type = 2 OR type = 4) AND id = $job->id_job";			
			$ref = $connection->get_row($query);
			$ref = $ref['ref'];
			$materialId = 0;
			
			if($ref != null && $ref != "" && $ref !== false)
			{	
				$query = "SELECT id FROM $ref WHERE name = '$job->material'";
				$auxRow = $connection->get_row($query);
				
				$materialId = $auxRow['id'];
			}
			
			if($materialId == "")
				$materialId = 0;
							
			//"VALUES (0, '$template_id','{$job->id_job}','{$job->date}', '{$job->material}', '{$job->labor}', '{$job->material_cost}', '{$job->labor_cost}', '{$job->completed}') ";
			$query = "INSERT INTO job_template (id, template_id, job_id, id_material, id_labor, completed) 					
					SELECT 0, '$template_id','{$job->id_job}', $materialId, (SELECT id FROM labor WHERE name = '{$job->labor}'), '{$job->completed}' "; 
							
			$connection->exec_query($query);
		}
	}
}
?>