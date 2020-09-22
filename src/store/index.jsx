import { configureStore } from "@reduxjs/toolkit";

import projectsReducer from "./projects-slice";
import selectedProjectReducer from "./project-slice";
import selectedOptims from "./optims-slice";
import selectedOptimsBestEstimated from "./optims-estimated-slice";
import selectedProfilesLoss from "./profiles-loss-slice";
import selectedProfilesPerf from "./profiles-perf-slice";
import selectedConfig from "./config-slice";

export default configureStore({
  reducer: {
    projects: projectsReducer,
    selectedProject: selectedProjectReducer,
    selectedOptims: selectedOptims,
    selectedOptimsBestEstimated: selectedOptimsBestEstimated,
    selectedProfilesLoss: selectedProfilesLoss,
    selectedProfilesPerf: selectedProfilesPerf,
    selectedConfig: selectedConfig,
  },
});

export * from "./projects-slice";
export * from "./project-slice";
export * from "./optims-slice";
export * from "./optims-estimated-slice";
export * from "./profiles-loss-slice";
export * from "./profiles-perf-slice";
export * from "./config-slice";

export * from "./utils";