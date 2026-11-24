<?php
// Inicia la sesión para verificar si el usuario tiene acceso al sistema.
session_start();

// Redirige a la página de inicio de sesión cuando no existe una sesión autenticada.
if (empty($_SESSION['autenticado'])) {
    header("Location: login.php");
    exit();
}
?>
<!DOCTYPE html>
<html lang="es">

<head>
  <!-- Configuración básica del documento -->
  <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
  <title>Sistema de Agua - POSEIDÓN</title>

  <!--begin::Theme Init (prevents flash of incorrect theme on load, #6043)-->
  <script src="../js/color-thema.js"></script>
  <!--end::Theme Init-->

  <!--begin::Accessibility Meta Tags-->
  <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=yes" />
  <meta name="color-scheme" content="light dark" />
  <meta name="theme-color" content="#007bff" media="(prefers-color-scheme: light)" />
  <meta name="theme-color" content="#1a1a1a" media="(prefers-color-scheme: dark)" />
  <!--end::Accessibility Meta Tags-->

  <!--begin::Primary Meta Tags-->
  <meta name="title" content="Sistema de Agua - POSEIDÓN" />
  <meta name="description" content="Sistema Administrativo y Financiero de Agua" />
  <meta name="keywords" content="bootstrap 5, poseidon, agua potable, Sistema Administrativo y Financiero de Agua" />
  <!--end::Primary Meta Tags-->

  <!--begin::Accessibility Features-->
  <!-- Skip links will be dynamically added by accessibility.js -->
  <meta name="supported-color-schemes" content="light dark" />
  <link rel="preload" href="../css/adminlte.css" as="style" />
  <!--end::Accessibility Features-->

  <!--begin::Fonts-->
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@fontsource/source-sans-3@5.3.0/index.css"
    integrity="sha256-5UwXtC6TaPHCAbVQ59waEAqOssHyhn/twyuLRRWszzo=" crossorigin="anonymous" media="print"
    onload="this.media = 'all'" />
  <!--end::Fonts-->

  <!--begin::Third Party Plugin(OverlayScrollbars)-->
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/overlayscrollbars@2.16.0/styles/overlayscrollbars.min.css"
    crossorigin="anonymous" />
  <!--end::Third Party Plugin(OverlayScrollbars)-->

  <!--begin::Third Party Plugin(Bootstrap Icons)-->
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.13.1/font/bootstrap-icons.min.css"
    crossorigin="anonymous" />
  <!--end::Third Party Plugin(Bootstrap Icons)-->

  <!--begin::Required Plugin(AdminLTE)-->
  <link rel="stylesheet" href="../css/adminlte.css" />
  <!--end::Required Plugin(AdminLTE)-->
  <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
</head>
<body class="layout-fixed sidebar-expand-lg bg-body-tertiary">
  <div class="app-wrapper">
    <!--begin::Menú principal-->
    <?php
    include "../menu-cabecera.php";
    include "../menu-lateral.php";
    ?>
    <!--end::Menú principal-->

    <!--begin::Contenido principal-->
    <main class="app-main bg-body-tertiary">
      <div class="app-content">
        <div class="container-fluid py-3">
          <h1 class="h5 mb-3">Panel Principal</h1>
          <!--begin::Indicadores administrativos-->
          <?php if (tieneRol('admin')): ?>
          <div class="row g-3">
            <div class="col-12 col-sm-6 col-md-3">
              <!-- Recaudación mensual -->
              <div class="info-box bg-body text-body shadow-sm">
                <span class="info-box-icon text-bg-primary">
                  <i class="bi bi-currency-dollar" aria-hidden="true"></i>
                </span>
                <div class="info-box-content">
                  <span class="info-box-text">Recaudado del Mes</span>
                  <span class="info-box-number" id="sumaMensual">—</span>
                </div>
              </div>
            </div>
            <div class="col-12 col-sm-6 col-md-3">
              <!-- Pagos pendientes -->
              <div class="info-box bg-body text-body shadow-sm">
                <span class="info-box-icon text-bg-success">
                  <i class="bi bi-cart-fill" aria-hidden="true"></i>
                </span>
                <div class="info-box-content">
                  <span class="info-box-text">Pendientes de PAGO</span>
                  <span class="info-box-number" id="pendientesPago">—</span>
                </div>
              </div>
            </div>
            <div class="col-12 col-sm-6 col-md-3">
              <!-- Total de socios registrados -->
              <div class="info-box bg-body text-body shadow-sm">
                <span class="info-box-icon text-bg-warning">
                  <i class="bi bi-people-fill" aria-hidden="true"></i>
                </span>
                <div class="info-box-content">
                  <span class="info-box-text">Socios</span>
                  <span class="info-box-number" id="numeroSocio">—</span>
                </div>
              </div>
            </div>
            <?php endif; ?>
          </div>
          <!--end::Indicadores administrativos-->
        </div>
      </div>
    </main>
    <!--end::Contenido principal-->

    <!--begin::Footer-->
    <?php include "../pie.php"; ?>
    <!--end::Footer-->
  </div>

  <!--begin::Scripts principales-->
  <script src="https://cdn.jsdelivr.net/npm/overlayscrollbars@2.16.0/browser/overlayscrollbars.browser.es6.min.js"
    crossorigin="anonymous"></script>
  <script src="https://cdn.jsdelivr.net/npm/@popperjs/core@2.11.8/dist/umd/popper.min.js"
    crossorigin="anonymous"></script>
  <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/js/bootstrap.min.js"
    crossorigin="anonymous"></script>
  <script src="../js/adminlte.js"></script>
  <script src="../js/para-el-menu.js"></script>
  <script src="../js/JSIndex.js?v=<?php echo filemtime('../js/JSIndex.js'); ?>"></script>
  <!--end::Scripts principales-->
</body>
</html>
