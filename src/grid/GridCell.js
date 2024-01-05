import React from 'react';
import './GridCell.css';
import { GridContext } from '../App';
import Calculator from '../utils/Calculator';

class GridCell extends React.Component {
    static contextType = GridContext;

    constructor(props) {
        super(props);

        this.state = {
            selected: false,
            editing: false,
            references: []
        };

        this.inputRef = React.createRef();
    }

    handleKeyPress(event) {
        if (event.key === "Enter") {
            this.setValue(event.target.value);
            this.setEditing(false);
            this.setSelected(true);
            for (let i = 0; i < this.state.references.length; i++) {
                const refCell = this.state.references[i];
                refCell.render();
            }
        }
    }

    handleClick() {
        const selectedCell = this.context.currentCell()?.current;
        
        if (selectedCell !== this) {
            if (selectedCell.isEditing()) {
                this.addReference(selectedCell.ref);
                selectedCell.insertContent(this.props.cellName);
            } else {
                this.context.setCurrentCell(this.ref);
                this.setSelected(true);
            }
        } else {
            this.setEditing(true);
        }
        
        if (this.props.handleClick) {
            this.props.handleClick();
        }
    }

    setSelected(isSelected) {
        this.setState({ ...this.state, selected: isSelected });
    }

    setEditing(isEditing) {
        this.setState({ ...this.state, editing: isEditing, selected: false });
    }

    addReference(otherCell) {
        this.state.references.push(otherCell);
    }

    insertContent(content) {
        let position = this.inputRef.current.selectionStart;
        let currentValue = this.inputRef.current.value;
        let newValue = currentValue.substring(0, position) + String(content) + currentValue.substring(position);
        this.setValue(newValue);
        this.inputRef.current.focus();
    }

    setValue(newValue) {
        this.context.setGridCellValue(this.props.cellName, newValue);
        this.setState({ ...this.state, newValue});
    }

    getRow() {
        return this.props.y;
    }

    getColumn() {
        return this.props.x;
    }

    getCellName() {
        return this.props.cellName;
    }

    getClasses() {
        const classes = "gridcell " 
            + this.context.gridCellStyles(this.props.cellName) ?? ""
            + (this.state.selected ? "selected" : "");
        return classes;
    }

    render() {
        const classes = this.getClasses();
        const computedValue = Calculator.evaluateCell(this.context, this.state.value);
        return (
            <div className={classes}>
                <div 
                    onClick={ this.handleClick } 
                    className={ "gridcell__view " + (this.state.editing ? "hidden" : "") } 
                >
                    { computedValue }
                </div>
                <input
                    ref={ this.inputRef }
                    onKeyUp={ this.handleKeyPress } 
                    className={ "gridcell__value " + (this.state.editing ? "" : "hidden") } 
                    type="text" 
                    value={ this.state.value }
                />
            </div>
        );
    }
}

export default GridCell;