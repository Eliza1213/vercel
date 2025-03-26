const express = require("express");
const cors = require("cors");
const conectarDB = require("./Config/db");
const mqtt = require("mqtt");
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
const mqtt_server = "broker.emqx.io"; // Puedes cambiarlo a otro broker si hay problemas
const mqtt_port = 1883;
const mqtt_client_id = `TortuTerraBridge_${Math.random().toString(16).substr(2, 8)}`;

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
const mqttClient = mqtt.connect(`mqtt://${mqtt_server}:${mqtt_port}`, {
  clientId: mqtt_client_id
});

// Conexión MQTT
mqttClient.on("connect", () => {
  console.log("✅ Conectado a MQTT broker:", mqtt_server);
  mqttClient.subscribe("tortu_terra/#", (err) => {
    if (err) {
      console.error("❌ Error al suscribirse a tópicos MQTT:", err);
    } else {
      console.log("📡 Suscrito a: tortu_terra/#");
    }
  });
});

// Recibir mensajes MQTT
mqttClient.on("message", (topic, message) => {
  console.log(`📩 Mensaje MQTT recibido [${topic}]: ${message.toString()}`);

  try {
    switch (topic) {
      case "tortu_terra/status":
        terrarioStatus = JSON.parse(message.toString());
        console.log("✅ Estado del terrario actualizado:", terrarioStatus);
        break;
      case "tortu_terra/temperature":
        terrarioStatus.temperature = parseFloat(message.toString());
        break;
      case "tortu_terra/fan":
        terrarioStatus.fanState = message.toString() === "on";
        break;
      case "tortu_terra/lamp":
        terrarioStatus.lampState = message.toString() === "on";
        break;
      case "tortu_terra/turtle":
        terrarioStatus.turtleActivity = message.toString() === "active";
        break;
      default:
        console.warn(`⚠️ Tópico desconocido: ${topic}`);
    }
  } catch (error) {
    console.error("❌ Error al procesar mensaje MQTT:", error);
  }
});

// Rutas API
app.use("/api/usuarios", UsuarioRoutes);
app.use("/api/terrario", TerrarioRoutes);

// Endpoint para obtener el estado del terrario
app.get("/api/terrario/status", (req, res) => {
  res.status(200).json(terrarioStatus);
});

// Ruta para el control de actuadores
app.post("/api/control", (req, res) => {
  const { actuador, accion } = req.body;

  if (!actuador || !accion) {
    return res.status(400).json({ message: "❌ Datos incompletos: faltan actuador o acción." });
  }

  console.log(`📢 Recibido: Actuador - ${actuador}, Acción - ${accion}`);

  let comando = "";
  switch (actuador) {
    case "fan":
    case "lamp":
    case "dispense":
      comando = actuador;
      break;
    default:
      return res.status(400).json({ message: "❌ Actuador no reconocido." });
  }

  const payload = JSON.stringify({ cmd: comando, accion });
  mqttClient.publish("tortu_terra/command", payload, (err) => {
    if (err) {
      console.error("❌ Error al publicar mensaje MQTT:", err);
      return res.status(500).json({ message: "❌ Error al enviar comando al terrario." });
    }
    console.log(`📡 Comando MQTT enviado: ${payload}`);
    res.status(200).json({ message: "✅ Acción enviada con éxito." });
  });
});

// Manejo de errores MQTT
mqttClient.on("error", (error) => console.error("❌ Error en MQTT:", error));
mqttClient.on("close", () => console.log("⚠️ Conexión MQTT cerrada"));
mqttClient.on("reconnect", () => console.log("🔄 Intentando reconectar a MQTT"));

// Iniciar servidor
app.listen(port, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${port}`);
});
