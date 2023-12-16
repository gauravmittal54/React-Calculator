import './App.css';
import { useReducer } from 'react'
import DigitButton from './Components/DigitButton'
import OperationButton from './Components/operationButton'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHistory } from '@fortawesome/free-solid-svg-icons';


const initialState = {
  currentOperand: null,
  previousOperand: null,
  operation: null,
  overwrite: false,
  history: [],
};

export const ACTIONS = {
  ADD_DIGIT: "add-digit",
  CHOOSE_OPERATION: "choose-operation",
  CLEAR: "clear",
  DELETE_DIGIT: "delete-digit",
  EVALUATE: "evaluate",
}

//reducer being hit when dispatch  is called
function reducer(state, { type, payload }) {
  switch (type) {
    case ACTIONS.ADD_DIGIT:
      if (state.overwrite) { //handles button being clicked without removing  the result of previous evaluated  operation                                      
        return {
          ...state,
          currentOperand: payload.digit,
          overwrite: false,
        }
      }
      //handles scenario that no multiple only 0 or multiple . in a decimal can be placed
      if (payload.digit === "0" && state.currentOperand === "0") {
        return state
      }
      if (payload.digit === "." && state.currentOperand.includes(".")) {
        return state
      }
      //return state with digit being appended to current operand
      return {
        ...state,
        currentOperand: `${state.currentOperand || ""}${payload.digit}`,
      }
    case ACTIONS.CHOOSE_OPERATION:
      //does not do anything when nothing is there to evaluate
      if (state.currentOperand == null && state.previousOperand == null) {
        return state
      }
      //appends the operation
      if (state.currentOperand == null) {
        return {
          ...state,
          operation: payload.operation,
        }
      }
      //replace the currentOperand with previousOperand
      if (state.previousOperand == null) {
        return {
          ...state,
          operation: payload.operation,
          previousOperand: state.currentOperand,
          currentOperand: null,
        }
      }
      //evaluates an expression even when an operation being clicked not the "=" button and then appends the operaton to the evaluated operand
      return {
        ...state,
        previousOperand: evaluate(state),
        operation: payload.operation,
        currentOperand: null,
      }
    case ACTIONS.CLEAR:
      return {  // set the state properties to it default value
        ...initialState,
      };
    case ACTIONS.DELETE_DIGIT:
      //remove sthe already evaluated  operand when delete is clicked
      if (state.overwrite) {
        return {
          ...state,
          overwrite: false,
          currentOperand: null,
        }
      }
      //nothing to do when nothing is there and delete is clicked
      if (state.currentOperand == null) return state
      //make currentOperand null when length is 1
      if (state.currentOperand.length === 1) {
        return { ...state, currentOperand: null }
      }
      //return the currentOperand string by removing its last character
      return {
        ...state,
        currentOperand: state.currentOperand.slice(0, -1),
      }
    case ACTIONS.EVALUATE:
      //does not evaluate when incomplete info is there
      if (
        state.operation == null ||
        state.currentOperand == null ||
        state.previousOperand == null
      ) {
        return state
      }
      //evaluates
      const result = evaluate(state);
      //sets history for evaluated expression
      const historyEntry = {
        expression: {
          previousOperand: formatOperand(state.previousOperand),
          operation: state.operation,
          currentOperand: formatOperand(state.currentOperand),
        },
        result: formatOperand(result),
        timestamp: new Date().toLocaleString(),
      };
     //return  state with result and history
      return {
        ...state,
        overwrite: true,
        previousOperand: null,
        operation: null,
        currentOperand: result,
        history: [...state.history, historyEntry],
      };
  }
}

function evaluate({ currentOperand, previousOperand, operation }) {
  const prev = parseFloat(previousOperand)
  const current = parseFloat(currentOperand)
  if (isNaN(prev) || isNaN(current)) return ""
  let computation = ""
  switch (operation) {
    case "+":
      computation = prev + current
      break
    case "-":
      computation = prev - current
      break
    case "*":
      computation = prev * current
      break
    case "÷":
      computation = prev / current
      break
  }

  return computation.toString()
}

const INTEGER_FORMATTER = new Intl.NumberFormat("en-us", {
  maximumFractionDigits: 0,   //Formats the number without decimal spaces
})
function formatOperand(operand) {
  if (operand == null) return
  const [integer, decimal] = operand.split(".")
  if (decimal == null) return INTEGER_FORMATTER.format(integer)
  return `${INTEGER_FORMATTER.format(integer)}.${decimal}`
}

function App() {
  const [{ currentOperand, previousOperand, operation, history }, dispatch] = useReducer(
    reducer,
    initialState
  )
  //Logic for toggle history using history button or onclick history text
  const toggleHistory = () => {
    const historyParagraph = document.querySelector('.history');
    historyParagraph.classList.toggle('show');

    const outputPreviousOperand = document.querySelector('.output .previous-operand');
    const outputCurrentOperand = document.querySelector('.output .current-operand');

    if (historyParagraph.classList.contains('show')) {
      outputPreviousOperand.style.display = 'none';
      outputCurrentOperand.style.display = 'none';
    } else {
      outputPreviousOperand.style.display = 'block'; 
      outputCurrentOperand.style.display = 'block'; 
    }
  };




  return (
    <>

      <div className="calculator-grid">
        <div className="output">
          <div className="history" onClick={toggleHistory}>
            <ul>
              <p>History</p>
              {history.map((entry, index) => (
                <li key={index}>
                  <div className="expression">
                    {entry.expression.previousOperand} {entry.expression.operation} {entry.expression.currentOperand}
                  </div>
                  <div className="result">{entry.result}</div>
                  <div className="timestamp">{entry.timestamp}</div>
                </li>
              ))}
            </ul>
          </div>
          <div className="previous-operand">
            {formatOperand(previousOperand)} {operation}
          </div>
          <div className="current-operand">{formatOperand(currentOperand)}</div>
        </div>
        <button onClick={toggleHistory}>
          <FontAwesomeIcon icon={faHistory} />
        </button>
        <button
          onClick={() => dispatch({ type: ACTIONS.CLEAR })}
        >
          AC
        </button>
        <button onClick={() => dispatch({ type: ACTIONS.DELETE_DIGIT })}>
          DEL
        </button>
        <OperationButton operation="÷" dispatch={dispatch} />
        <DigitButton digit="1" dispatch={dispatch} />
        <DigitButton digit="2" dispatch={dispatch} />
        <DigitButton digit="3" dispatch={dispatch} />
        <OperationButton operation="*" dispatch={dispatch} />
        <DigitButton digit="4" dispatch={dispatch} />
        <DigitButton digit="5" dispatch={dispatch} />
        <DigitButton digit="6" dispatch={dispatch} />
        <OperationButton operation="+" dispatch={dispatch} />
        <DigitButton digit="7" dispatch={dispatch} />
        <DigitButton digit="8" dispatch={dispatch} />
        <DigitButton digit="9" dispatch={dispatch} />
        <OperationButton operation="-" dispatch={dispatch} />
        <DigitButton digit="." dispatch={dispatch} />
        <DigitButton digit="0" dispatch={dispatch} />
        <button
          className="span-two"
          onClick={() => dispatch({ type: ACTIONS.EVALUATE })}
        >
          =
        </button>
      </div>
    </>
  )
}

export default App;
