import React from 'react';
import './Grid.css';
import GridCell from './GridCell';
import GridRow from './GridRow';
import Calculator from '../utils/Calculator';
import { GridContext } from '../App';

class Grid extends React.Component
{
    static contextType = GridContext;

    getCellLabel(x, y) {
        if (x === 0 && y === 0) return "<>";
        if (y === 0) return Calculator.getColumnLabel(x);
        return y;
    }

    getSavedCellValue(x, y) {
        const cellName = Calculator.getCellName(x, y);
        return this.context.gridCellValue(cellName);
    }

    getSavedCellStyling(x, y) {
        const cellName = Calculator.getCellName(x, y);
        return this.context.gridCellStyles(cellName);
    }

    saveCellRef(cellName, ref) {
        this.context.setCell(cellName,  ref);
    }

    handleCellClick(event) {
        if (this.props.handleCellClick) {
            this.props.handleCellClick(event);
        }
    }

   render() {
        let gridrows = [];
        const height = this.props.height ?? 10;
        const width = this.props.width ?? 10;

        for (let y = 0; y <= height; y++) {
            let cells = [];
            for (let x = 0; x <= width; x++) {
                let cellValue = "";
                let cellClasses = ""
                if (x === 0 || y === 0) {
                    cellValue = this.getCellLabel(x, y);
                    cellClasses = "label";
                } else {
                    cellValue = this.getSavedCellValue(x, y);
                    cellClasses = this.getSavedCellClass(x, y);
                }
                const cellRef = React.createRef();
                const cellName = Calculator.getInstance().getCellName(x, y);
                this.saveCellRef(cellName, cellRef);
                
                cells.push(
                    <GridCell 
                        ref={cellRef}
                        x={x} 
                        y={y} 
                        cellName={ cellName }
                        value={cellValue} 
                        classes={cellClasses}
                        handleClick={ this.handleCellClick }
                    ></GridCell>
                );
            }
            gridrows.push(<GridRow cells={cells}></GridRow>)
        }

        return <div className="grid">
            { gridrows }
        </div>;        
    }
}

export default Grid;