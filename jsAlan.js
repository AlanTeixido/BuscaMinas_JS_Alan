// Función para generar el HTML del tablero
function generarHTMLTablero(tablero) {
    let html = ""; // Inicializar el HTML como una cadena vacía
    for (let i = 0; i < tablero.length; i++) {
        for (let j = 0; j < tablero[i].length; j++) {
            const claseMina = tablero[i][j] === "*" ? "mina" : ""; // Si la celda es una mina, añadir la clase mina
            html += `<div class="celda ${claseMina}" id="celda-${i}-${j}"></div>`; // Añadir la celda al HTML sin contenido inicial
        }
    }
    return html;
}

// Función para mostrar el tablero en el HTML
function mostrarTableroEnHTML(tablero) {
    const htmlTablero = generarHTMLTablero(tablero);
    document.getElementById("tablero").innerHTML = htmlTablero; // Mostrar el tablero en el HTML
    // La función mostrarCeldasVacias ahora se llama después de generar el tablero en el HTML
}

// Función para mostrar automáticamente las celdas vacías
function mostrarCeldasVacias(tablero) {
    for (let i = 0; i < tablero.filas; i++) {
        for (let j = 0; j < tablero.columnas; j++) {
            const valor = tablero.tablero[i][j];
            if (valor === 0) {
                mostrarCeldasAdyacentes(tablero, i, j); //usando la función recursiva
            }
        }
    }
}

// Función recursiva para mostrar las celdas adyacentes a una celda vacía
function mostrarCeldasAdyacentes(tablero, fila, columna) {
    // Verificar los límites de la matriz
    if (fila < 0 || fila >= tablero.filas || columna < 0 || columna >= tablero.columnas) {
        return;
    }

    const celda = document.getElementById(`celda-${fila}-${columna}`);
    if (!celda) {
        return; // Salir si la celda no existe en el HTML
    }

    const valor = tablero.tablero[fila][columna];
    if (valor !== 0) {
        return; // Salir si la celda no es vacía
    }

    // Mostrar la celda vacía y marcarla como visitada
    celda.classList.add("celda-cero");
    tablero.tablero[fila][columna] = -1;

    // Mostrar las celdas adyacentes recursivamente
    mostrarCeldasAdyacentes(tablero, fila - 1, columna); // Arriba
    mostrarCeldasAdyacentes(tablero, fila + 1, columna); // Abajo
    mostrarCeldasAdyacentes(tablero, fila, columna - 1); // Izquierda
    mostrarCeldasAdyacentes(tablero, fila, columna + 1); // Derecha
}

// Clase Tablero
class Tablero {
    constructor(filas, columnas, bombas) {
        this.filas = filas;
        this.columnas = columnas;
        this.bombas = bombas;
        this.tablero = [];

        this.inicializarTablero();
        this.generarBombas();
        this.mostrarCeldasAgua(); // Mostrar automáticamente las celdas "agua"
    }

    // Inicializar el tablero con espacios en blanco y colocar las minas
    inicializarTablero() {
        for (let i = 0; i < this.filas; i++) {
            this.tablero[i] = [];
            for (let j = 0; j < this.columnas; j++) {
                this.tablero[i][j] = " ";
            }
        }
    }

    // Generar bombas aleatorias en el tablero
    generarBombas() {
        for (let i = 0; i < this.bombas; i++) {
            let fila = Math.floor(Math.random() * this.filas);
            let columna = Math.floor(Math.random() * this.columnas);
            while (this.tablero[fila][columna] === "*") {
                fila = Math.floor(Math.random() * this.filas);
                columna = Math.floor(Math.random() * this.columnas);
            }
            this.tablero[fila][columna] = "*";
        }
    }

    //Mostrar las celdas sin minas alrededor automáticamente, se revelan los números alrededor solamente
    mostrarCeldasAgua() {
        for (let i = 0; i < this.filas; i++) {
            for (let j = 0; j < this.columnas; j++) {
                if (this.tablero[i][j] === " ") {
                    let minas = 0;
                    for (let k = -1; k <= 1; k++) {
                        for (let l = -1; l <= 1; l++) {
                            if (i + k >= 0 && i + k < this.filas && j + l >= 0 && j + l < this.columnas) {
                                if (this.tablero[i + k][j + l] === "*") {
                                    minas++;
                                }
                            }
                        }
                    }
                    this.tablero[i][j] = minas;
                }
            }
        }
    }
}

// Clase Casilla
class Casilla {
    constructor(fila, columna, tablero) {
        this.fila = fila;
        this.columna = columna;
        this.tablero = tablero;
        this.valor = tablero.tablero[fila][columna];
    }

