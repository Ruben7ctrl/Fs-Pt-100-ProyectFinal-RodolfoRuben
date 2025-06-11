import React, { useState } from "react";
import { Cell } from "./Cell";
import '../styles/Battle.css'


const GRID_SIZE = 10;
const SHIPS = [5, 4, 3, 2, 1];

const createEmptyGrid = () => Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(null));

export const ShipPlacer = ({ onPlaceShips }) => {
    const [grid, setGrid] = useState(createEmptyGrid());
    const [currentShipIndex, setCurrentShipIndex] = useState(0);
    const [isVertical, setIsVertical] = useState(false);

    const placeShip = (row, col) => {
        const size = SHIPS[currentShipIndex];
        const newGrid = grid.map(row => [...row]);

        for (let i = 0; i < size; i++) {
            const r = isVertical ? row + i : row;
            const c = isVertical ? col : col + i;
            if (r >= GRID_SIZE || c >= GRID_SIZE || newGrid[r][c]) return;
        }

        for (let i = 0; i < size; i++) {
            const r = isVertical ? row + i : row;
            const c = isVertical ? col : col + i;
            newGrid[r][c] = 'ship';
        }

        setGrid(newGrid);
        if (currentShipIndex + 1 < SHIPS.length) {
            setCurrentShipIndex(currentShipIndex + 1)
        } else {
            onPlaceShips(newGrid)
        }
    }

    return (
        <div className="d-flex flex-column">
            <h2 className="letraBarco">Place your Ships {SHIPS[currentShipIndex]} squares</h2>
            <button className="BotonBarco" onClick={() => setIsVertical(!isVertical)}>
                Rotate ({isVertical ? 'Vertical' : 'Horizontal'})
            </button>
            <div className="boarding">
                {grid.map((row, rIdx) =>
                    row.map((cell, cIdx) => (
                        <Cell key={`${rIdx}-${cIdx}`} value={cell} onClick={() => placeShip(rIdx, cIdx)} isPlayer={true} />
                    ))
                )}
            </div>
        </div>
    )
}