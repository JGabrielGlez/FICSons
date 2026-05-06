// Dev mirror Express server placeholder
import express from 'express';
const app = express();
app.use(express.json());

app.use('/dev', require('./routes').default);

app.listen(3001, () => console.log('dev-mirror listening on 3001'));

export default app;
