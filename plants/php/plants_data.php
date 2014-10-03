<?php
/*
 * This is script is used to
 * get the data of the materials.
 */
include($_SERVER['DOCUMENT_ROOT']."/jsonwrapper.php");
include($_SERVER['DOCUMENT_ROOT']."/util/connection.php");

$conn = new Connection();

$query = " select I.id,I.plant as plant_name,I.block,B.name as block_name, S.name as size_name, I.date_planted,
			I.sell_price, I.margin, I.budget_cost, I.qty
			from inventory I inner join blocks B on I.block = B.id
			inner join sizes S on S.id = I.size ";
echo $conn->getJsonRows($query,'sizes');
?>