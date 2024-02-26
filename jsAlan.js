// Codigo JS para buscaminas


//Clase tablero
class Tablero {
    constructor(filas, columnas, bombas) {
        this.filas = filas; // Número de filas del tablero
        this.columnas = columnas; // Número de columnas del tablero
        this.bombas = bombas; // Número de bombas en el tablero
        this.tablero = []; // Representación del tablero como una matriz

        this.inicializarTablero(); // Inicializar el tablero con espacios en blanco
        this.generarBombas(); // Generar bombas aleatorias en el tablero
    }

    // Inicializar el tablero con espacios en blanco
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

    // Mostrar el tablero en el HTML usando DOM y en cohesion del css
    mostrarTablero() {


    }
}

// Función de inicialización
function init(){
    const filas = 3;
    const columnas = 3;
    const bombas = 3;
    
    let tablero = new Tablero(filas, columnas, bombas);
    tablero.mostrarTablero(); 
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

