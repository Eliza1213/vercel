const mongoose = require("mongoose");

const contactoSchema = new mongoose.Schema({
  _id: { type: mongoose.Schema.Types.ObjectId, default: () => new mongoose.Types.ObjectId() }, // Genera automáticamente un ObjectId
  email: { type: String, required: true, match: /.+\@.+\..+/ }, // Valida que sea un email válido
  telefono: { type: String, required: true, match: /^[0-9]{10}$/ }, // Valida que el teléfono tenga exactamente 10 dígitos
  ubicacion: { type: String, required: true }, // Campo de ubicación
  redes_sociales: {
    type: [
      {
        nombre: { type: String, required: true }, // Nombre de la red social (Ej: Facebook, Twitter, Instagram)
        enlace: { type: String, required: true, match: /^(https?:\/\/).+/ }, // Enlace válido a la red social
      },
    ],
    default: [], // Por defecto, un array vacío
  },
});

const Contacto = mongoose.model("Contacto", contactoSchema);

module.exports = Contacto;