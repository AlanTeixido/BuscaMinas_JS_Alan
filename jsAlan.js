// Función para generar el HTML del tablero
function generarHTMLTablero(tablero) {
    let html = ""; // Inicializar el HTML como una cadena vacía
    for (let i = 0; i < tablero.length; i++) {
        for (let j = 0; j < tablero[i].length; j++) {
            const contenido = tablero[i][j] === "*" ? "" : tablero[i][j]; // Si la celda es una mina, no mostrar contenido
            const claseMina = tablero[i][j] === "*" ? "mina" : ""; // Si la celda es una mina, añadir la clase mina
            html += `<div class="celda ${claseMina}" id="celda-${i}-${j}">${contenido}</div>`; // Añadir la celda al HTML
        }
    }
    return html;
}

// Clase tablero
class Tablero {
    constructor(filas, columnas, bombas) {
        this.filas = filas;
        this.columnas = columnas;
        this.bombas = bombas;
        this.tablero = [];

        this.inicializarTablero();
        this.generarBombas();
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
}

// Función para mostrar el tablero en el HTML
function mostrarTableroEnHTML(tablero) {
    const htmlTablero = generarHTMLTablero(tablero);
    document.getElementById("tablero").innerHTML = htmlTablero; // Mostrar el tablero en el HTML
}

/// Clase casilla
class Casilla {
    constructor(fila, columna, tablero) {
        this.fila = fila;
        this.columna = columna;
        this.tablero = tablero;
        this.valor = tablero.tablero[fila][columna];
    }

    // Rellena el valor de la casilla con el número de minas adyacentes
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

    // Muestra el valor de la casilla en el HTML
    mostrarValor() {
        let celda = document.getElementById(`celda-${this.fila}-${this.columna}`);
        celda.classList.add("clicado");

        // Verificar si la casilla es una mina
        if (this.valor === "*") {
            celda.classList.add("mina");
        } else if (this.valor > 0) {
            celda.textContent = this.valor;
        } else {
            // Si la casilla no tiene minas alrededor, mostrarla con otro color
            celda.classList.add("celda-vacia");
        }
    }

}

// Eventos de clic para cambiar el tamaño del tablero y el número de bombas
document.addEventListener("DOMContentLoaded", function () {

    // Agrega eventos de clic a los botones para cambiar el tamaño del tablero y el número de bombas
    document.getElementById("boton3x3").addEventListener("click", function () {
        init(3, 3, 3); // Cambia el tablero a 3x3 con 3 bombas
    });

    document.getElementById("boton4x4").addEventListener("click", function () {
        init(4, 4, 4); // Cambia el tablero a 4x4 con 4 bombas
    });

    document.getElementById("boton8x8").addEventListener("click", function () {
        init(8, 8, 10); // Cambia el tablero a 8x8 con 10 bombas
    });

    document.getElementById("boton16x16").addEventListener("click", function () {
        init(16, 16, 40); // Cambia el tablero a 16x16 con 40 bombas
    });

    // Evento de click derecho para marcar banderas
    document.getElementById("tablero").addEventListener("contextmenu", function (event) {
        event.preventDefault();
        let celda = event.target;
        celda.classList.toggle("bandera");
    });

    // Evento de click para reiniciar el tablero
    document.getElementById("botonReiniciar").addEventListener("click", function () {
        location.reload();
    });

    // Variable para mantener el conteo de las celdas descubiertas
    let celdasDescubiertas = 0;

});

// Función de inicialización que recibe el número de filas, columnas y bombas como argumentos
function init(filas, columnas, bombas) {
    tablero = new Tablero(filas, columnas, bombas); // Declara tablero como una variable global
    mostrarTableroEnHTML(tablero.tablero);
    // Actualiza variables CSS para el número de filas y columnas
    document.getElementById("tablero").style.setProperty('--filas', filas);
    document.getElementById("tablero").style.setProperty('--columnas', columnas);
}

document.addEventListener("DOMContentLoaded", function () {
    init();
});
