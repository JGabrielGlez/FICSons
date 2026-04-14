// src/institutos/mongo/instituto.model.js
// Esquema Mongoose para el Catálogo de Institutos — BD: MongoDB

const mongoose = require("mongoose");

// ← Reemplaza los comentarios con los campos reales de las notas del maestro FIC
const InstitutoSchema = new mongoose.Schema(
  {
    // campo1: { type: String,  required: true  },  // descripción del campo
    // campo2: { type: Number,  required: false },  // descripción del campo
    // campo3: { type: String                   },  // descripción del campo
    // ... (definidos por el maestro)
  },
  {
    timestamps: true, // agrega createdAt y updatedAt automáticamente
  },
);

const Instituto = mongoose.model("Instituto", InstitutoSchema);

module.exports = Instituto;
