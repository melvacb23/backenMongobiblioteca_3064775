import express from 'express';
import bcrypt from 'bcrypt';
import User from '../models/users.js';

const router = express.Router();

//metodo crear un nuevo usuario
router.post('/users', async (req, res) => {
    //peticiones variable req  o request y respuestas res o response 
  try {
    //encriptar la contraseña enviada por el usuario
    const hashedpassword = await bcrypt.hash(req.body.password, 10);
    //crear una instancia del modelo User
    const newUser = new User({...req.body, password: hashedpassword});
    const savedUser = await newUser.save();
  } catch (error) {
    res.status(500).json({ message: 'Error al crear el usuario', error });
  }
});

export default router; 
