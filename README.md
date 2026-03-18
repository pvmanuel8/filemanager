# File Manager - Proyecto React + FastAPI

Este proyecto se divide en dos partes: el **Backend** (Python/FastAPI) y el **Frontend** (React/Vite). Para que la aplicación funcione correctamente, ambas partes deben estar ejecutándose simultáneamente en terminales separadas.

## Requisitos Previos
- Tener Python instalado.
- Tener Node.js instalado (para ejecutar `npm`).
- Dependencias instaladas: Si es la primera vez, asegúrate de haber ejecutado `npm install` dentro de la carpeta `frontend`.

---

## 🚀 1. Arrancar el Servidor Backend (API en Python)

El backend se encarga de guardar y gestionar los archivos en la base de datos SQLite.

1. Abre una terminal.
2. Navega hasta la carpeta raíz del proyecto:
   ```bash
   cd C:\Users\pvman\Desktop\aprendiendo_python\filemanager
   ```
3. Ejecuta el servidor:
   ```bash
   python main.py
   ```
> *El servidor de FastAPI (Backend) estará funcionando y esperando peticiones en el puerto 8000.*

---

## 💻 2. Arrancar el Frontend (Interfaz web en React)

El frontend es la página web (la interfaz gráfica) desde donde subirás y verás los archivos.

1. Abre una **NUEVA** pestaña o ventana de terminal (sin cerrar la del backend).
2. Entra en la carpeta del frontend:
   ```bash
   cd C:\Users\pvman\Desktop\aprendiendo_python\filemanager\frontend
   ```
3. Inicia el entorno de desarrollo:
   ```bash
   npm run dev
   ```
> *Vite te mostrará una dirección, generalmente `http://localhost:5173/`. ¡Abre esa ruta en tu navegador para ver la web!*

---

🎉 **¡Listo!** Si ambas consolas están en marcha sin errores, tu aplicación completa funcionará perfectamente.
