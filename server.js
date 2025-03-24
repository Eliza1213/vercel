const express = require("express");
const cors = require("cors");
const conectarDB = require("./Config/db");
require("dotenv").config();

// Importar las rutas
const TerrarioRoutes = require("./routes/TerrarioRoutes");
const UsuarioRoutes = require("./routes/UsuarioRoutes");

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
app.use("/api/visiones", require("./routes/VisionRoutes"));
app.use("/api/terminos", require("./routes/TerminoRoutes"));
app.use("/api/politicas", require("./routes/PoliticaRoutes"));
app.use("/api/preguntas", require("./routes/PreguntaRoutes"));
app.use("/api/contactos", require("./routes/ContactoRoutes"));
app.use("/api/informaciones", require("./routes/InformacionRoutes"));
///agregacion de la parte de productos
//lol xD
app.use("/api/productos", require("./routes/ProductoRoutes"));
app.use("/api/usuarios", UsuarioRoutes);
app.use("/api/terrario", TerrarioRoutes); // Ahora está correctamente importado

// Nueva ruta para el control de actuadores
app.post("/api/control", (req, res) => {
  const { actuador, accion } = req.body;

  // Verificar datos recibidos
  if (!actuador || !accion) {
    return res.status(400).json({ message: "Datos incompletos: faltan actuador o acción." });
  }

  console.log(`Recibido: Actuador - ${actuador}, Acción - ${accion}`);

  // Lógica de control de actuadores
  switch (actuador) {
    case "fan":
      if (accion === "on") {
        console.log("Encendiendo el ventilador...");
      } else if (accion === "off") {
        console.log("Apagando el ventilador...");
      } else {
        return res.status(400).json({ message: "Acción no válida para el ventilador." });
      }
      break;

    case "lamp":
      if (accion === "on") {
        console.log("Encendiendo la lámpara...");
      } else if (accion === "off") {
        console.log("Apagando la lámpara...");
      } else {
        return res.status(400).json({ message: "Acción no válida para la lámpara." });
      }
      break;

    default:
      return res.status(400).json({ message: "Actuador no reconocido." });
  }

  // Responder con éxito
  res.status(200).json({ message: "Acción realizada con éxito." });
});

// Iniciar servidor
app.listen(port, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${port}`);
});