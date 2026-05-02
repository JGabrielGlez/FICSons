/**
 * src/app-core/index.js
 * Punto de entrada central de app-core.
 * Exporta cliente DB compartido, modelos y utilidades.
 * 
 * Uso:
 * import { supabase, Instituto } from '../../app-core';
 * o
 * import appCore from '../../app-core';
 * const { supabase, Instituto } = appCore;
 */

// Cliente DB compartido (Supabase)
export { default as supabase } from './shared/db.js';

// Modelos compartidos
export { Instituto } from './shared/models/index.js';

// Exportar todo como objeto por defecto también
import supabaseDb from './shared/db.js';
import * as models from './shared/models/index.js';

export default {
  supabase: supabaseDb,
  models
};
