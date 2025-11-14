import express from 'express';
import Libro from '../models/books.js';

const router = express.Router();

// Helper: normalizar campos entrantes (acepta español e inglés)
function parseBookInput(body) {
  const titulo = body.titulo || body.title;
  const autor = body.autor || body.author;
  const anio = body.anio || body.anioPublicacion || body.year;
  const genero = body.genero || body.gender || body.genero;
  const stock = body.stock;
  return { titulo, autor, anio, genero, stock };
}

// Crear un nuevo libro (rutas en español e inglés)
const createHandler = async (req, res, next) => {
  try {
    // Aceptamos campos en español e inglés
    const { titulo, autor, anio, genero, stock } = parseBookInput(req.body);
    if (!titulo || !autor || !anio || genero == null || stock == null) {
      return res.status(400).json({ ok: false, message: 'Faltan datos obligatorios' });
    }

    const anioValue = anio;
    const anioDate = new Date(anioValue);
    if (Number.isNaN(anioDate.getTime())) {
      return res.status(400).json({ ok: false, message: 'Formato de fecha inválido para el campo "anio"' });
    }

    const libro = await Libro.create({
      titulo,
      autor,
      anio: anioDate,
      genero,
      stock,
    });

    return res.status(201).json({
      ok: true,
      libro: {
        id: libro._id,
        titulo: libro.titulo,
        autor: libro.autor,
        anio: libro.anio,
        genero: libro.genero,
        stock: libro.stock,
      },
    });
  } catch (err) {
    if (err && err.code === 11000) {
      return res.status(409).json({ ok: false, message: 'El libro ya está registrado' });
    }
    return next(err);
  }
};

router.post('/libro', createHandler);
router.post('/books', createHandler);

// Obtener todos los libros
const getAllHandler = async (req, res, next) => {
  try {
    const libros = await Libro.find();
    return res.json(libros);
  } catch (err) {
    return res.status(500).json({ message: `Error al obtener libros: ${err.message}` });
  }
};

router.get('/libros', getAllHandler);
router.get('/books', getAllHandler);

// Obtener un libro por ID
const getByIdHandler = async (req, res, next) => {
  try {
    const { id } = req.params;
    const libro = await Libro.findById(id);
    if (!libro) {
      return res.status(404).json({ message: 'Libro no encontrado' });
    }
    return res.json(libro);
  } catch (err) {
    return next(err);
  }
};

router.get('/libro/:id', getByIdHandler);
router.get('/books/:id', getByIdHandler);

// Eliminar un libro por ID
const deleteHandler = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await Libro.deleteOne({ _id: id });
    if (result.deletedCount === 0) {
      return res.status(404).json({ message: 'Libro no encontrado' });
    }
    return res.json({ ok: true, deletedCount: result.deletedCount });
  } catch (err) {
    return next(err);
  }
};

router.delete('/libro/:id', deleteHandler);
router.delete('/books/:id', deleteHandler);

// Actualizar un libro por ID
const updateHandler = async (req, res, next) => {
  try {
    const { id } = req.params;
    // aceptar campos en inglés o español
    const { titulo, autor, anio, genero, stock } = parseBookInput(req.body);

    const updates = {};
    if (titulo !== undefined) updates.titulo = titulo;
    if (autor !== undefined) updates.autor = autor;
    if (genero !== undefined) updates.genero = genero;
    if (stock !== undefined) updates.stock = stock;
    if (anio !== undefined) {
      const anioDate = new Date(anio);
      if (Number.isNaN(anioDate.getTime())) {
        return res.status(400).json({ ok: false, message: 'Formato de fecha inválido para el campo "anio"' });
      }
      updates.anio = anioDate;
    }

    const libroActualizado = await Libro.findByIdAndUpdate(id, updates, { new: true });
    if (!libroActualizado) {
      return res.status(404).json({ message: 'Libro no encontrado' });
    }
    return res.json({ ok: true, libro: libroActualizado });
  } catch (err) {
    return next(err);
  }
};

router.put('/libro/:id', updateHandler);
router.put('/books/:id', updateHandler);

export default router;