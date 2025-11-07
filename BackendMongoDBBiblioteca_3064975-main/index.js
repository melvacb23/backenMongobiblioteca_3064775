//express servidor web
import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv'; 
import userRouter from './src/routes/users.js';


dotenv.config();
const app = express();
const port = process.env.PORT || 9000;

//middlewares
app.use(express.json());
app.use('/api',userRouter);

app.listen(port, () => console.log('Servidor ejecutandose ',port));

app.get('/', (req, res) => {
  res.send('Bienvenido a la API');
});

//conexion a la base de datos
mongoose.connect(process.env.MONGODB_URI, {

})
.then(() => console.log('Conectado a la base de datos MongoDB'))
.catch((error) => console.error('Error al conectar a la BD:', error));