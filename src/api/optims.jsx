import { API_ROOT, objToQueryString, validateAPIResponseJSON } from "./utils";

/**
 * Request to create an optimization for project
 * with project_id from the neuralmagicML.server.
 *
 * @param {string} projectId - The id of the project to get
 * @param {string} name - The name of the created optimizer
 * @param {boolean} add_pruning - Using pruning in created optimizer
 * @param {boolean} add_quantization - Using quantization in created optimizer
 * @param {boolean} add_lr_schedule - Using lr schedule in created optimizer
 * @param {boolean} add_trainable - Using trainable in created optimizer
 */
export function requestCreateProjectOptimizer(
  projectId,
  name = undefined,
  add_pruning = undefined,
  add_quantization = undefined,
  add_lr_schedule = undefined,
  add_trainable = undefined
) {
  const url = `${API_ROOT}/projects/${projectId}/optim/`;
  const body = {};
  if (name !== undefined) {
    body["name"] = name;
  }

  if (add_pruning !== undefined) {
    body["add_pruning"] = add_pruning;
  }

  if (add_quantization !== undefined) {
    body["add_quantization"] = add_quantization;
  }

  if (add_lr_schedule !== undefined) {
    body["add_lr_schedule"] = add_lr_schedule;
  }

  if (add_trainable !== undefined) {
    body["add_trainable"] = add_trainable;
  }

  return validateAPIResponseJSON(
    fetch(url, {
      method: "POST",
      cache: "no-cache",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    })
  );
}

/**
 * Request to get the requested project's optimizations
 * with project_id from the neuralmagicML.server.
 *
 * @param {string} projectId - The id of the project to get
 * @param {number} page - The page number for the profiles to load
 * @param {number} pageLength - The number of profiles to load for the given page
 * @returns {Promise<any>}
 */
export function requestGetProjectOptims(projectId, page = 1, pageLength = 100) {
  const queryParams = objToQueryString({
    page,
    page_length: pageLength,
  });
  const url = `${API_ROOT}/projects/${projectId}/optim?${queryParams}`;

  return validateAPIResponseJSON(
    fetch(url, {
      method: "GET",
      cache: "no-cache",
    })
  );
}

/**
 * Request to change a modifier's settings
 *
 * @param projectId - The id of the project
 * @param optimId - The id of the optimization
 * @param modifierId - The id of the modifier
 * @param settings - Object with modifier settings to be updated
 * @returns {Promise<any>}
 */
export const requestChangeModifierSettings = (
  projectId,
  optimId,
  modifierId,
  settings
) => {
  const url = `${API_ROOT}/projects/${projectId}/optim/${optimId}/modifiers/${modifierId}/pruning`;

  return validateAPIResponseJSON(
    fetch(url, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(settings),
    })
  );
};

/**
 * Request to get the requested project's best estimated optimization meta data
 * based on optional loss and performance profiles
 *
 * @param projectId - The id of the project to get best estimated for
 * @param profilePerfId - The performance profile to use to calculate the best estimated, if any
 * @param profileLossId - The loss profile to use to calculate the best estimated, if any
 * @returns {Promise<any>}
 */
export function requestGetProjectOptimBestEstimated(
  projectId,
  profilePerfId,
  profileLossId
) {
  const queryParamsDict = {};
  if (profilePerfId) {
    queryParamsDict["profile_perf_id"] = profilePerfId;
  }
  if (profileLossId) {
    queryParamsDict["profile_loss_id"] = profileLossId;
  }
  const queryParams = objToQueryString(queryParamsDict);
  const url = `${API_ROOT}/projects/${projectId}/optim/modifiers/best-estimated?${queryParams}`;

  return validateAPIResponseJSON(
    fetch(url, {
      method: "GET",
      cache: "no-cache",
    })
  );
}