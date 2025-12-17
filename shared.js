// shared.js

// 1. Configurações Gerais do Mundo
const CONSTANTS = {
    WIDTH: 1600,        // Largura do mapa
    HEIGHT: 900,       // Altura do mapa
    SERVER_TICK_RATE: 30, // Quantas vezes o servidor atualiza por segundo
    MSG_TYPES: {
        JOIN: 'join',
        INPUT: 'input',
        UPDATE: 'update',
        GAME_OVER: 'game_over'
    }
};

// 2. Atributos dos Personagens (Balanceamento)
// Você pode mudar esses números aqui para deixar os personagens mais fortes ou rápidos
const CHARACTERS = {
    vanguard: {
        name: "Vanguard",
        hp: 2000,
        speed: 4,
        radius: 35,
        color: '#ff4757', // Vermelho
        weapon: { range: 200, damage: 250, cooldown: 50, projectileSpeed: 10, type: 'spread' }
    },
    vector: {
        name: "Vector",
        hp: 1000,
        speed: 6,
        radius: 25,
        color: '#2ed573', // Verde (Sniper)
        weapon: { range: 800, damage: 600, cooldown: 70, projectileSpeed: 25, type: 'line' }
    },
    orbit: {
        name: "Orbit",
        hp: 1400,
        speed: 5,
        radius: 30,
        color: '#1e90ff', // Azul
        weapon: { range: 500, damage: 150, cooldown: 15, projectileSpeed: 18, type: 'rapid' }
    }
};

// 3. Lógica de Exportação
// Isso aqui é um "truque" técnico para o arquivo funcionar tanto no Node.js quanto no Navegador
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { CONSTANTS, CHARACTERS };
} else {
    window.Shared = { CONSTANTS, CHARACTERS };
}