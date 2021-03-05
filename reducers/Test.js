import { ACTIONS } from "../constants/actionConstants";

const initialState = {
    isLoading: false,
    err: null,
    response: {},
  };
  
export default function Test(state = initialState, action = {}) {
    switch (action.type) {
        case ACTIONS.testCase:
            return { ...state, isLoading: true };
        default:
            return state
    }
}