import { act } from "react"

export const initialStore=()=>{
  return{
    user: JSON.parse(localStorage.getItem('user'))? JSON.parse(localStorage.getItem('user')): null,
    sessionID: localStorage.getItem('activeSessionID') || null,
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

      const sessionID = localStorage.getItem(`sessionID-${user.id}`);
      if (sessionID) {
        localStorage.setItem('activeSessionID', sessionID)
      }
      return {
        ...store,
        user,
        sessionID,
      }
    case 'logout':
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      // localStorage.removeItem('activeSessionID')
      return {
        ...store,
        user: null,
        // sessionID: null,
      }
    case 'clear_sessionID':
      localStorage.removeItem('activeSessionID');
      return {
        sessionID: null,
      }
    case 'set_sessionID':
      localStorage.setItem('activeSessionID', action.payload)
      return {
        ...store,
        sessionID: action.payload
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
