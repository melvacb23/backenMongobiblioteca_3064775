import mongoose from 'mongoose';

const libroSchema = new mongoose.Schema({
  titulo: { type: String, required: true },
  autor: { type: String, required: true },
  anio: { type: Date, required: true },
  // genero como String para permitir valores textuales (p.ej. 'Narration')
  genero: { type: String, required: true },
  stock: { type: Number, required: true },
});

const Libro = mongoose.model('Libro', libroSchema);
export default Libro;