# 1. Importaciones necesarias para crear la API y manejar archivos
# Añadimos HTTPException y Response para manejar errores y descargar archivos
from fastapi import FastAPI, File, UploadFile, HTTPException, Response
from fastapi.middleware.cors import CORSMiddleware
from database import Database
from schemas import ArchivoResponse

# 2. Inicializamos la aplicación FastAPI (El servidor principal)
app = FastAPI()

# 2.1 Configuración de CORS
# Esto permite que nuestra web en React (que correrá en el puerto 5173) se comunique
# libremente con nuestro servidor Python (que corre en el puerto 8000) sin ser bloqueado.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # En producción se pondría ["http://localhost:5173"] por seguridad
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 3. Creamos una instancia de nuestra clase Database para usarla en toda la app
db = Database()

# 4. EVENTO STARTUP: Se ejecuta mágicamente justo ANTES de que el servidor acepte visitas.
# Lo usamos para asegurarnos de que la tabla 'archivos' exista en SQLite.
@app.on_event("startup")
def startup():
    db.create_tables()

# 5. EL ENDPOINT PRINCIPAL (La Raíz)
# Si alguien entra a http://127.0.0.1:8000/ le saldrá este mensaje de bienvenida.
@app.get("/")
def read_root():
    return {"mensaje": "¡Bienvenido a mi API de Gestor de Archivos!"}

# 6. EL ENDPOINT POST: Esta es la "URL" a la que el usuario enviará su archivo.
# - "/uploadfile": Es la ruta web.
# - response_model: Le decimos a FastAPI que la respuesta final debe tener la forma de nuestro ArchivoResponse.
@app.post("/uploadfile", response_model=ArchivoResponse)
async def upload_file(file: UploadFile = File(...)):
    # PASO A: Leer el archivo.
    # 'await' espera a que se carguen todos los bytes en la RAM (ya que es una operacion lenta/asíncrona).
    contenido = await file.read()
    
    # PASO B: INTENTAR Guardar en Base de Datos.
    # Usamos bloque try-except para que si falla la base de datos, no se rompa todo el servidor.
    try:
        # Llamamos a nuestro método personalizado, pasándole nombre, longitud en bytes, y el contenido puro.
        db.save_file(file.filename, len(contenido), contenido)
    
    except Exception as e:
        # Si ocurre CUALQUIER error en la línea de arriba (ej: disco lleno, base de datos bloqueada...)
        # Entramos aquí, pillamos el botón del pánico (HTTPException) y lo pulsamos (raise).
        # El código 500 significa "Error Interno del Servidor"
        # Incluimos en el detalle el error exacto que nos dio Python (str(e))
        raise HTTPException(
            status_code=500, 
            detail=f"Error al guardar en la base de datos: {str(e)}"
        )
        
    # PASO C: Responder al usuario.
    # Si todo fue bien, llegamos aquí y le devolvemos un objeto ArchivoResponse.
    return ArchivoResponse(
        mensaje="Archivo subido correctamente",
        nombre_archivo=file.filename,
        tamaño_bytes=len(contenido)
    )

# NUEVO ENDPOINT PARA LISTAR ARCHIVOS
@app.get("/files")
def list_file():
    archivos = db.get_all_files()
    return {"archivos": archivos}

# 6. CONFIGURACIÓN DE ARRANQUE MANUAL (El "botón de encendido")
# Si ejecutamos este archivo directamente en la terminal (python main.py), arranca el servidor.
if __name__ == "__main__":
    import uvicorn
    # reload=True hace que el servidor se reinicie automáticamente al guardar cambios en el código.
    # IMPORTANTE: Al usar reload=True, hay que pasar el nombre del archivo y la app como texto ("main:app")
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)



# NUEVO ENDPOINT PARA BUSCAR POR ID (MUESTRA SOLO METADATOS)
@app.get("/files/{file_id}")
def get_file(file_id: int):
    # Ya le hemos dicho a la base de datos que SOLO traiga id, nombre y tamaño.
    archivo = db.get_file_by_id(file_id)

    if archivo is None:
        raise HTTPException(status_code=404, detail="Archivo no encontrado")
    
    # Como ya no tenemos el BLOB, podemos devolver el diccionario directamente.
    # FastAPI lo transformará mágicamente en JSON para mostrarlo en pantalla.
    return archivo


@app.delete("/files/{file_id}")
def delete_file(file_id : int):
    # Llamamos al método de la base de datos
    db.delete_file(file_id)
    # Devolvemos un mensaje de éxito
    return {"mensaje": "Archivo eliminado correctamente"}

# NUEVO ENDPOINT PARA DESCARGAR UN ARCHIVO FÍSICO
@app.get("/files/{file_id}/download")
def download_file(file_id: int):
    # Pedimos a la BD el archivo COMPLETO (contenido gigante incluido)
    archivo = db.get_file_content(file_id)

    if archivo is None:
        raise HTTPException(status_code=404, detail="Archivo no encontrado")
    
    # Devolvemos una 'Response' pura de FastAPI con los bytes y el cabecero de descarga
    return Response(
        content=archivo["contenido"],
        headers={"Content-Disposition": f'attachment; filename="{archivo["nombre"]}"'}
    )
