async function iniciarDeteccion() {
    const video = document.getElementById('video');
    const alerta = document.getElementById('alerta');
    const canvas = document.getElementById('canvas');
    const contexto = canvas.getContext('2d');

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

    // Ajustar el tamaño del canvas al video
    video.addEventListener('loadeddata', () => {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        detectar(modelo, video, alerta, contexto);
    });
}

async function detectar(modelo, video, alerta, contexto) {
    const predicciones = await modelo.detect(video);

    // Limpiar el canvas
    contexto.clearRect(0, 0, canvas.width, canvas.height);

    // Comprobar si se detecta un celular y dibujar el contorno
    let celularDetectado = false;
    predicciones.forEach(prediccion => {
        if (prediccion.class === 'cell phone' && prediccion.score > 0.6) {
            celularDetectado = true;

            // Dibujar contorno del celular
            contexto.strokeStyle = 'red';
            contexto.lineWidth = 4;
            contexto.strokeRect(
                prediccion.bbox[0], 
                prediccion.bbox[1], 
                prediccion.bbox[2], 
                prediccion.bbox[3]
            );
        }
    });

    // Mostrar alerta si se detecta un celular
    if (celularDetectado) {
        alerta.innerText = "¡Alerta! Se detecta el uso de un celular.";
    } else {
        alerta.innerText = "";
    }

    // Repetir detección en bucle
    requestAnimationFrame(() => detectar(modelo, video, alerta, contexto));
}

// Iniciar el proceso
iniciarDeteccion();
