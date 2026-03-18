import { useState, useEffect } from 'react';
import './App.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

function App() {
    const [files, setFiles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isDragging, setIsDragging] = useState(false);

    // Cargar archivos al iniciar la aplicación
    useEffect(() => {
        fetchFiles();
    }, []);

    const fetchFiles = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${API_URL}/files`);
            if (response.ok) {
                const data = await response.json();
                setFiles(data.archivos);
            }
        } catch (error) {
            console.error("Error cargando archivos:", error);
        } finally {
            setLoading(false);
        }
    };

    // Lógica para formatear el tamaño legible (KB, MB)
    const formatBytes = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    // Handlers para interactuar con la API
    const handleFileUpload = async (e) => {
        const selectedFile = e.target.files?.[0];
        if (!selectedFile) return;

        const formData = new FormData();
        formData.append('file', selectedFile);

        try {
            const response = await fetch(`${API_URL}/uploadfile`, {
                method: 'POST',
                body: formData,
            });

            if (response.ok) {
                // Recargar la lista de archivos para mostrar el nuevo
                fetchFiles();
            } else {
                alert("Error al subir el archivo");
            }
        } catch (error) {
            console.error("Error en la subida:", error);
        }

        // Resetear el input
        e.target.value = null;
    };

    const handleDelete = async (fileId) => {
        if (!window.confirm("¿Seguro que quieres eliminar este archivo?")) return;

        try {
            const response = await fetch(`${API_URL}/files/${fileId}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                // Actualizar el estado local en vez de hacer otra llamada a la API para ser más rápidos
                setFiles(files.filter(f => f.id !== fileId));
            }
        } catch (error) {
            console.error("Error al eliminar:", error);
        }
    };

    const handleDownload = (fileId, fileName) => {
        // Para descargas, lo más fácil es usar window.open o crear un enlace temporal
        // Esto conectará directamente con nuestro endpoint de Response binario.
        window.location.href = `${API_URL}/files/${fileId}/download`;
    };

    // UI Drag & Drop
    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setIsDragging(true);
        } else if (e.type === 'dragleave') {
            setIsDragging(false);
        }
    };

    const handleDrop = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);

        const droppedFile = e.dataTransfer.files?.[0];
        if (droppedFile) {
            // Re-utilizamos la misma lógica pero creando un pseudo-evento
            handleFileUpload({ target: { files: [droppedFile] } });
        }
    };

    return (
        <div className="app-container">
            <header className="header">
                <h1>Gestor de Archivos</h1>
                <p>Almacenamiento local mediante FastAPI y SQLite</p>
            </header>

            <div
                className={`glass upload-section ${isDragging ? 'drag-active' : ''}`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
            >
                <div className="upload-content">
                    <div className="upload-icon">☁️</div>
                    <div className="upload-text">
                        <h3>Sube un nuevo archivo</h3>
                        <p>Haz clic o arrastra un archivo aquí</p>
                    </div>
                </div>
                <input
                    type="file"
                    className="file-input"
                    onChange={handleFileUpload}
                    title="Seleccionar archivo"
                />
            </div>

            <main>
                {loading ? (
                    <div className="loading-spinner">Cargando tus archivos...</div>
                ) : files.length === 0 ? (
                    <div className="glass empty-state">
                        <span>📁</span>
                        <h2>No hay archivos</h2>
                        <p>Sube tu primer documento usando la caja de arriba.</p>
                    </div>
                ) : (
                    <div className="file-grid">
                        {files.map((file) => (
                            <div key={file.id} className="glass file-card">
                                <div className="file-info">
                                    <div className="file-icon">📄</div>
                                    <div className="file-details">
                                        <div className="file-name" title={file.nombre}>
                                            {file.nombre}
                                        </div>
                                        <div className="file-size">
                                            {formatBytes(file.tamanho)}
                                        </div>
                                    </div>
                                </div>

                                <div className="file-actions">
                                    <button
                                        className="btn btn-download"
                                        onClick={() => handleDownload(file.id)}
                                    >
                                        ⬇️ Descargar
                                    </button>
                                    <button
                                        className="btn btn-delete"
                                        onClick={() => handleDelete(file.id)}
                                    >
                                        🗑️ Borrar
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}

export default App;
