import './App.css';
import Grid from './grid/Grid';
import { createContext, useState } from 'react';

export const GridContext = createContext("");

function App() {
  const [
    gridCellValue, 
    setGridCellValue, 
    gridCellStyles, 
    setGridCellStyles, 
    currentCell, 
    setCurrentCell,
    cell,
    setCell
  ] = useState("");
  return (
    <div className="App">
       <h1>Welcome</h1>
       <GridContext.Provider value={{
          gridCellValue, setGridCellValue, gridCellStyles, setGridCellStyles, currentCell, setCurrentCell, cell, setCell
        }}>
        <Grid
          height={10}
          width={10}
        ></Grid>
      </GridContext.Provider>
    </div>
  );
}

export default App;
