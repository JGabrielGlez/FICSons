import express from "express";
import morgan from "morgan";
import cors from "cors";
import config from "./config/config";
import { supabase } from "./config/database.config.js";
import routeAPI from "./api/supabase/routes/index.js";
import routerAppCore from "./api/app-core/routes/index.js";
import routerAiChat from "./api/ai-chat/routes/index.js";

// Se declara la variable app igualándola a express
const app = express();

// settings
app.set("port", config.PORT);

// Middlewares generales
app.use(cors());
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Rutas

const api = config.API_URL;
app.get(`${api}`, (req, res)   => {
  res.send(
    `<h1>RESTful running in root</h1> <p> Supabase: <b>${api}/api-docs</b> for more information.</p>`,
  );
});

// Módulo legacy (institutos - Supabase)
routeAPI(app);

// Módulo app-core (evaluaciones y demás módulos del LMS)
routerAppCore(app);

// Módulo ai-chat (chat con IA Ada - Persona 1)
routerAiChat(app);

export default app;
