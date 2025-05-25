export const initialStore=()=>{
  return{
    user: JSON.parse(localStorage.getItem('user'))? JSON.parse(localStorage.getItem('user')): null
  }
}

export default function storeReducer(store, action = {}) {
  switch(action.type){
    case 'signin/signup':
      return {
        ...store,
        user: action.payload.user
      }
    default:
      throw Error('Unknown action.');
  }    
}
