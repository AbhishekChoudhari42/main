import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  tool: "line",
};

const toolboxSlice = createSlice({
  name: "toolbox",
  initialState,
  reducers: {
    changeTool: (state, action) => {
      state.tool = action.payload;
    },
  },
});

export const { changeTool } = toolboxSlice.actions;
export default toolboxSlice.reducer;
