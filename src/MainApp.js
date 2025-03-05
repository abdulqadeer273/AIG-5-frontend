import React from 'react';
import {
    createBrowserRouter,
    RouterProvider,
} from "react-router-dom";
import App from './App'
import "./index.css";
import AllCases from './components/AllCases';
import AllTheme from './components/AllTheme';
import { AddCase } from './components/AddCase';
import { EditCase } from './components/EditCase';
import VariableValueInputs from './components/test3';
import OtherVariables from './components/VariableComponent';
import AIG from './components/AIG';
import AIGFive from './components/AIGFive';
const router = createBrowserRouter([
    // {
    //     path: "/",
    //     element: <App />
    // },
    {
        path: "/",
        element: <AIGFive />
    },
    {
        path: "/AIG",
        element: <AIG />
    },
    {
        path: "/themes/",
        element: <AllTheme />
    },
    {
        path: "/:name/cases",
        element: <AllCases />
    },
    {
        path: "/:theme/addcase",
        element: <AddCase />
    },
    {
        path: "/:theme/cases/edit/:case_name",
        element: <EditCase />
    },
    {
        path: "/test",
        element: <VariableValueInputs />
    },
    {
        path: "/realtest",
        element: <OtherVariables />
    },
]);

const MainApp = () => {

    return (
        <>
            <RouterProvider router={router} />
        </>
    )
}
export default MainApp;