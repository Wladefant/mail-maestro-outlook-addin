import React from "react";
import { Route, Routes } from "react-router-dom";
import { APP_ROUTES } from "../../../Shared/sidebar/routing/routes";

interface RoutingProps {}
export const Routing: React.FC<RoutingProps> = () => {
  return (
    <Routes>
      {Object.entries(APP_ROUTES).map(([key, value]) => (
        <Route key={key} path={value.path} element={value.element} />
      ))}
    </Routes>
  );
};
