from pydantic import BaseModel

class ArchivoResponse(BaseModel):
    """
    Este es el 'formulario' que define exactamente qué datos
    le vamos a devolver al cliente (navegador web o app) 
    después de que haya subido un archivo con éxito a nuestra base de datos.
    """
    
    # 1. Queremos devolverle un mensaje de éxito ("Archivo subido correctamente")
    mensaje: str
    
    # 2. Queremos confirmarle qué nombre detectó nuestro servidor
    nombre_archivo: str
    
    # 3. Queremos devolver el tamaño en bytes para que el cliente lo sepa
    tamaño_bytes: int
    
    

    
