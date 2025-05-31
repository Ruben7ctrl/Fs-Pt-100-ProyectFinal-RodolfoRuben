import { useParams } from 'react-router-dom';

export const GameDetail = () => {
    const { id } = useParams(); // PARA CHECK

    return (
        <div>
            <h1>Game Detail for ID: {id}</h1>
            {/* Aquí podrías volver a llamar a la API con el ID y mostrar más info */}
        </div>
    );
};