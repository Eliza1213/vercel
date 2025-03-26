const mongoose = require("mongoose");

const conectarDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI); // Sin opciones adicionales
    console.log("✅ Conectado a MongoDB Atlas");
  } catch (error) {
    console.error("❌ Error al conectar a MongoDB:", error);
    process.exit(1); // Finaliza la aplicación si hay un error
  }
};

module.exports = conectarDB;
