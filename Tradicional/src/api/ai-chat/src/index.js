import { supabase, Instituto } from '../../../app-core/index.js';

const run = async () => {
  try {
    console.log("Probando cliente y modelos compartidos desde app-core...");
    const institutos = await Instituto.getAll();
    console.log("✅ Institutos encontrados:", institutos?.length || 0);
  } catch (err) {
    console.error("❌ Error al usar app-core:", err.message || err);
  }
};

if (import.meta.url === `file://${process.argv[1]}`) run();

export default run;
