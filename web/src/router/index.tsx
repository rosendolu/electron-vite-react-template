import { RouterProvider, createHashRouter } from 'react-router-dom';
import Home from '../pages/home';

// WARNNING:
// 不能用 createBrowserRouter ，
// browserRouter 会导致页面404 报错
const routers = createHashRouter([
  {
    path: '/',
    element: <Home></Home>,
  },
]);

const Router = () => {
  return <RouterProvider router={routers} />;
};

export default Router;
