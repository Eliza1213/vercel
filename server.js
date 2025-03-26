const express = require("express");
const cors = require("cors");
const conectarDB = require("./Config/db");
const mqtt = require('mqtt');
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

// Configuración MQTT
const mqtt_server = "broker.emqx.io";
const mqtt_port = 1883;
const mqtt_client_id = "TortuTerraBridge_" + Math.random().toString(16).substr(2, 8);

// Estado del terrario
let terrarioStatus = {
  temperature: 25.0,
  fanState: false,
  foodLevel: "Regular",
  turtleActivity: false,
  stableTemp: 24.0,
  maxTemp: 30.0,
  lampState: false
};

// Crear cliente MQTT
const mqttClient = mqtt.connect("mqtt://${mqtt_server}:${mqtt_port}", {
  clientId: mqtt_client_id
});

// Conexión MQTT
mqttClient.on('connect', function () {
  console.log('Conectado a MQTT broker');
  mqttClient.subscribe('tortu_terra/#', function (err) {
    if (err) {
      console.error('Error al suscribirse a tópicos MQTT:', err);
    } else {
      console.log('Suscrito a tópicos tortu_terra/#');
    }
  });
});

// Recibir mensajes MQTT
mqttClient.on('message', function (topic, message) {
  console.log("Mensaje MQTT recibido [${topic}]: ${message.toString()}");
  
  if (topic === 'tortu_terra/status') {
    try {
      terrarioStatus = JSON.parse(message.toString());
      console.log('Estado del terrario actualizado:', terrarioStatus);
    } catch (error) {
      console.error('Error al procesar estado del terrario:', error);
    }
  } else if (topic === 'tortu_terra/temperature') {
    try {
      terrarioStatus.temperature = parseFloat(message.toString());
    } catch (error) {
      console.error('Error al procesar temperatura:', error);
    }
  } else if (topic === 'tortu_terra/fan') {
    terrarioStatus.fanState = message.toString() === 'on';
  } else if (topic === 'tortu_terra/lamp') {
    terrarioStatus.lampState = message.toString() === 'on';
  } else if (topic === 'tortu_terra/turtle') {
    terrarioStatus.turtleActivity = message.toString() === 'active';
  }
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
app.use("/api/usuarios", UsuarioRoutes);
app.use("/api/terrario", TerrarioRoutes);

// Endpoint para obtener el estado del terrario
app.get("/api/terrario/status", (req, res) => {
  res.status(200).json(terrarioStatus);
});

// Ruta para el control de actuadores
app.post("/api/control", (req, res) => {
  const { actuador, accion } = req.body;

  // Verificar datos recibidos
  if (!actuador || !accion) {
    return res.status(400).json({ message: "Datos incompletos: faltan actuador o acción." });
  }

  console.log("Recibido: Actuador - ${actuador}, Acción - ${accion}");

  let comando = "";
  
  // Convertir parámetros HTTP a comandos MQTT
  switch (actuador) {
    case "fan":
      comando = "fan";
      break;
    case "lamp":
      comando = "lamp";
      break;
    case "dispense":
      comando = "dispense";
      break;
    default:
      return res.status(400).json({ message: "Actuador no reconocido." });
  }

  // Publicar comando en MQTT
  const payload = JSON.stringify({ cmd: comando });
  mqttClient.publish('tortu_terra/command', payload, function(err) {
    if (err) {
      console.error('Error al publicar mensaje MQTT:', err);
      return res.status(500).json({ message: "Error al enviar comando al terrario." });
    }
    
    console.log("Comando MQTT enviado: ${payload}");
    res.status(200).json({ message: "Acción enviada al terrario con éxito." });
  });
});

// Manejo de errores MQTT
mqttClient.on('error', function(error) {
  console.error('Error en la conexión MQTT:', error);
});

mqttClient.on('close', function() {
  console.log('Conexión MQTT cerrada');
});

mqttClient.on('reconnect', function() {
  console.log('Intentando reconectar a MQTT');
});

// Iniciar servidor
app.listen(port, () => {
  console.log("🚀 Servidor corriendo en http://localhost:${port}");
});