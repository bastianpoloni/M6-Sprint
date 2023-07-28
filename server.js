import express from "express";
import fs from "fs";
import hbs from "hbs";
import { dirname } from "path";
import { fileURLToPath } from "url";
import bodyParser from "body-parser";
import axios from "axios";
import currencyFormatter from "currency-formatter";

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const pathRoommates = "./public/files/roommates.json";
const pathGastos = "./public/files/gastos.json";
let roommates = JSON.parse(fs.readFileSync(pathRoommates));
let gastos = JSON.parse(fs.readFileSync(pathGastos));

app.use(express.json());
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: false }));
app.set("view engine", "hbs");

hbs.registerPartials(__dirname + "/views/partials");

app.get("/", (req, res) => {
  res.render("index", { roommates, gastos });
});

app.get("/roommates", (req, res) => {
  res.render("roommates", { roommates });
});

//AGREGA ROOMMATE
app.post("/roommates", async (req, res) => {
  try {
    console.log('hola');
    const response = await axios.get("https://randomuser.me/api/");
    let newRoommate = response.data;
    roommates.push({
      nombre: `${newRoommate.results[0].name.first} ${newRoommate.results[0].name.last}`,
      debe : 0,
      recibe : 0,
    });
    fs.writeFileSync(pathRoommates, JSON.stringify(roommates));
    res.redirect("/");
  } catch (error) {
    console.log(error);
  }
});

app.get("/historial", (req, res) => {
  res.render("historial", { gastos });
});

//AGREGA GASTO A LA LISTA
app.post("/gasto", (req, res) => {
    const nombre = req.body.nombre;
    const descripcion = req.body.descripcion;
    const monto = parseInt(req.body.monto);
    gastos.push({
      nombre : `${nombre}`,
      descripcion :`${descripcion}` ,
      monto :`${monto}`,  
    })
    fs.writeFileSync(pathGastos, JSON.stringify(gastos));
    res.redirect("/");
})

//EDITAR FILA
app.put("/gasto", (req, res) => {});

//ELIMINAR FILA NO FUNCIONA
app.delete("/gasto", (req, res) => {
  gastos.pop(req.body.row);
  fs.writeFileSync(pathGastos, JSON.stringify(gastos));
  res.redirect("/");
});
    
app.listen(3000, () => {
  console.log("Server is running on port 3000");
});

