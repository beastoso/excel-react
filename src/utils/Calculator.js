import { GridContext } from '../App';

var Calculator = {
    getColumnLabel: function(index)
    {
        const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        if (index === "" || isNaN(index)) {
            return "";
        } else if (index > 0 && index <= letters.length) {
            return letters.charAt(index-1);
        } else {
            let suffixIndex = index % letters.length;
            if (suffixIndex === 0) {
                index -= letters.length;
                suffixIndex = letters.length;
            }
            let prefix = this.getColumnLabel(Math.floor(index / letters.length));
            let suffix = this.getColumnLabel(suffixIndex);            
            return prefix + suffix;
        }
    },

    getCellName: function(x, y)
    {
        return this.getColumnLabel(x) + y;
    },

    evaluateCell: function(context, cellValue)
    {
        if (!cellValue.trim().startsWith("=")) {
            return cellValue;
        }

        //remove white space to make parsing easier
        let equation = cellValue.substring(1).replace(/\s/g, "");
        
        //1. replace function blocks with function results
        const functions = ["sum", "max", "min", "count", "average"];        
        for (const funcName of functions) {
            let fnBlockRegex = new RegExp(funcName + "([A-Z]+[0-9]+:[A-Z]+[0-9]+)","g");
            let blocks = fnBlockRegex.exec(equation);
            for (const block of blocks) {
                let startCell = /([A-Z]+[0-9]+):/.exec(block);
                let endCell = /:([A-Z]+[0-9]+)/.exec(block);
                let result = this.executeFunction(context, funcName, startCell, endCell);
                equation = equation.replaceAll(block, result);
            }
        }

        //2. replace cell references with cell values
        let cellnameRegex = /([A-Z]+[0-9]+)/g;
        let references = cellnameRegex.exec(equation);

        for (const ref of references) {
            let refValue = context.gridCellValue(ref);
            if (refValue === null) {
                throw Error("InvalidArgument");
            }
            equation = equation.replaceAll(ref, this.executeCell(context, refValue));
        }

        //3. check for any unexpected characaters
        let sanitisedEquation = equation.replace(/[^()+\-/*^\d]/g,"");
        if (equation !== sanitisedEquation) {
            throw Error("InvalidArgument");
        }

        //4. evaluate equation
        //- tokenise equation
        //- build a decision tree based on BEDMAS
        //- execute decision tree

        return eval(equation);
    },

    executeFunction: function(context, functionName, startCell, endCell)
    {
        switch(functionName) {
            case "sum":
                return this.sum(context, startCell, endCell);
            case "count":
                return this.count(context, startCell, endCell);
            case "average":
                return this.average(context, startCell, endCell);
            case "min":
                return this.min(context, startCell, endCell);
            case "max":
                return this.max(context, startCell, endCell);
            default:
                throw Error("Function not found:" + functionName);
        }
    },

    sum: function(context, startCell, endCell) {
        let cells = this.getCellList(startCell, endCell);
        let sum = 0;

        for (const cellname in cells) {
            let cellValue = context.gridCellValue(cellname);
            cellValue = this.executeCell(cellValue);
            if (isNaN(cellValue)) {
                throw Error("InvalidArgument");
            }
            sum += cellValue;
        }
        return sum;
    },

    average: function(context, startCell, endCell) {
        let cells = this.getCellList(startCell, endCell);
        let sum = this.sum(context, startCell, endCell);
        let average = sum / cells.length;
        return average;
    },

    count: function(context, startCell, endCell) {
        let cells = this.getCellList(context, startCell, endCell);
        let count = cells.length;
        return count;
    },

    min: function(context, startCell, endCell) {
        let cells = this.getCellList(context, startCell, endCell);
        let sortedCells = this.getSortedList(cells);
        let min = sortedCells[0];
        return min;
    },

    max: function(context, startCell, endCell) {
        let cells = this.getCellList(context, startCell, endCell);
        let sortedCells = this.getSortedList(cells);
        let max = sortedCells[cells.length - 1];
        return max;
    },

    getSortedList: function(cells) {
        let values = cells.map(function(cell) {
            if (isNaN(cell.value)) {
                throw Error("InvalidArgument");
            }
            return Number(cell.value);
        });
        values.sort(function(a, b){
            return a - b;
        });
        return values;
    },

    getCellList: function(context, startCell, endCell) {
        let cellStart = context.cell(startCell)?.current;
        let cellEnd = context.cell(endCell)?.current;
        let cellList = [];
        if (cellStart.getRow() === cellEnd.getRow()) {
            //same row then traverse columns
            let row = cellStart.getRow();
            let columnStart = cellStart.getColumn();
            let columnEnd = cellEnd.getColumn();
            if (columnStart > columnEnd) {
                throw Error("InvalidArgument");
            }
            for (let n = columnStart; n <= columnEnd; n++) {
                let targetCellName = this.getColumnLabel(n) + row;
                let targetCell = context.cell(targetCellName)?.current;
                cellList.push(targetCell);
            }
        } else if (cellStart.getColumn() === cellEnd.getColumn()) {
            //same column then traverse rows
            let column = this.getColumnLabel(cellStart.getColumn());
            let rowStart = cellStart.getRow();
            let rowEnd = cellEnd.getRow();
            if (rowStart > rowEnd) {
                throw Error("InvalidArgument");
            }
            for (let n = rowStart; n <= rowEnd; n++) {
                let targetCellName = column + n;
                let targetCell = context.cell(targetCellName)?.current;
                cellList.push(targetCell);
            }

        } else {
            throw Error("InvalidArgument");
        }
    }
};

export default Calculator;