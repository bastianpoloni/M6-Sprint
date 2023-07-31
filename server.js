import express from "express";
import fs from "fs";
import hbs from "hbs";
import { dirname } from "path";
import { fileURLToPath } from "url";
import bodyParser from "body-parser";
import axios from "axios";
import _ from "lodash";
import methodOverride from "method-override";
import {v4 as uuidv4} from "uuid";


const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const pathRoommates = "./public/files/roommates.json";
const pathGastos = "./public/files/gastos.json";
let roommates = JSON.parse(fs.readFileSync(pathRoommates));
let gastos = JSON.parse(fs.readFileSync(pathGastos));

app.use(express.json());
app.use(express.static("public"));
app.use(methodOverride('_method'));
app.use(bodyParser.urlencoded({ extended: false }));
app.set("view engine", "hbs");

hbs.registerPartials(__dirname + "/views/partials");

app.get("/", (req, res) => {
  res.render("index", { roommates, gastos });
});

app.get("/roommates", (req, res) => {
  res.json(roommates);
});

//AGREGA ROOMMATE
app.post("/roommates", async (req, res) => {
  try {
    const response = await axios.get("https://randomuser.me/api/");
    let newRoommate = response.data;
    roommates.push({
      id: uuidv4(),
      nombre: `${newRoommate.results[0].name.first} ${newRoommate.results[0].name.last}`,
      debe: 0,
      recibe: 0,
    });
    fs.writeFileSync(pathRoommates, JSON.stringify(roommates));
    res.redirect("/");
  } catch (error) {
    console.log(error);
  }
});

app.get("/historial", (req, res) => {
  res.json(gastos);
});



//AGREGA GASTO A LA LISTA
app.post("/gasto", (req, res) => {
  const nombre = req.body.nombre;
  const descripcion = req.body.descripcion;
  const monto = parseInt(req.body.monto);
  let id;
  if (gastos.length == 0){
    id = 0;
  }else {
    id = gastos[gastos.length-1].id + 1;
  } 
  gastos.push({
    id: id,
    nombre: nombre,
    descripcion: descripcion,
    monto: monto,
  });

  let debe = monto/roommates.length;
  let recibe = monto - debe;
  _.forEach (roommates, (roommate) => {
    roommate.debe += debe;
    fs.writeFileSync(pathRoommates, JSON.stringify(roommates));
  });


  // _.map(roommates, (roommate) => {
  //   roommate.debe += debe; 
  //   fs.writeFileSync(pathRoommates, JSON.stringify(roommates));
  // })

  
  fs.writeFileSync(pathGastos, JSON.stringify(gastos));
  res.redirect("/");
});

//EDITAR FILA
app.put("/gasto/", (req, res) => {

});

//ELIMINAR FILA 
app.delete("/gasto/:id", (req, res) => {
    let id =  req.params.id;
    console.log(id);

    _.remove(gastos, (gasto) => {
      return gasto.id == id;
    });

    // _.forEach (roommates, (roommate) => {
    //   roommate.debe -= gastos[gastos.length-1].monto;
    //   roommate.recibe -= gastos[gastos.length-1].monto;
    //   fs.writeFileSync(pathRoommates, JSON.stringify(roommates));
    // })

  fs.writeFileSync(pathGastos, JSON.stringify(gastos));
  res.redirect("/");
});

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
