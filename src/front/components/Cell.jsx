import React from "react";
import '../styles/Battle.css'


export const Cell = ({value, onClick, isPlayer}) => {
    const getClassName = () => {
        if (value === 'ship') return isPlayer ? 'cell ship' : 'cell';
        if (value === 'hit') return 'cell hit';
        if (value === 'miss') return 'cell miss';
        return 'cell';
    };

    return (
        <div className={getClassName()} onClick={onClick}>
            {/* Mostrar lo que se quiera dentro de la celda */}
        </div>
    )
}