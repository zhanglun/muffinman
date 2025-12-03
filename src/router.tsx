import { createBrowserRouter, RouterProvider } from 'react-router-dom';
// import { Home } from './pages/home';
import { WorkBench } from './pages/workbench';

export enum RouteConfig {
  HOME = '/',
}

const router = createBrowserRouter([
  {
    path: RouteConfig.HOME,
    element: <WorkBench />,
  },
]);

export function Router() {
  return <RouterProvider router={router} />;
}
