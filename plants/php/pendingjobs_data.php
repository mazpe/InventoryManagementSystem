<?php
/*
 * This is script is used to
 * get the data of the materials.
 */
include($_SERVER['DOCUMENT_ROOT']."/jsonwrapper.php");
include($_SERVER['DOCUMENT_ROOT']."/util/connection.php");


$conn = new Connection();

$id	=	$_GET['plant_id'];

$query = "select IA.id,IA.inventory_id, IA.job_id , schedule_date as date,
			J.name as job_name, J.type, J.ref, IA.ref_id, IA.material_cost
			from inventory_activity IA inner join jobs J on IA.job_id = J.id where IA.inventory_id = '$id' AND IA.completed = 0";


$rows = $conn->exec_query($query);
$newRows = array();

while($row = mysql_fetch_assoc($rows))
{
	$cont++;
	$materialInfo 	= getMaterialInfo($row['ref'],$row['ref_id']);
	$laborInfo 		= getLaborInfo($row['job_id']);

	if(is_array($materialInfo))
	{
		foreach($materialInfo as $field => $value)
		{
			$row[$field] = $value;
		}
	}

	if(is_array($laborInfo))
	{
		foreach($laborInfo as $field => $value)
		{
			$row[$field] = $value;
		}
	}
	$newRows[] = $row;
}

 $json = array();
 $json["data"] = $newRows;
 $json["id"] = "plants";
 $json["totalCount"] = $cont;

 echo "".json_encode($json)."";

function getMaterialInfo($ref,$id)
{
	global $conn;
	if($ref <> "other" && $ref <> "" )
	{

		$query = " select id as id_material, name as material_name, cost as cost_name from $ref where id = '$id' ";

		$results = $conn->exec_query($query);

		if($results)
		{
			return mysql_fetch_assoc($results);
		}
	}
	else
	{
		return "";
	}
}

function getLaborInfo($job_id)
{
	global $conn;

	if($job_id <> "")
	{
		$query = "select id as labor_id,name as labor_name, cost as labor_cost from labor where job_id='$job_id'";
		$results = $conn->exec_query($query);

		if ($results)
		{
			return mysql_fetch_assoc($results);
		}
	}
}
?>