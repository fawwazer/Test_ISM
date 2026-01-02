import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import scoringReducer from "./slices/scoringSlice";
import applicationReducer from "./slices/applicationSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    scoring: scoringReducer,
    application: applicationReducer,
  },
});
