import { act } from "react"

export const initialStore=()=>{
  return{
    user: JSON.parse(localStorage.getItem('user'))? JSON.parse(localStorage.getItem('user')): null,
    videojuegos: [],
    unvideojuego: [],
    juegosdemesa: [],
    jdmdatos: [],
    recomendados:[],
    videos:[]
  
  }
}

export default function storeReducer(store, action = {}) {
  switch(action.type){
    case 'get_videos':
      return {
        ...store,
        videos: action.payload
      }
    case 'get_recomendados':
      return {
        ...store,
        recomendados: action.payload
      }
    case 'signin/signup':
      localStorage.setItem('user', JSON.stringify(action.payload.user))
      localStorage.setItem('token', action.payload.token)
      return {
        ...store,
        user: action.payload.user
      }
    case 'logout':
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      return {
        ...store,
        user: null
      }
    case 'load_videojuegos':
      return {
        ...store,
        videojuegos: action.payload
      }
    case 'get_videojuego':
      return {
        ...store,
        unvideojuego: action.payload
      }
    case 'load_juegosdemesa':
      return {
        ...store,
        juegosdemesa: action.payload
      }
    case 'load_jdmdatos':
      return {
        ...store,
        jdmdatos: action.payload
      }
    default:
      throw Error('Unknown action.');
  }    
}
