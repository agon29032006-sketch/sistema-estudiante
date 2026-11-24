-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 12-11-2026 a las 15:23:50
-- Versión del servidor: 10.4.32-MariaDB
-- Versión de PHP: 8.1.25

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `sys_agua`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `canton`
--

CREATE TABLE `canton` (
  `idcanton` int(11) NOT NULL,
  `nombre` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `canton`
--

INSERT INTO `canton` (`idcanton`, `nombre`) VALUES
(1, 'PRIMAVERA'),
(5, 'MONTE SAN JAUN ');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `cargo`
--

CREATE TABLE `cargo` (
  `idcargo` int(11) NOT NULL,
  `nombre` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `cargo`
--

INSERT INTO `cargo` (`idcargo`, `nombre`) VALUES
(1, 'MOTORISTA'),
(2, 'ADMINISTRADOR '),
(4, 'LECTOR');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `consumo`
--

CREATE TABLE `consumo` (
  `idconsumo` int(11) NOT NULL,
  `idmedidor` int(11) NOT NULL,
  `idempleado` int(11) NOT NULL,
  `fecha_lectura` date NOT NULL,
  `lectura_anterior` int(11) NOT NULL,
  `lectura_actual` int(11) NOT NULL,
  `fecha_vencimiento` date DEFAULT NULL,
  `aviso` text NOT NULL,
  `mes` int(11) NOT NULL,
  `anio` int(11) NOT NULL,
  `estado` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `consumo`
--

INSERT INTO `consumo` (`idconsumo`, `idmedidor`, `idempleado`, `fecha_lectura`, `lectura_anterior`, `lectura_actual`, `fecha_vencimiento`, `aviso`, `mes`, `anio`, `estado`) VALUES
(1, 1, 1042, '2026-11-11', 100, 1500, '2027-01-12', '', 4, 2026, 'PENDIENTE'),
(2, 1, 1042, '2026-11-12', 1500, 14000, '2026-12-10', '', 5, 2026, 'PENDIENTE');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `contrato`
--

CREATE TABLE `contrato` (
  `idcontrato` int(11) NOT NULL,
  `ncontrato` text NOT NULL,
  `fecha` date NOT NULL,
  `monto` double NOT NULL,
  `prima` double NOT NULL,
  `idsocio` int(11) NOT NULL,
  `idempleado1` int(11) NOT NULL,
  `cargo1` text NOT NULL,
  `idempleado2` int(11) NOT NULL,
  `cargo2` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `contrato`
--

INSERT INTO `contrato` (`idcontrato`, `ncontrato`, `fecha`, `monto`, `prima`, `idsocio`, `idempleado1`, `cargo1`, `idempleado2`, `cargo2`) VALUES
(8, '1', '2026-11-11', 123.23, 0, 4, 1046, 'PRESIDENTE', 1062, 'SECRETARIA');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `empleado`
--

CREATE TABLE `empleado` (
  `idempleado` int(11) NOT NULL,
  `dui` text NOT NULL,
  `nombre` text NOT NULL,
  `apellido` text NOT NULL,
  `telefono` text NOT NULL,
  `fecha_ingreso` date DEFAULT NULL,
  `n_isss` text NOT NULL,
  `nup` text NOT NULL,
  `afp` text NOT NULL,
  `renta` text NOT NULL,
  `sueldo` double NOT NULL,
  `idcargo` int(11) NOT NULL,
  `idcanton` int(11) NOT NULL,
  `estado` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `empleado`
--

INSERT INTO `empleado` (`idempleado`, `dui`, `nombre`, `apellido`, `telefono`, `fecha_ingreso`, `n_isss`, `nup`, `afp`, `renta`, `sueldo`, `idcargo`, `idcanton`, `estado`) VALUES
(1042, '33333333-3', 'FELIPE ARGUETA', 'RODRIGUEZ MENDEZ', '5555-5555', '2026-11-26', '', '', '2', 'PROFESIONAL', 1500, 4, 1, 'ACTIVO'),
(1043, '02451234-1', 'CARLOS ALBERTO', 'MARTINEZ RIVAS', '7123-4567', '2025-01-15', '123456789', '123456789012', 'CONFIA', 'Renta Por Salario', 450, 1, 1, 'Activo'),
(1044, '03562345-2', 'MARIA EUGENIA', 'GOMEZ FLORES', '7234-5678', '2025-02-10', '234567890', '234567890123', 'CRECER', 'Renta Por Salario', 600, 2, 2, 'Activo'),
(1045, '04673456-3', 'JOSE LUIS', 'HERNANDEZ MENDEZ', '7345-6789', '2025-03-01', '345678901', '345678901234', 'CONFIA', 'Renta por Profesional 10%', 800, 3, 1, 'Activo'),
(1046, '05784567-4', 'ANA RUTH', 'RAMIREZ BLANCO', '7456-7890', '2025-03-15', '456789012', '456789012345', 'CRECER', 'Renta Por Salario', 400, 2, 2, 'Activo'),
(1047, '06895678-5', 'FRANCISCO JAVIER', 'CASTRO PINEDA', '7567-8901', '2025-04-01', '567890123', '567890123456', 'CONFIA', 'Renta Por Salario', 500, 3, 1, 'Activo'),
(1048, '07906789-6', 'BEATRIZ ADRIANA', 'LOPEREZ ALVARADO', '7678-9012', '2025-04-20', '678901234', '678901234567', 'CRECER', 'Renta por Profesional 10%', 750, 1, 2, 'Activo'),
(1049, '08017890-7', 'ROBERTO CARLOS', 'FLORES PORTILLO', '7789-0123', '2024-05-10', '789012345', '789012345678', 'CONFIA', 'Renta Por Salario', 425, 3, 1, 'Inactivo'),
(1050, '09128901-8', 'CLAUDIA PATRICIA', 'RIVERA SERRANO', '7890-1234', '2025-05-12', '890123456', '890123456789', 'CRECER', 'Renta Por Salario', 550, 2, 2, 'Activo'),
(1051, '01239012-9', 'WALTER OSWALDO', 'MELENDEZ GUZMAN', '7901-2345', '2025-06-01', '901234567', '901234567890', 'CONFIA', 'Renta por Profesional 10%', 900, 1, 1, 'Activo'),
(1052, '02340123-0', 'SANDRA LILIANA', 'BONILLA ARGUETA', '7012-3456', '2025-06-15', '012345678', '012345678901', 'CRECER', 'Renta Por Salario', 475, 2, 2, 'Activo'),
(1053, '03451234-1', 'GABRIEL ENRIQUE', 'ZELAYA ROSALES', '7123-4568', '2025-07-01', '123456780', '123456780123', 'CONFIA', 'Renta Por Salario', 520, 3, 1, 'Activo'),
(1054, '04562345-2', 'KARLA VANESSA', 'GUEVARA ORELLANA', '7234-5679', '2025-07-10', '234567801', '234567801234', 'CRECER', 'Renta Por Salario', 460, 2, 2, 'Activo'),
(1055, '05673456-3', 'MAURICIO ERNESTO', 'PEREZ COLATO', '7345-6780', '2025-08-01', '345678012', '345678012345', 'CONFIA', 'Renta por Profesional 10%', 850, 1, 1, 'Activo'),
(1056, '06784567-4', 'JESSICA MARISOL', 'VASQUEZ DURAN', '7456-7891', '2025-08-15', '456780123', '456780123456', 'CRECER', 'Renta Por Salario', 430, 3, 2, 'Activo'),
(1057, '07895678-5', 'ALEXANDER ANTONIO', 'CRUZ PORTILLO', '7567-8902', '2024-09-01', '567801234', '567801234567', 'CONFIA', 'Renta Por Salario', 490, 2, 1, 'Inactivo'),
(1058, '08906789-6', 'TATIANA GUADALUPE', 'CAMPOS FLORES', '7678-9013', '2025-09-10', '678012345', '678012345678', 'CRECER', 'Renta Por Salario', 510, 3, 2, 'Activo'),
(1059, '09017890-7', 'OSCAR DANIEL', 'AGUILAR SORTO', '7789-0124', '2025-10-01', '780123456', '780123456789', 'CONFIA', 'Renta por Profesional 10%', 950, 1, 1, 'Activo'),
(1060, '01128901-8', 'NANCY CAROLINA', 'ESCOBAR MEJIA', '7890-1235', '2025-10-15', '801234567', '801234567890', 'CRECER', 'Renta Por Salario', 440, 2, 2, 'Activo'),
(1061, '02239012-9', 'JORGE ALBERTO', 'FUNES ALAS', '7901-2346', '2025-11-02', '912345678', '912345678901', 'CONFIA', 'Renta Por Salario', 530, 3, 1, 'Activo'),
(1062, '03340123-0', 'DIANA MARCELA', 'SANDOVAL REYES', '7012-3457', '2025-11-12', '023456789', '023456789012', 'CRECER', 'Renta Por Salario', 480, 2, 2, 'Activo'),
(1063, '04451234-1', 'NELSON RENE', 'RIVAS CHAVEZ', '7123-4569', '2025-12-01', '134567890', '134567890123', 'CONFIA', 'Renta por Profesional 10%', 820, 1, 1, 'Activo'),
(1064, '88888888-8', '', '', '', '2026-11-11', '', '', '', '', 0, 0, 0, ''),
(1065, '88888888-8', '', '', '', '2026-11-11', '', '', '', '', 0, 0, 0, ''),
(1066, '88888888-8', '', '', '', '2026-11-11', '', '', '', '', 0, 0, 0, ''),
(1067, '88888888-8', '', '', '', '2026-11-11', '', '', '', '', 0, 0, 0, '');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `empleado_ruta`
--

CREATE TABLE `empleado_ruta` (
  `idempleado_ruta` int(11) NOT NULL,
  `idempleado` int(11) NOT NULL,
  `idruta` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `empleado_ruta`
--

INSERT INTO `empleado_ruta` (`idempleado_ruta`, `idempleado`, `idruta`) VALUES
(4, 1042, 1),
(5, 1042, 2);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `medidor`
--

CREATE TABLE `medidor` (
  `idmedidor` int(11) NOT NULL,
  `idcontrato` int(11) NOT NULL,
  `nmedidor` text NOT NULL,
  `lectura_inicial` int(11) NOT NULL,
  `idcanton` int(11) NOT NULL,
  `idruta` int(11) NOT NULL,
  `direccion` text NOT NULL,
  `referencia` text NOT NULL,
  `estado` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `medidor`
--

INSERT INTO `medidor` (`idmedidor`, `idcontrato`, `nmedidor`, `lectura_inicial`, `idcanton`, `idruta`, `direccion`, `referencia`, `estado`) VALUES
(1, 8, '1010', 100, 1, 1, 'SEPA', 'ASABER', 'INACTIVO');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `ruta`
--

CREATE TABLE `ruta` (
  `idruta` int(11) NOT NULL,
  `nombre` text NOT NULL,
  `descripcion` text NOT NULL,
  `version` int(10) UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `ruta`
--

INSERT INTO `ruta` (`idruta`, `nombre`, `descripcion`, `version`) VALUES
(1, 'RUTA 1', 'COJUTE', 0),
(2, 'RUTA 2', 'SAN VICENTE ', 0);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `socio`
--

CREATE TABLE `socio` (
  `idsocio` int(11) NOT NULL,
  `dui` int(11) NOT NULL,
  `nombre` text NOT NULL,
  `apellido` text NOT NULL,
  `telefono` text NOT NULL,
  `fecha_nacimiento` date NOT NULL,
  `profesion` int(11) NOT NULL,
  `idcanton` int(11) NOT NULL,
  `nit` text NOT NULL,
  `direccion` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `socio`
--

INSERT INTO `socio` (`idsocio`, `dui`, `nombre`, `apellido`, `telefono`, `fecha_nacimiento`, `profesion`, `idcanton`, `nit`, `direccion`) VALUES
(4, 88888888, 'HENRY DAVID', 'CASTILLO ALVARADO ', '3333-3333', '2026-11-11', 0, 1, '2243-434444-444-4', 'AMAPULAPA');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `tarifa`
--

CREATE TABLE `tarifa` (
  `idtarifa` int(11) NOT NULL,
  `desde` int(11) NOT NULL,
  `hasta` int(11) NOT NULL,
  `tipo_cobro` text NOT NULL,
  `precio` float NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `canton`
--
ALTER TABLE `canton`
  ADD PRIMARY KEY (`idcanton`);

--
-- Indices de la tabla `cargo`
--
ALTER TABLE `cargo`
  ADD PRIMARY KEY (`idcargo`);

--
-- Indices de la tabla `consumo`
--
ALTER TABLE `consumo`
  ADD PRIMARY KEY (`idconsumo`),
  ADD UNIQUE KEY `unique_medidor_periodo` (`idmedidor`,`mes`,`anio`),
  ADD KEY `idmedidor` (`idmedidor`),
  ADD KEY `idempleado` (`idempleado`);

--
-- Indices de la tabla `contrato`
--
ALTER TABLE `contrato`
  ADD PRIMARY KEY (`idcontrato`),
  ADD KEY `idsocio` (`idsocio`),
  ADD KEY `idempleado1` (`idempleado1`),
  ADD KEY `idempleado2` (`idempleado2`);

--
-- Indices de la tabla `empleado`
--
ALTER TABLE `empleado`
  ADD PRIMARY KEY (`idempleado`),
  ADD KEY `idcargo` (`idcargo`),
  ADD KEY `idcanton` (`idcanton`);

--
-- Indices de la tabla `empleado_ruta`
--
ALTER TABLE `empleado_ruta`
  ADD PRIMARY KEY (`idempleado_ruta`),
  ADD UNIQUE KEY `idempleado_3` (`idempleado`,`idruta`),
  ADD KEY `idempleado` (`idempleado`),
  ADD KEY `idruta` (`idruta`);

--
-- Indices de la tabla `medidor`
--
ALTER TABLE `medidor`
  ADD PRIMARY KEY (`idmedidor`),
  ADD UNIQUE KEY `idruta` (`idruta`),
  ADD KEY `idcontrato` (`idcontrato`),
  ADD KEY `idcanton` (`idcanton`);

--
-- Indices de la tabla `ruta`
--
ALTER TABLE `ruta`
  ADD PRIMARY KEY (`idruta`);

--
-- Indices de la tabla `socio`
--
ALTER TABLE `socio`
  ADD PRIMARY KEY (`idsocio`),
  ADD KEY `idcanton` (`idcanton`);

--
-- Indices de la tabla `tarifa`
--
ALTER TABLE `tarifa`
  ADD PRIMARY KEY (`idtarifa`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `canton`
--
ALTER TABLE `canton`
  MODIFY `idcanton` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT de la tabla `cargo`
--
ALTER TABLE `cargo`
  MODIFY `idcargo` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT de la tabla `consumo`
--
ALTER TABLE `consumo`
  MODIFY `idconsumo` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT de la tabla `contrato`
--
ALTER TABLE `contrato`
  MODIFY `idcontrato` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT de la tabla `empleado`
--
ALTER TABLE `empleado`
  MODIFY `idempleado` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=1068;

--
-- AUTO_INCREMENT de la tabla `empleado_ruta`
--
ALTER TABLE `empleado_ruta`
  MODIFY `idempleado_ruta` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT de la tabla `medidor`
--
ALTER TABLE `medidor`
  MODIFY `idmedidor` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT de la tabla `ruta`
--
ALTER TABLE `ruta`
  MODIFY `idruta` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT de la tabla `socio`
--
ALTER TABLE `socio`
  MODIFY `idsocio` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT de la tabla `tarifa`
--
ALTER TABLE `tarifa`
  MODIFY `idtarifa` int(11) NOT NULL AUTO_INCREMENT;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `consumo`
--
ALTER TABLE `consumo`
  ADD CONSTRAINT `fk_consumo_empleado` FOREIGN KEY (`idempleado`) REFERENCES `empleado` (`idempleado`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_consumo_medidor` FOREIGN KEY (`idmedidor`) REFERENCES `medidor` (`idmedidor`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
