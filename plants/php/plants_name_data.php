<?php
/*
 * This is script is used to
 * get the data of the materials.
 */
include($_SERVER['DOCUMENT_ROOT']."/jsonwrapper.php");
include($_SERVER['DOCUMENT_ROOT']."/util/connection.php");

$conn = new Connection();

$query = "SELECT DISTINCT id, plant FROM inventory";

echo $conn->getJsonRows($query,'sizes');
?>