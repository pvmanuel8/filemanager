import { useState, useEffect } from 'react';
import './App.css';

import Sidebar from './components/Sidebar';
import Header from './components/Header';
import SearchBar from './components/SearchBar';
import DocumentCard from './components/DocumentCard';
import FileUpload from './components/FileUpload';

// 🌐 URL de tu backend en FastAPI. Toma el valor del archivo .env o usa localhost por defecto.
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

function App() {
    // Definimos el estado de la variable totalfiles
    const [totalfiles, settotalfiles] = useState([]);

    const fetchFiles = () => {
        // Hacemos peticion get a la API
        fetch(API_URL + '/files')
            .then(respuesta => respuesta.json())
            .then(datos => {
                // Guardamos solo la lista de archivos que viene en 'archivos'
                settotalfiles(datos.archivos);
            })
            .catch(error => console.log(error));
    };

    useEffect(() => {
        fetchFiles();
    }, []); // [] significa que se ejecutara solo una vez

    return (
        // Aqui llamamos al componente Sidebar
        <div className="app">
            <Sidebar />
            <main className='main-content'>
                {/* Le pasamos la 'longitud' (length) de la lista de archivos */}
                <Header totalfiles={totalfiles.length} />
                
                <FileUpload onFileUploaded={fetchFiles} />
                
                <SearchBar />



                <div className="cards-grid">
                    {totalfiles.map(archivo => (
                        <DocumentCard
                            key={archivo.id}
                            doc={{
                                title: archivo.nombre,
                                time: "Reciente",
                                size: `${(archivo.tamanho / 1024).toFixed(2)} KB`,
                                status: "Procesado",
                                description: "Documento en base de datos",
                                details: [
                                    "ID Database: " + archivo.id,
                                    "Extensión: " + archivo.nombre.split('.').pop().toUpperCase()
                                ]
                            }}
                        />
                    ))}
                </div>
            </main>
        </div>
    );
}

export default App;
