function incrementNumber() {
    const porcentLabel = document.getElementById('porcentLabel');
    const RPMLabel = document.getElementById('RPMLabel');
    
    let porcentValue = parseInt(porcentLabel.textContent);
    let RPMValue = parseInt(RPMLabel.textContent);
    
    if (porcentValue < 100) {
        porcentValue += 10;
        RPMValue = Math.round((porcentValue / 100) * 1700);
        
        porcentLabel.textContent = `${porcentValue}%`;
        RPMLabel.textContent = `${RPMValue} RPM`;
    }
}

function decrementNumber() {
    const porcentLabel = document.getElementById('porcentLabel');
    const RPMLabel = document.getElementById('RPMLabel');
    
    let porcentValue = parseInt(porcentLabel.textContent);
    let RPMValue = parseInt(RPMLabel.textContent);
    
    if (porcentValue > 0) {
        porcentValue -= 10;
        RPMValue = Math.round((porcentValue / 100) * 1700);
        
        porcentLabel.textContent = `${porcentValue}%`;
        RPMLabel.textContent = `${RPMValue} RPM`;
    }
}

//===========================================================//

document.addEventListener('DOMContentLoaded', () => {
    const updateButtonState = () => {
        fetch('/deMatlab')
            .then(response => response.json())
            .then(data => {
                const submitButton = document.getElementById('submitButton');
                if (data.communicationSettings.state === 'on') {
                    submitButton.value = 'Desconectar';
                    submitButton.style.backgroundColor = 'red';
                } else {
                    submitButton.value = 'Conectar';
                    submitButton.style.backgroundColor = 'green';
                }

                const startButton = document.getElementById('startButton');
                if (data.systemRequirements.state === 'on') {
                    startButton.textContent = 'Detener';
                    startButton.style.backgroundColor = 'red';
                } else {
                    startButton.textContent = 'Iniciar';
                    startButton.style.backgroundColor = 'green';
                }
            });
    };

    const updateAvailablePorts = () => {
        fetch('/deMatlab')
            .then(response => response.json())
            .then(data => {
                const portSelect = document.getElementById('port');
                const selectedPort = portSelect.value; // Guardar el valor seleccionado
                portSelect.innerHTML = ''; // Limpiar las opciones actuales
                data.communicationSettings.avalibleCOM.forEach(com => {
                    const option = document.createElement('option');
                    option.value = com;
                    option.textContent = com;
                    portSelect.appendChild(option);
                });
                portSelect.value = selectedPort; // Restablecer el valor seleccionado
            });
    };

    const updateMonitoringData = () => {
        fetch('/deMatlab')
            .then(response => response.json())
            .then(data => {
                document.getElementById('speedMotor').textContent = `RPM: ${data.monitoring.speedMotor.toFixed(2)}`;
                document.getElementById('time').textContent = `Tiempo: ${data.monitoring.time.toFixed(2)}`;
            });
    };

    const updateChart = () => {
        fetch('/deMatlab')
            .then(response => response.json())
            .then(data => {
                const time = parseFloat(data.monitoring.time).toFixed(2);
                const speedMotor = parseFloat(data.monitoring.speedMotor).toFixed(2);
                updateChartData(time, speedMotor);
            })
            .catch(error => console.error('Error al leer output.json:', error));
    };

    // Inicializar la gráfica al cargar la página
    initializeChart();
    setInterval(updateChart, 100); // Leer el archivo cada 100 ms

    // Actualizar el estado del botón cada 500 ms
    setInterval(updateButtonState, 500);

    // Actualizar los puertos disponibles cada 500 ms
    setInterval(updateAvailablePorts, 500);

    // Actualizar los datos de monitoreo cada 500 ms
    setInterval(updateMonitoringData, 500);
});

let chart = null;
let timeData = new Set();

// Inicializar la gráfica con Chart.js
function initializeChart() {
    const ctx = document.getElementById('myChart').getContext('2d');
    chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: [], // Etiquetas de tiempo
            datasets: [{
                label: 'Velocidad del Motor (RPM)',
                data: [], // Datos de velocidad del motor
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 2,
                fill: false,
                pointRadius: 0 // Quitar los puntos en la gráfica
            }]
        },
        options: {
            scales: {
                x: {
                    type: 'linear',
                    position: 'bottom',
                    title: {
                        display: true,
                        text: 'Tiempo (s)'
                    }
                },
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Velocidad del Motor (RPM)'
                    }
                }
            }
        }
    });
}

// Función para actualizar la gráfica con nuevos datos
function updateChartData(time, value) {
    if (!timeData.has(time)) {
        timeData.add(time);
        chart.data.labels.push(time);
        chart.data.datasets[0].data.push(value);
        chart.update();
    }
}

function handleFormSubmit(event) {
    event.preventDefault(); // Evita que el formulario recargue la página

    const port = document.getElementById('port').value;
    const baudrate = document.getElementById('baud').value;
    const submitButton = document.getElementById('submitButton');
    const action = submitButton.value === 'Conectar' ? 'on' : 'off';

    fetch('/updateInput', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ port, baudrate, action })
    })
    .then(response => response.text())
    .then(data => {
        console.log(data);
        // Actualizar el estado del botón después de enviar los datos
        if (action === 'on') {
            submitButton.value = 'Desconectar';
            submitButton.style.backgroundColor = 'red';
        } else {
            submitButton.value = 'Conectar';
            submitButton.style.backgroundColor = 'green';
        }
    })
    .catch(error => console.error('Error:', error));
}

function handleSetpointSubmit() {
    const RPMLabel = document.getElementById('RPMLabel');
    const setpoint = parseInt(RPMLabel.textContent);

    fetch('/updateInput', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ setpoint })
    })
    .then(response => response.text())
    .then(data => {
        console.log(data);
    })
    .catch(error => console.error('Error:', error));
}

function handleStart() {
    const startButton = document.getElementById('startButton');
    const state = startButton.textContent === 'Iniciar' ? 'on' : 'off';

    fetch('/updateInput', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ state })
    })
    .then(response => response.text())
    .then(data => {
        console.log(data);
        // Cambiar el estado del botón después de enviar los datos
        if (state === 'on') {
            startButton.textContent = 'Detener';
            startButton.style.backgroundColor = 'red';
        } else {
            startButton.textContent = 'Iniciar';
            startButton.style.backgroundColor = 'green';
        }
    })
    .catch(error => console.error('Error:', error));
}