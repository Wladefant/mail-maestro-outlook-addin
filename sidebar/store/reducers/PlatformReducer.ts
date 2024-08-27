import { PayloadAction, createSlice } from "@reduxjs/toolkit";

interface PlatformState {}

const initialState: PlatformState = {};

const PlatformSlice = createSlice({
  name: "platform",
  initialState,
  reducers: {},
});

export const {} = PlatformSlice.actions;

export default PlatformSlice.reducer;
