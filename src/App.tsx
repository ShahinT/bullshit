import './App.css'
import {createBrowserRouter, RouterProvider} from "react-router-dom";
import Home from "./pages/Home.tsx";
import AppRootLayout from "./pages/AppRootLayout.tsx";
import Login from "./pages/Login.tsx";
import Room from "./pages/Room.tsx";
import Test from "./pages/Test.tsx";
import RouteGuard from "./components/RouteGuard.tsx";

function App() {
  const router = createBrowserRouter([
    {
      path: '/',
      element: <AppRootLayout/>,
      children: [
        {
          index: true,
          element: <RouteGuard isProtected={true} element={<Home />} />
        },
        {
          path: 'room/:roomId',
          element: <RouteGuard isProtected={true} element={<Room />} />
        }
      ]
    },
    {
      path: '/login',
      element: <RouteGuard isProtected={false} element={<Login />} />
    },
    {
      path: '/test',
      element: <Test />
    }
  ])

  return (
    <>
      <div className="p-10">

        <RouterProvider router={router} />
      </div>
    </>
  )
}

export default App
