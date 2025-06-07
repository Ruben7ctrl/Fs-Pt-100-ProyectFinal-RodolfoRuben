import React from "react";


export const Board = ({ board, onCellClick, isPlayer }) => {

    return (
        <div className="boarding">
            {board.map((row, rowIndex) => 
                row.map((cell, colIndex) => {
                    const isShip = isPlayer && cell === 'ship';
                    const isHit = cell === 'hit';
                    const isMiss = cell === 'miss';

                    return (
                        <div 
                            key={`${rowIndex}-${colIndex}`} 
                            className={`cell ${isShip ? 'ship' : ''} ${isHit ? 'hit' : ''} ${isMiss ? 'miss' : ''}`} 
                            onClick={() => {
                                if (!isPlayer && onCellClick) {
                                    onCellClick(rowIndex, colIndex)
                                }
                            }}>
                                {isHit ? '💥' : isMiss ? '🌊' : ''}
                        </div>
                    )
                })
            )}
        </div>
    )
}