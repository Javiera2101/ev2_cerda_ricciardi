import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { db } from '../firebaseConfig';
import { collection, addDoc } from 'firebase/firestore';

// SIN JOKER: Solo valores del A al K
const VALORES = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
const PINTAS = ['diamante', 'corazon', 'trebol', 'pica'];

const CariocaGame = () => {
  const [valorSeleccionado, setValorSeleccionado] = useState('A');
  const [pintaSeleccionada, setPintaSeleccionada] = useState('diamante');
  const [cartas, setCartas] = useState([]);
  const [mensaje, setMensaje] = useState('');
  const [esValido, setEsValido] = useState(null);

  const agregarCarta = () => {
    if (cartas.length >= 13) {
      setMensaje("Máximo 13 cartas en la mesa.");
      setEsValido(false);
      return;
    }

    // REGLA: No puedes poner la MISMA carta dos veces
    const existeDuplicada = cartas.some(c => c.visual === valorSeleccionado && c.pinta === pintaSeleccionada);

    if (existeDuplicada) {
      setMensaje("¡Esa carta ya está en la mesa!");
      setEsValido(false);
      return;
    }

    let num = 0;
    if (valorSeleccionado === 'A') num = 1;
    else if (valorSeleccionado === 'J') num = 11;
    else if (valorSeleccionado === 'Q') num = 12;
    else if (valorSeleccionado === 'K') num = 13;
    else num = parseInt(valorSeleccionado);

    const nuevaCarta = {
      id: Date.now(),
      visual: valorSeleccionado,
      numero: num,
      pinta: pintaSeleccionada
    };

    setCartas([...cartas, nuevaCarta]);
    setMensaje('');
    setEsValido(null);
  };

  const eliminarCarta = (id) => {
    setCartas(cartas.filter((c) => c.id !== id));
    setMensaje('');
    setEsValido(null);
  };

  const ordenarCartas = () => {
    const ordenadas = [...cartas].sort((a, b) => a.numero - b.numero);
    setCartas(ordenadas);
  };

  const validarJuego = async () => {
    // REGLA: Debe tener 13 cartas exactas
    if (cartas.length !== 13) {
      setMensaje(`Tienes ${cartas.length} cartas. Necesitas 13 para la escala.`);
      setEsValido(false);
      return;
    }

    const manoOrdenada = [...cartas].sort((a, b) => a.numero - b.numero);

    // REGLA: Validar secuencia estricta 1, 2, 3 ... 13
    for (let i = 0; i < manoOrdenada.length - 1; i++) {
      const actual = manoOrdenada[i].numero;
      const siguiente = manoOrdenada[i + 1].numero;

      if (siguiente - actual !== 1) {
        setMensaje(`❌ Error en la secuencia entre ${manoOrdenada[i].visual} y ${manoOrdenada[i+1].visual}.`);
        setEsValido(false);
        return;
      }
    }

    setMensaje("✨ ¡ESCALA SUCIA VÁLIDA! ✨");
    setEsValido(true);

    try {
      await addDoc(collection(db, "jugadascarioca"), {
        tipo: "Escala Sucia",
        cartas: cartas.map(c => `${c.visual} ${c.pinta}`),
        fecha: new Date()
      });
      console.log("Guardado en Firebase");
    } catch (e) {
      console.error("Error guardando:", e);
    }
  };

  const getIcono = (p) => {
    if (p === 'diamante') return '♦️';
    if (p === 'corazon') return '♥️';
    if (p === 'trebol') return '♣️';
    if (p === 'pica') return '♠️';
    return '';
  };

  const getColor = (p) => (p === 'diamante' || p === 'corazon') ? '#d90429' : '#212529';

  return (
    <div className="container py-5">
      <div className="card shadow-lg border-0" style={{ maxWidth: '900px', margin: '0 auto' }}>
        <div className="card-header bg-primary text-white text-center py-3">
          <h2 className="m-0 fw-bold">🃏 Carioca: Escala Sucia</h2>
        </div>

        <div className="card-body p-4">
          <div className="row g-2 align-items-center justify-content-center mb-4 bg-light p-3 rounded border">
            
            <div className="col-auto">
              <label className="fw-bold me-2">Carta:</label>
              <select 
                className="form-select d-inline-block w-auto shadow-sm"
                value={valorSeleccionado}
                onChange={(e) => setValorSeleccionado(e.target.value)}
              >
                {VALORES.map(v => <option key={v} value={v}>{v}</option>)}
              </select>
            </div>

            <div className="col-auto">
              <label className="fw-bold me-2">Pinta:</label>
              <select 
                className="form-select d-inline-block w-auto shadow-sm"
                value={pintaSeleccionada} 
                onChange={(e) => setPintaSeleccionada(e.target.value)}
              >
                {PINTAS.map(p => (
                  <option key={p} value={p}>
                    {p.charAt(0).toUpperCase() + p.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-auto ms-md-3">
              <motion.button 
                className="btn btn-success fw-bold shadow-sm"
                whileTap={{ scale: 0.95 }}
                onClick={agregarCarta}
              >
                Agregar
              </motion.button>
            </div>
          </div>

          <div className="p-4 mb-4 border rounded bg-success bg-opacity-25 position-relative" style={{ minHeight: '200px' }}>
            
            <div className="position-absolute top-0 start-0 m-2 badge bg-dark opacity-75">
              Cartas: {cartas.length} / 13
            </div>

            {cartas.length === 0 && (
              <div className="text-center text-muted mt-5">
                <p className="fs-5 fst-italic opacity-50">Mesa vacía.</p>
              </div>
            )}

            <div className="d-flex flex-wrap justify-content-center gap-2">
              <AnimatePresence>
                {cartas.map((carta) => (
                  <motion.div
                    key={carta.id}
                    layout
                    initial={{ scale: 0, y: 50 }}
                    animate={{ scale: 1, y: 0 }}
                    exit={{ scale: 0, opacity: 0, rotate: 15 }}
                    transition={{ type: "spring", stiffness: 260, damping: 20 }}
                    className="card d-flex flex-column align-items-center justify-content-center shadow-sm"
                    style={{ 
                      width: '70px', 
                      height: '100px', 
                      cursor: 'default',
                      color: getColor(carta.pinta),
                      border: '1px solid #ccc',
                      backgroundColor: 'white'
                    }}
                  >
                    <button 
                      onClick={() => eliminarCarta(carta.id)}
                      className="btn btn-sm btn-danger position-absolute p-0 rounded-circle d-flex align-items-center justify-content-center"
                      style={{ top: '-5px', right: '-5px', width: '20px', height: '20px', lineHeight: 1, fontSize: '10px' }}
                    >
                      ✕
                    </button>
                    
                    <div className="fw-bold fs-4">{carta.visual}</div>
                    <div className="fs-4">{getIcono(carta.pinta)}</div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>

          <div className="d-flex justify-content-center gap-3 mb-4">
              <button className="btn btn-secondary" onClick={ordenarCartas}>
                Ordenar
              </button>
              
              <motion.button 
                className="btn btn-primary px-5 fw-bold"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={validarJuego}
              >
                VALIDAR JUEGO
              </motion.button>
          </div>

          <div className="text-center" style={{ minHeight: '60px' }}>
            <AnimatePresence mode="wait">
              {mensaje && (
                <motion.div
                  key={mensaje}
                  initial={{ opacity: 0, y: 20, scale: 0.8 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.5 }}
                  transition={{ type: "spring", stiffness: 200 }}
                  className={`alert ${esValido ? 'alert-success' : 'alert-danger'} d-inline-block px-5 py-3 shadow-sm`}
                >
                  <h4 className="m-0 fw-bold">{mensaje}</h4>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

        </div>
      </div>
    </div>
  );
};

export default CariocaGame;