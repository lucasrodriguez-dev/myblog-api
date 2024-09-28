const { connection } = require("./database/connection");
const express = require("express");
const cors = require("cors");

console.log("App iniciada");

//Conectar a la base de datos
connection();

//Crear servidor
const app = express();
const puerto = 3900;

//Configurar cors
app.use(cors());

//Convertir body a objeto js
app.use(express.json()); //datos app/json
app.use(express.urlencoded({extended: true})); //form-urlencoded

//Rutas
const routes_article = require("./routes/article");
app.use("/", routes_article);

//Crear servidor y escuchar peticiones http
app.listen(puerto, () => {
    console.log("Servidor corriendo en puerto "+ puerto);
});


