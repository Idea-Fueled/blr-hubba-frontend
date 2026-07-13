import React from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { Layout } from "./components/Layout";
import { Events } from "./pages/Events";
import EventDetailPage from "./pages/EventDetail/EventDetailPage";

const App = () => {

  const router = createBrowserRouter([{
    path: "/",
    element: <Layout />,
    children: [
      {
        index: true,
        element: <Events />
      },
      {
        path: "/events",
        element: <Events />
      },
      {
        path: "/events/:eventId",
        element: <EventDetailPage />
      }
    ]
  }])

  return (
    <>
      <RouterProvider router={router} />
    </>
  )
}

export default App;