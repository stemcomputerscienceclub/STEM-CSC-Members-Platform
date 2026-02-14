class TerminalSimulator {
    constructor(outputElement) {
        this.output = outputElement;
        this.typeSpeed = 50;
        this.commands = [
            { text: '> Loading STEM CS Club...', type: 'info', delay: 500 },
            { text: '> Ready!', type: 'success', delay: 500 }
        ];
    }

    async typeText(text, type = 'info') {
        const line = document.createElement('div');
        line.classList.add(type);
        this.output.appendChild(line);

        for (let char of text) {
            line.textContent += char;
            await this.sleep(this.typeSpeed);
        }
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    async runSimulation() {
        for (let command of this.commands) {
            await this.sleep(command.delay);
            await this.typeText(command.text, command.type);
        }

        setTimeout(() => {
            window.location.href = 'auth.html';
        }, 500);
    }
}

window.addEventListener('DOMContentLoaded', () => {
    const outputElement = document.getElementById('output');
    const terminal = new TerminalSimulator(outputElement);
    terminal.runSimulation();
});
