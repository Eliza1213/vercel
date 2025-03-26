const express = require("express");
const cors = require("cors");
const conectarDB = require("./Config/db");
require("dotenv").config();



const app = express();
const port = process.env.PORT || 4000;

// Middleware para parsear JSON y habilitar CORS
app.use(express.json());
app.use(cors());

// Conectar a la base de datos
conectarDB();

// Rutas API existentes
app.use("/api/usuarios", require("./routes/userRoutes"));
app.use("/api/misiones", require("./routes/MisionRoutes"));
app.use("/api/visiones", require("./Routes/VisionRoutes"));
app.use("/api/terminos", require("./Routes/TerminoRoutes"));
app.use("/api/politicas", require("./Routes/PoliticaRoutes"));
app.use("/api/preguntas", require("./Routes/PreguntaRoutes"));
app.use("/api/contactos", require("./Routes/ContactoRoutes"));
app.use("/api/informaciones", require("./Routes/InformacionRoutes"));
app.use("/api/productos", require("./routes/ProductoRoutes"));

// Exportar la aplicación
module.exports = app;