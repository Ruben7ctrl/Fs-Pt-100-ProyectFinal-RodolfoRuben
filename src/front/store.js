export const initialStore=()=>{
  return{
    user: null
  }
}

export default function storeReducer(store, action = {}) {
  switch(action.type){
    case 'signin/signup':
      return {
        ...store,
        user: action.payload
      }
    default:
      throw Error('Unknown action.');
  }    
}
