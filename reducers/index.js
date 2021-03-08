import { combineReducers } from "redux";
import { persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";
import Test from "./Test";

const persistConfig = {
    key: "rootState",
    storage,
    whitelist: [],
};

const RootReducer = combineReducers({
    Test,
});

export default persistReducer(persistConfig, RootReducer);
