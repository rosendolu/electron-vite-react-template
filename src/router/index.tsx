import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import Home from '../pages/home';

const routers = createBrowserRouter([
  {
    path: '/',
    element: <Home></Home>,
  },
]);

const Router = () => {
  return <RouterProvider router={routers} />;
};

export default Router;
