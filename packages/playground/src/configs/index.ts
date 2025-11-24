export const configs = {
  basePath: window.__injected_envs?.BASE_PATH || "/form-playground",
  authBasePath:
    window.__injected_envs?.AUTH_BASE_PATH ||
    "http://localhost:3000/form-playground/api/auth",
};
