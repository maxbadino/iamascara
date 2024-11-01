async function iniciarDeteccion() {
    const video = document.getElementById('video');
    const alerta = document.getElementById('alerta');

    // Acceder a la cámara
    navigator.mediaDevices.getUserMedia({ video: true })
        .then(stream => {
            video.srcObject = stream;
        })
        .catch(error => {
            console.error("Error al acceder a la cámara: ", error);
        });

    // Cargar el modelo de detección de objetos
    const modelo = await cocoSsd.load();

    // Detectar objetos en tiempo real
    video.addEventListener('loadeddata', () => {
        detectar(modelo, video, alerta);
    });
}

async function detectar(modelo, video, alerta) {
    const predicciones = await modelo.detect(video);

    // Comprobar si se detecta un celular en la imagen
    const celularDetectado = predicciones.some(prediccion => 
        prediccion.class === 'cell phone' && prediccion.score > 0.6
    );

    // Mostrar alerta si se detecta un celular
    if (celularDetectado) {
        alerta.innerText = "¡Alerta! Se detecta el uso de un celular.";
    } else {
        alerta.innerText = "";
    }

    // Repetir detección en bucle
    requestAnimationFrame(() => detectar(modelo, video, alerta));
}

// Iniciar el proceso
iniciarDeteccion();
