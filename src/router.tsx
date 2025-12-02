import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { Home } from './pages/home';

export enum RouteConfig {
  HOME = '/',
}

const router = createBrowserRouter([
  {
    path: RouteConfig.HOME,
    element: <Home />,
  },
]);

export function Router() {
  return <RouterProvider router={router} />;
}
