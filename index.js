import express from 'express';
import 'dotenv/config'
import Router from './src/Routes/employee.routes.js'
import connectDb from './src/config/db.config.js';
import cors from "cors";


const app = express()

app.use(cors());
app.use(express.json())
app.use("/api/employee/v1", Router)

connectDb().then(() => {
    console.log("Db Connected Sucessfully");

    const PORT = process.env.PORT || 3000;

    app.get('/', (req, res) => {
        res.send('Hello World!')
    })

    app.listen(PORT, () => {
        console.log(`app listening on port ${PORT}`)
    })

}).catch((error) => {
    console.error("Failed to connect to DB:", error);
    process.exit(1);
})


