import express from 'express';
import 'dotenv/config'
import Router from '../Routes/employee.routes.js'
import connectDb from '../config/db.config.js';
import cors from "cors";

const app = express();

app.use(cors());
app.use(express.json());
app.use("/api/employee/v1", Router);

app.get('/', (req, res) => {
    res.send('Hello World!')
});


connectDb().then(() => {
    console.log("Db Connected Successfully");
}).catch((error) => {
    console.error("Failed to connect to DB:", error);
    process.exit(1);
});


export default app;
