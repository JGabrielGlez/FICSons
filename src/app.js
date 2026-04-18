import express from "express";
import morgan from "morgan";
import cors from "cors";
import config from "./config/config";
import { supabase } from "./config/database.config.js";
import routeAPI from "./api/supabase/routes/index.js";
// Se declara la variable app igualándola a express
const app = express();

// settings

app.set("port", config.PORT);

// Mddlewares generales
app.use(cors());
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Rutas

const api = config.API_URL;
app.get(`${api}`, (req, res) => {
  res.send(
    `<h1>RESTful running in root</h1> <p> Supabase: <b>${api}/api-docs</b> for more information.</p>`,
  );
});

routeAPI(app);
export default app;
