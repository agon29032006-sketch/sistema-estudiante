function validarCampo(campo) {
    const valor = campo.value.trim();
    const duiInvalido = campo.id === "loginUsuario" && !/^\d{8}-\d$/.test(valor);
    const invalido = valor === "" || duiInvalido;

    campo.classList.toggle("is-invalid", invalido);
    campo.classList.toggle("is-valid", !invalido);
    return !invalido;
}

const formulario = document.getElementById("formulario");
const btnEntrar = document.getElementById("btnEntrar");
const loginUsuario = document.getElementById("loginUsuario");
const loginClave = document.getElementById("loginClave");

if (formulario && btnEntrar && loginUsuario && loginClave) {
    loginUsuario.addEventListener("input", function () {
        let digitos = this.value.replace(/\D/g, "").slice(0, 9);
        if (digitos.length > 8) {
            digitos = digitos.slice(0, 8) + "-" + digitos.slice(8);
        }
        this.value = digitos;
    });

    [loginUsuario, loginClave].forEach((campo) => {
        campo.addEventListener("blur", () => validarCampo(campo));
    });

    formulario.addEventListener("submit", async (event) => {
        event.preventDefault();

        const usuarioValido = validarCampo(loginUsuario);
        const claveValida = validarCampo(loginClave);
        if (!usuarioValido || !claveValida) {
            if (loginUsuario.value.trim() !== "" && !/^\d{8}-\d$/.test(loginUsuario.value.trim())) {
                Swal.fire({
                    icon: "warning",
                    title: "DUI inválido",
                    text: "El DUI debe tener el formato 00000000-0."
                });
            }
            return;
        }

        try {
            const datos = new FormData(formulario);
            datos.set("opcion", "consultar");

            btnEntrar.disabled = true;
            btnEntrar.textContent = "Procesando...";

            const respuesta = await fetch("DAOLogin.php", {
                method: "POST",
                body: datos
            });

            if (!respuesta.ok) {
                throw new Error("Error HTTP: " + respuesta.status);
            }

            const resultado = await respuesta.json();
            if (!resultado.estado) {
                await Swal.fire({
                    icon: "warning",
                    title: "No se pudo iniciar sesión",
                    text: resultado.mensaje || "Verifica tu usuario y contraseña."
                });
                return;
            }

            await Swal.fire({
                icon: "success",
                title: "Poseidón",
                text: "Bienvenido " + resultado.datos.nombreEmpleado,
                showConfirmButton: false,
                timer: 1500
            });

            window.location.href = "index.php";
        } catch (error) {
            console.error("Error al iniciar sesión:", error);
            Swal.fire({
                icon: "error",
                title: "Error al iniciar sesión",
                text: error.message
            });
        } finally {
            btnEntrar.disabled = false;
            btnEntrar.textContent = "Entrar";
        }
    });
}
