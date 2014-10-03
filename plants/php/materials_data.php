<?php
/*
 * This is script is used to 
 * get the data of the materials.
 */
include("../../jsonwrapper.php");
include("../../util/connection.php");

$conn = new Connection();

$where = "";

$ref = 'materials';

if(isset($_POST['job_type']))
{
	if($_POST['job_type'] == 2 || $_POST['job_type'] == 4 )
	{
		$ref = $_POST['ref'] <> "" ? $_POST['ref'] : "materials";
		$where = " ";
	}
	else
		$where = " where 1=0 ";
}
else
	$where = " where 1=0"; 
	
$query = "select id, name, cost, days from ". $ref ." $where " ;
//$query = "SELECT id, name, cost FROM materials";

echo $conn->getJsonRows($query, 'materials');
?>