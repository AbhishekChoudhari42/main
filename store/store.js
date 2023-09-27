import { configureStore } from "@reduxjs/toolkit";
import toolboxSliceReducer from "../features/Toolbox/toolboxSlice"

export const store = configureStore({
    reducer: {
        toolbox: toolboxSliceReducer
    }
})

