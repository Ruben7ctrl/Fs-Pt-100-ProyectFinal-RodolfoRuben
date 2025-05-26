// Import necessary components from react-router-dom and other parts of the application.
import { Link } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer";  // Custom hook for accessing the global state.
import { useEffect, useState } from "react";
import userServices from "../services/flux";

export const Games = () => {
  // Access the global state and dispatch function using the useGlobalReducer hook.
  const { store, dispatch } = useGlobalReducer()
  const [page, setPage] = useState(1)
  const [juegos, setJuegos] = useState([])
  const [pagina, setPagina] = useState(1)
  const [letra, setLetra] = useState("a")
  const [cargando, setCargando] = useState(false)

  const letras = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("")

  useEffect(() => {
    userServices.videojuegos(page).then(data => 
      dispatch({ type:'load_videojuegos', payload: data})
    )
  }, [page])

  const juegosPorPagina = 6

  useEffect(() => {
    const cargar = async () => {
      setCargando(true)
      try {
        const lista = await userServices.getJuegosMesa(letra)
        console.log("Juegos recibidos", lista);
        

        const detalles = await Promise.all(
          lista.slice((pagina-1) * juegosPorPagina, pagina * juegosPorPagina).map(async (j) => {
            try {
              const detalle = await userServices.JuegosMesaDatos(j.id)
              console.log("detalle cargado", detalle)
              return detalle
            } catch (error) {
              console.warn(`Error cargando juego con id ${j.id}:`, error)
              return null
            }
          })
        )
        setJuegos(detalles.filter(j => j !== null))
      } catch (error) {
        console.error("Error cargando juegos:", error)
        setJuegos([])
      }
      setCargando(false)
    }
    cargar()
  }, [pagina, letra])



  return (
    <h1>VideoJuegos</h1>

  );
};
