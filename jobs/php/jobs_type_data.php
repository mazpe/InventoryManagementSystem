<?php
/*
 * This is script is used to
 * get the data of the materials.
 */
include($_SERVER['DOCUMENT_ROOT']."/jsonwrapper.php");
include($_SERVER['DOCUMENT_ROOT']."/util/connection.php");

$conn = new Connection();

$query = " select id, name from jobs_type ";
echo $conn->getJsonRows($query,'jobs_type');
?>