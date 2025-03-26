const express = require("express");
const cors = require("cors");
const conectarDB = require("./Config/db");
require("dotenv").config();

// Importar las rutas
const TerrarioRoutes = require("./routes/TerrarioRoutes");
const UsuarioRoutes = require("./routes/UsuarioRoutes");

const app = express();

// Middleware para parsear JSON y habilitar CORS
app.use(express.json());
app.use(cors());

// Conectar a la base de datos
conectarDB();

// Manejo de favicon
app.get("/favicon.ico", (req, res) => res.status(204));

// Ruta raíz
app.get("/", (req, res) => {
  res.send("Bienvenido a Terrario API.");
});

// Rutas API existentes
app.use("/api/usuarios", require("./routes/userRoutes"));
app.use("/api/misiones", require("./routes/MisionRoutes"));
app.use("/api/visiones", require("./routes/VisionRoutes"));
app.use("/api/terminos", require("./routes/TerminoRoutes"));
app.use("/api/politicas", require("./routes/PoliticaRoutes"));
app.use("/api/preguntas", require("./routes/PreguntaRoutes"));
app.use("/api/contactos", require("./routes/ContactoRoutes"));
app.use("/api/informaciones", require("./routes/InformacionRoutes"));
app.use("/api/productos", require("./routes/ProductoRoutes"));

// Exportar la aplicación
module.exports = app;
