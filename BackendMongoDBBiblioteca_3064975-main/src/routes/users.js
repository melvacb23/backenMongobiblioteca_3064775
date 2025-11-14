import express from 'express';
import bcrypt from 'bcrypt';
import User from '../models/users.js';

const router = express.Router();

// 1. Crear un nuevo usuario (POST)
router.post('/users', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    // Validar que todos los campos estén presentes
    if (!name || !email || !password) {
      return res.status(400).json({ 
        message: 'Todos los campos son requeridos' 
      });
    }

    // Encriptar la contraseña
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Crear una instancia del modelo User
    const newUser = new User({
      name,
      email,
      password: hashedPassword
    });
    
    // Guardar en la base de datos
    const savedUser = await newUser.save();
    
    // Enviar respuesta exitosa (sin enviar la contraseña)
    res.status(200).json({
      message: 'Usuario creado exitosamente',
      user: {
        id: savedUser._id,
        name: savedUser.name,
        email: savedUser.email
      }
    });
    
  } catch (error) {
    // Verificar si es error de email duplicado
    if (error.code === 11000) {
      return res.status(400).json({ 
        message: 'El email ya está registrado' 
      });
    }
    res.status(500).json({ 
      message: 'Error al crear el usuario', 
      error: error.message 
    });
  }
});

// 2. Obtener todos los usuarios (GET)
router.get('/users', async (req, res) => {
  try {
    // Obtener todos los usuarios sin mostrar las contraseñas
    const users = await User.find().select('-password');
    
    res.status(200).json(users);
    
  } catch (error) {
    res.status(500).json({ 
      message: 'Error al obtener los usuarios', 
      error: error.message 
    });
  }
});

// 3. Login de usuario (POST)
router.post('/users/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Validar campos
    if (!email || !password) {
      return res.status(400).json({ 
        message: 'Email y contraseña son requeridos' 
      });
    }

    // Buscar usuario por email
    const user = await User.findOne({ email });
    
    if (!user) {
      return res.status(404).json({ 
        message: 'Usuario no encontrado' 
      });
    }

    // Comparar contraseñas
    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
      return res.status(401).json({ 
        message: 'Contraseña incorrecta' 
      });
    }

    // Login exitoso
    res.status(200).json({
      message: 'Login exitoso',
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });
    
  } catch (error) {
    res.status(500).json({ 
      message: 'Error al hacer login', 
      error: error.message 
    });
  }
});

// 4. Obtener un usuario específico por ID (GET)
router.get('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Buscar usuario por ID sin mostrar la contraseña
    const user = await User.findById(id).select('-password');
    
    if (!user) {
      return res.status(404).json({ 
        message: 'Usuario no encontrado' 
      });
    }

    res.status(200).json(user);
    
  } catch (error) {
    res.status(500).json({ 
      message: 'Error al obtener el usuario', 
      error: error.message 
    });
  }
});

// 5. Actualizar un usuario (PUT)
router.put('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, password } = req.body;
    
    // Crear objeto con los datos a actualizar
    const updateData = {};
    
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    
    // Si se envía nueva contraseña, encriptarla
    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    // Actualizar usuario
    const updatedUser = await User.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');
    
    if (!updatedUser) {
      return res.status(404).json({ 
        message: 'Usuario no encontrado' 
      });
    }

    res.status(200).json({
      message: 'Usuario actualizado exitosamente',
      user: updatedUser
    });
    
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ 
        message: 'El email ya está en uso' 
      });
    }
    res.status(500).json({ 
      message: 'Error al actualizar el usuario', 
      error: error.message 
    });
  }
});

// 6. Eliminar un usuario (DELETE)
router.delete('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Eliminar usuario
    const deletedUser = await User.findByIdAndDelete(id);
    
    if (!deletedUser) {
      return res.status(404).json({ 
        message: 'Usuario no encontrado' 
      });
    }

    res.status(200).json({
      message: 'Usuario eliminado exitosamente',
      user: {
        id: deletedUser._id,
        name: deletedUser.name,
        email: deletedUser.email
      }
    });
    
  } catch (error) {
    res.status(500).json({ 
      message: 'Error al eliminar el usuario', 
      error: error.message 
    });
  }
});

export default router;