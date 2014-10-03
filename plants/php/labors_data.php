<?php
/*
 * This is script is used to 
 * get the data of the materials.
 */
include("../../jsonwrapper.php");
include("../../util/connection.php");

$conn = new Connection();

if(isset($_POST['job_id']))
	$where = " where job_id = '". $_POST['job_id']  ."' ";
else
	$where = " where 1 = 0 ";

$query = " select id as id_labor, name, cost, days, job_id from labor $where ";

echo $conn->getJsonRows($query,'labor');
?>