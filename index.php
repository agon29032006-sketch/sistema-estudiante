<?php
session_start();

if (empty($_SESSION['autenticado'])) {
    header("Location: forms/login.php");
    exit();
}
header("Location: forms/index.php");
exit();
?>