    // Rellenar el valor de la casilla con el número de minas adyacentes
    rellenarValor() {
        if (this.valor === " ") {
            let minas = 0;
            for (let i = -1; i <= 1; i++) {
                for (let j = -1; j <= 1; j++) {
                    if (this.fila + i >= 0 && this.fila + i < this.tablero.filas && this.columna + j >= 0 && this.columna + j < this.tablero.columnas) {
                        if (this.tablero.tablero[this.fila + i][this.columna + j] === "*") {
                            minas++;
                        }
                    }
                }
            }
            this.valor = minas;
        }
    }

    // Función para mostrar el valor de la casilla en el HTML
    mostrarValor() {
        let celda = document.getElementById(`celda-${this.fila}-${this.columna}`);
        celda.classList.add("clicado");

        if (this.valor === "*") {
            celda.classList.add("mina");
        } else {
            celda.textContent = this.valor;
            switch (this.valor) {
                case 0:
                    celda.classList.add("celda-cero");
                    break;
                case 1:
                    celda.classList.add("celda-uno");
                    break;
                case 2:
                    celda.classList.add("celda-dos");
                    break;
                case 3:
                    celda.classList.add("celda-tres");
                    break;
                case 4:
                    celda.classList.add("celda-cuatro");
                    break;
                case 5:
                    celda.classList.add("celda-cinco");
                    break;
                case 6:
                    celda.classList.add("celda-seis");
                    break;
                case 7:
                    celda.classList.add("celda-siete");
                    break;
                case 8:
                    celda.classList.add("celda-ocho");
                    break;
                default:
                    break;
            }
        }
    }
}

// Función para mostrar el mensaje
function mostrarMensaje(mensaje) {
    const mensajeDiv = document.getElementById("mensaje");
    mensajeDiv.textContent = mensaje;
    mensajeDiv.style.display = "block";
}

// Función para ocultar el mensaje
function ocultarMensaje() {
    const mensajeDiv = document.getElementById("mensaje");
    mensajeDiv.style.display = "none";
}

// Función de inicialización que recibe el número de filas, columnas y bombas como argumentos
function init(filas, columnas, bombas) {
    tablero = new Tablero(filas, columnas, bombas);
    mostrarTableroEnHTML(tablero.tablero);
    mostrarCeldasVacias(tablero);

    // Actualizar variables CSS para el número de filas y columnas
    document.getElementById("tablero").style.setProperty('--filas', filas);
    document.getElementById("tablero").style.setProperty('--columnas', columnas);

    // Agregar evento de clic para cada celda del tablero después de mostrar el tablero en el HTML
    document.querySelectorAll('.celda').forEach(celda => {
        celda.addEventListener('click', function (event) {
            let id = celda.id.split("-");
            let fila = parseInt(id[1]);
            let columna = parseInt(id[2]);
            let casilla = new Casilla(fila, columna, tablero);
            casilla.rellenarValor();
            casilla.mostrarValor();

            // Verificar si la casilla es una mina
            if (casilla.valor === "*") {
                // Mostrar mensaje de derrota por html
                mostrarMensaje("¡Has perdido! Haz clic en 'Reiniciar' para jugar de nuevo.");


                event.stopPropagation();
            } else {
                // Verificar si el jugador ha ganado sin contar las celdas 0 o agua
                let celdasRestantes = filas * columnas - bombas - document.querySelectorAll('.celda-cero').length;
                let celdasClicadas = document.querySelectorAll('.clicado').length;
                if (celdasClicadas === celdasRestantes) {
                    // Mostrar mensaje de victoria por html
                    mostrarMensaje("¡Has ganado! Haz clic en 'Reiniciar' para jugar de nuevo.");

                }
            }
        });
    });
}

// Eventos de clic para cambiar el tamaño del tablero y el número de bombas
document.addEventListener("DOMContentLoaded", function () {

    // Agregar eventos de clic a los botones para cambiar el tamaño del tablero y el número de bombas
    document.getElementById("boton3x3").addEventListener("click", function () {
        init(3, 3, 3); // Cambiar el tablero a 3x3 con 3 bombas
    });

    document.getElementById("boton4x4").addEventListener("click", function () {
        init(4, 4, 4); // Cambiar el tablero a 4x4 con 4 bombas
    });

    document.getElementById("boton8x8").addEventListener("click", function () {
        init(8, 8, 10); // Cambiar el tablero a 8x8 con 10 bombas
    });

    document.getElementById("boton16x16").addEventListener("click", function () {
        init(16, 16, 40); // Cambiar el tablero a 16x16 con 40 bombas
    });

    // Evento de clic derecho para marcar banderas
    document.getElementById("tablero").addEventListener("contextmenu", function (event) {
        event.preventDefault();
        let celda = event.target;
        celda.classList.toggle("bandera");
    });

    // Evento de clic para reiniciar el tablero
    document.getElementById("botonReiniciar").addEventListener("click", function () {
        location.reload();
    });

});
