import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
    index("routes/home.tsx"),
    route('/auth', "routes/auth.tsx"),
    route('/upload', "routes/upload.tsx"),
    route('/resume/:id', "routes/resume.tsx"),
    route('/wipe', "routes/wipe.tsx"),
    // Handle .well-known paths (e.g., Chrome DevTools requests)
    route('/.well-known/*', "routes/.well-known.$.tsx"),
] satisfies RouteConfig;
