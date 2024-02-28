// Codigo JS para buscaminas


// Clase tablero
class Tablero {
    constructor(filas, columnas, bombas) {
        this.filas = filas; // Número de filas del tablero
        this.columnas = columnas; // Número de columnas del tablero
        this.bombas = bombas; // Número de bombas en el tablero
        this.tablero = []; // Representación del tablero como una matriz

        this.inicializarTablero(); // Inicializar el tablero con espacios en blanco
        this.generarBombas(); // Generar bombas aleatorias en el tablero
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

// Función de inicialización
function init(){
    const filas = 8;
    const columnas = 8;
    const bombas = 10; // Número de minas, ajusta según desees
    
    let tablero = new Tablero(filas, columnas, bombas);
    tablero.mostrarTablero(); 

    // Actualizar variables CSS para el número de filas y columnas
    document.getElementById("tablero").style.setProperty('--filas', filas);
    document.getElementById("tablero").style.setProperty('--columnas', columnas);
}

document.addEventListener("DOMContentLoaded", function() {
    init(); 
});




// Classe casilla
class Casilla {
    mostrarBanderas() {

    }

    mostrarSolucion() {

    }
}

