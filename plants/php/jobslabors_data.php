<?php
/*
 * This is script is used to 
 * get the data of the materials.
 */
include("../../jsonwrapper.php");
include("../../util/connection.php");

$conn = new Connection();

$query = "SELECT job_id AS id_job, job_id, name AS labor, cost, days FROM labor WHERE job_id IN (".$_POST['id_job'].") AND name LIKE '%".$_POST['size']."%'";

echo $conn->getJsonRows($query, 'labor');
?>