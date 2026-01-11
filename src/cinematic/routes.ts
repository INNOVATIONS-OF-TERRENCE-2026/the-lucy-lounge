import { lazy } from "react";

const CinematicStudio = lazy(() => import("./pages/CinematicStudio"));

export { CinematicStudio };

export const cinematicRouteConfig = {
  path: "/cinematic",
  component: CinematicStudio,
};
