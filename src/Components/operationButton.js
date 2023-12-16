import { ACTIONS } from '../App'

function OperationButton(props) {
    return (
        //sets digit to payload for their availability to reducer method
        <button onClick={()=>props.dispatch({type:ACTIONS.CHOOSE_OPERATION , payload:{operation:props.operation}})}>{props.operation}</button>
    );
}

export default OperationButton
