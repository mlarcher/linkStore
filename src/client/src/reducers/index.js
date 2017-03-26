import { combineReducers } from 'redux';


const rootReducer = combineReducers({
    main: (state = {}, action) => {
        switch (action.type) {
            default:
                return state;
        }
    },
});


export default rootReducer;
