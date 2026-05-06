// Dev mirror Express server
import express from "express";
import routes from "./routes";
const app = express();
app.use(express.json());

app.use("/dev", routes);

app.listen(3001, () => console.log("dev-mirror listening on 3001"));

export default app;
