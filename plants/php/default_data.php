<?php
/*
 * This is script is used to 
 * get the data of the materials.
 */
include("../../jsonwrapper.php");
include("../../util/connection.php");

$conn = new Connection();

$query = "SELECT default_size, default_days, default_price, default_margin " .
		 "FROM preferences P LEFT JOIN sizes S " .
		 "ON P.default_size = S.id";

echo $conn->getJsonRows($query,'labor');
?>