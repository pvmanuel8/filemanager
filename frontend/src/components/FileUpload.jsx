import { useRef, useState } from 'react';

// Este componente recibe una función 'onFileUploaded' que se ejecutará cuando la subida sea un éxito.
export default function FileUpload({ onFileUploaded }) {
    // Estado para saber si el usuario está arrastrando un archivo sobre la caja (para cambiar el color al acercarse)
    const [dragActive, setDragActive] = useState(false);
    // Estado para saber si el archivo se está subiendo y reaccionar mostrando el texto "Subiendo archivo..."
    const [uploading, setUploading] = useState(false);
    
    // Referencia al elemento <input type="file"> (que está oculto) para poder "pulsarlo" dinámicamente mediante código
    const inputRef = useRef(null);

    // URL de nuestro backend en FastAPI
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

    // Función que maneja cuando el archivo entra, se mueve por encima o sale de la zona punteada
    const handleDrag = (e) => {
        e.preventDefault(); // Evitamos que el navegador abra el archivo directamente por defecto (ej. abriendo un visor de PDF)
        e.stopPropagation();
        
        // Si el archivo "entra" o "se mueve por encima" de la zona, activamos el flag visual dragActive a true
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            // Si el archivo pasa de largo y "sale" de la zona punteada, desactivamos el efecto visual
            setDragActive(false);
        }
    };

    // Función que se dispara cuando el usuario SUELTA el archivo dentro de la caja fuerte de subida
    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false); // Quitamos el estilo porque ya lo ha soltado y no está en el aire
        
        // Si verdaderamente nos tiró archivos encima (al menos uno) se lo mandamos a la función de subir
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            uploadFile(e.dataTransfer.files[0]);
        }
    };

    // Función que se dispara si en lugar de arrastrar, el usuario hizo clic en "selecciona un archivo" y eligió uno en la ventanita
    const handleChange = (e) => {
        e.preventDefault();
        // Cogemos el archivo clásico del event target y lo mandamos a la función general de subir
        if (e.target.files && e.target.files[0]) {
            uploadFile(e.target.files[0]);
        }
    };

    // Esta función simula un "clic falso" en el input <input type="file"> oculto cuando tocamos el texto en pantalla.
    const handleButtonClick = () => {
        inputRef.current.click();
    };

    // ---------- EL "MOTOR" DE SUBIDA ---------- 
    // Envía el archivo físico final a nuestro backend en FastAPI.
    const uploadFile = async (file) => {
        setUploading(true); // Bloqueamos la caja y cambiamos el texto a "Subiendo archivo..."
        
        // FormData es la caja especial del sistema que requieren los navegadores para poder mandar archivos (Binaries) por internet
        const formData = new FormData();
        formData.append("file", file); // Metemos nuestro archivo dentro de esta caja de envío

        try {
            // Hacemos la petición POST a FastAPI igual a como lo hacías desde ThunderClient/Swagger
            const response = await fetch(`${API_URL}/uploadfile`, {
                method: "POST",
                body: formData, // Mandamos la caja contenedora
            });
            
            // Si la respuesta del servidor es correcta (ej. un HTTP 200 OK)
            if (response.ok) {
                // Si App.jsx nos mandó su función 'fetchFiles' amarrada a la propiedad 'onFileUploaded', la ejecutamos ahora.
                // ¡Esto es lo que provoca que App.jsx vuelva a leer la BD y aparezca mágicamente la tarjeta en pantalla!
                if (onFileUploaded) onFileUploaded();
            } else {
                console.error("Error al subir el archivo");
            }
        } catch (error) {
            console.error("Error general de subida:", error);
        } finally {
            // finally ocurre SIEMPRE al final, tanto si fue bien (try) como si rompió (catch)
            setUploading(false); // Devolvemos el estado a que ya no estamos subiendo nada
            
            // Limpiamos el valor del input. Si no hacemos esto, el navegador recordará el nombre 
            // y si quieres subir un archivo con el MISMO nombre justo después, no haría nada.
            if (inputRef.current) inputRef.current.value = "";
        }
    };

    return (
        <div
            className="upload-box"
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop} // Salta al soltar los archivos
            style={{
                // Estilamos la caja dinámicamente si dragActive está en True (el archivo "levita" por encima)
                borderColor: dragActive ? '#3fe0b5' : '',
                backgroundColor: dragActive ? 'rgba(63, 224, 181, 0.05)' : '',
                transition: 'all 0.3s ease'
            }}
        >
            {/* 
              Este es el input real que sube archivos al vuelo y abre la ventana clásica de Windows.
              Como visualmente es un botón gris feo (el de la web tradicional de hace 20 años),
              lo ocultamos con display: "none" para dibujar algo bonito por nuestra cuenta.
             */}
            <input
                ref={inputRef}
                type="file"
                onChange={handleChange}
                style={{ display: "none" }}
            />
            
            {/* Condicional Reactivo: Si uploading=TRUE mostramos la primera "P", si es FALSE la parte de abajo */}
            {uploading ? (
                <p>Subiendo archivo...</p>
            ) : (
                <p>
                    Arrastra tus archivos aquí o{' '}
                    <span onClick={handleButtonClick}>selecciona un archivo</span>
                </p>
            )}
        </div>
    );
}
