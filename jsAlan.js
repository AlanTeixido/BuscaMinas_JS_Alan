// Codigo JS para buscaminas


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

    // Mostrar el tablero en el HTML usando DOM y en cohesión con el CSS
    mostrarTablero() {
        let html = ""; //Inicializar el HTML como una cadena vacía
        for (let i = 0; i < this.filas; i++) {
            for (let j = 0; j < this.columnas; j++) {
                const contenido = this.tablero[i][j] === "*" ? "" : this.tablero[i][j]; // Si la celda es una mina, no mostrar contenido
                const claseMina = this.tablero[i][j] === "*" ? "mina" : ""; // Si la celda es una mina, añadir la clase mina
                html += `<div class="celda ${claseMina}">${contenido}</div>`; // Añadir la celda al HTML
            }
        }
        document.getElementById("tablero").innerHTML = html; // Mostrar el tablero en el HTML
    }





}


// Classe casilla
class Casilla {
    mostrarBanderas() {




    }

    mostrarSolucion() {


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

    //Evento de click para reiniciar el tablero
    document.getElementById("botonReiniciar").addEventListener("click", function () {
        location.reload();
    });

    // Evento de click derecho para marcar banderas
    document.getElementById("tablero").addEventListener("contextmenu", function (event) {
        event.preventDefault();
        let celda = event.target;
        celda.classList.toggle("bandera");
    });

    let lastClickTime = 0;
    let lastClickedCell = null;

    //Quitar la bandera con doble click derecho
    document.getElementById("tablero").addEventListener("mousedown", function (event) {
        let currentTime = new Date().getTime();
        let clickTimeDiff = currentTime - lastClickTime;
    });





});

// Función de inicialización que recibe el número de filas, columnas y bombas como argumentos
function init(filas, columnas, bombas) {
    let tablero = new Tablero(filas, columnas, bombas);
    tablero.mostrarTablero();

    // Actualiza variables CSS para el número de filas y columnas
    document.getElementById("tablero").style.setProperty('--filas', filas);
    document.getElementById("tablero").style.setProperty('--columnas', columnas);
}


document.addEventListener("DOMContentLoaded", function () {
    init();
});



