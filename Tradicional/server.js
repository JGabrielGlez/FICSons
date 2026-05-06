// server.js
// Punto de entrada principal - conecta BDs y levanta el servidor

require("dotenv").config();
const app = require("./src/app");
const { connectDatabases } = require("./src/config/db");

const PORT = process.env.PORT || 3000;

// Conectar todas las BDs
connectDatabases()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`✅ Servidor corriendo en puerto ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ Error conectando BDs:", err);
    process.exit(1);
  });
