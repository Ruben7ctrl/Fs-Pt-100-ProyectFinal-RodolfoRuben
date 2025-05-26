import { act } from "react"

export const initialStore=()=>{
  return{
    user: JSON.parse(localStorage.getItem('user'))? JSON.parse(localStorage.getItem('user')): null,
    videojuegos: [],
    juegosdemesa: [],
    jdmdatos: []
  }
}

export default function storeReducer(store, action = {}) {
  switch(action.type){
    case 'signin/signup':
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
