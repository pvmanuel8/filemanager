import sqlite3

class Database:
    # Metodo constructor: Se ejecuta al crear un objeto Database.
    # Define dónde se guardará el archivo de la base de datos local (SQLite).
    def __init__(self, db_path="database.db"):
        self.db_path = db_path

    # Obtiene y devuelve una conexión abierta a la base de datos para poder interactuar con ella.
    def get_connection(self):
        return sqlite3.connect(self.db_path)

    # Crea la estructura de la tabla 'archivos' si no existía previamente.
    def create_tables(self):
        # NOTA: Quité la coma final después de 'contenido BLOB NOT NULL' porque causaba un error de SQL.
        query = """
        CREATE TABLE IF NOT EXISTS archivos (
         id INTEGER PRIMARY KEY AUTOINCREMENT,
         nombre TEXT NOT NULL,
         tamanho INTEGER NOT NULL,
         contenido BLOB NOT NULL
        )
        """
        # Tenemos que abrir conexión y ejecutar la consulta para que la tabla realmente se cree.
        conn = self.get_connection()
        cursor = conn.cursor()
        cursor.execute(query)
        conn.commit()
        conn.close()

    # Recibe los datos de un archivo y los guarda como una nueva fila en la base de datos.
    def save_file(self, nombre, tamanho, contenido):
        conn = self.get_connection()
        cursor = conn.cursor()
        # Los '?' son parámetros seguros para evitar ataques de inyección SQL.
        cursor.execute("INSERT INTO archivos (nombre, tamanho, contenido) VALUES (?,?,?)", (nombre, tamanho, contenido))
        conn.commit()  # Guarda los cambios permanentemente
        conn.close()   # Cierra la conexión para liberar recursos




    # Devuelve una lista con todos los archivos guardados, pero SIN ENVIAR LOS BYTES
    def get_all_files(self):
        conn = self.get_connection()
        # Esto nos permite acceder a las columnas por su nombre en vez de por índice numérico
        conn.row_factory = sqlite3.Row 
        cursor = conn.cursor()
        
        # OJO: Solo pedimos id, nombre y tamaño. ¡NO pedimos el contenido BLOB!
        cursor.execute("SELECT id, nombre, tamanho FROM archivos")
        
        # fetchall() coge absolutamente todas las filas que ha encontrado la consulta
        filas = cursor.fetchall()
        conn.close()
        
        # Convertimos las filas de la base de datos a una lista normal de diccionarios de Python
        resultado = []
        for fila in filas:
            resultado.append(dict(fila))
            
        return resultado



    # Nuevo Método para obtener un archivo específico por su ID único
    def get_file_by_id(self, file_id):
        # 1. Abrimos conexión a la base de datos
        conn = self.get_connection()
        # Activamos row_factory para que el resultado sea como un diccionario y no una simple tupla (lista sin nombres)
        conn.row_factory = sqlite3.Row 
        cursor = conn.cursor()
        
        # 2. Ejecutamos la consulta buscando un id exacto.
        # Volvemos a usar el '?' por seguridad y le pasamos la variable (file_id,) como una tupla.
        cursor.execute("SELECT id, nombre,tamanho FROM archivos WHERE id = ?", (file_id,))
        
        # 3. Extraemos el resultado.
        # A diferencia de fetchall() que traía todos, fetchone() trae SOLO EL PRIMERO que encuentre (o None si no existe).
        # Como los IDs son únicos, sabemos que como mucho va a encontrar 1 archivo.
        fila = cursor.fetchone()
        
        # 4. Cerramos conexión
        conn.close()
        
        # 5. Devolvemos el resultado.
        # Si 'fila' tiene algo (se encontró el archivo), lo convertimos a diccionario y lo devolvemos.
        # Si 'fila' es None (no existe ese ID en la base de datos), devolvemos None.
        return dict(fila) if fila else None




    # Método para ELIMINAR un archivo de la base de datos por su ID
    def delete_file(self, file_id):
        # 1. Abrimos la conexión con la base de datos
        conn = self.get_connection()
        cursor = conn.cursor()

        # 2. Ejecutamos la orden DELETE (Borrar).
        # IMPORTANTE: Acuérdate de la coma al final de (file_id,) para que Python lo trate como Tupla.
        cursor.execute("DELETE FROM archivos WHERE id = ?", (file_id,))
        
        # 3. Guardamos los cambios permanentemente. (Obligatorio cuando insertas, actualizas o borras datos)
        conn.commit()
        
        # 4. Cerramos la conexión para liberar recursos
        conn.close()

        # 5. Devolvemos True para saber que la función ha terminado de ejecutarse con éxito
        return True

    # Método para DESCARGAR un archivo (necesitamos recuperar el BLOB)
    def get_file_content(self, file_id):
        conn = self.get_connection()
        conn.row_factory = sqlite3.Row 
        cursor = conn.cursor()
        
        # OJO: Aquí sí que pedimos explícitamente el 'contenido' (el BLOB gigante) y el 'nombre'.
        cursor.execute("SELECT contenido, nombre FROM archivos WHERE id = ?", (file_id,))
        fila = cursor.fetchone()
        
        conn.close()
        
        return dict(fila) if fila else None