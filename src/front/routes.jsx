// Import necessary components and functions from react-router-dom.

import {
    createBrowserRouter,
    createRoutesFromElements,
    Route,
} from "react-router-dom";
import { Layout } from "./pages/Layout";
import { Home } from "./pages/Home";
import { Single } from "./pages/Single";
import { Games } from "./pages/Games";
import { Signup } from "./pages/SignUp";
import { Signin } from "./pages/SignIn";
import { IAsession } from "./pages/IAsession";
import { GameDetail } from "./pages/GameDetail";
import { ForgotPassword } from "./pages/ForgotPassword";
import { ResetPassword } from "./pages/ResetPassword";
import { BoardGames } from "./pages/BoardG";
import { Chess } from "./pages/ChessGame";
import { OnlineGames } from "./pages/OnlineG";
import { TresEnRaya } from "./pages/TresEnRaya";
import { Gameboarddetail } from "./pages/GamesBoardDetails";
import { BattleShip } from "./pages/BattleShip";

import { Cart } from "./pages/Cart";
import PaymentReturn from "./components/PaymentReturn";
import PrivateRoute from "./components/PrivateRoute"



export const router = createBrowserRouter(
    createRoutesFromElements(
    // CreateRoutesFromElements function allows you to build route elements declaratively.
    // Create your routes here, if you want to keep the Navbar and Footer in all views, add your new routes inside the containing Route.
    // Root, on the contrary, create a sister Route, if you have doubts, try it!
    // Note: keep in mind that errorElement will be the default page when you don't get a route, customize that page to make your project more attractive.
    // Note: The child paths of the Layout element replace the Outlet component with the elements contained in the "element" attribute of these child paths.

      // Root Route: All navigation will start from here.
      <Route path="/" element={<Layout />} errorElement={<h1>Not found!</h1>} >

        {/* Nested Routes: Defines sub-routes within the BaseHome component. */}
        <Route path= "/" element={<Home />} />
        <Route path="/single/:theId" element={ <Single />} />  {/* Dynamic route for single items */}
        <Route path="/games" element={<Games />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/signin" element={<Signin />} />
        <Route path="/ia_sessions" element={<IAsession />} />
        <Route path="/games/:id" element={<GameDetail />} />
        <Route path="/boardgame/:id" element={<Gameboarddetail />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/boardgames" element={<BoardGames />} />
        <Route path="/onlinegame/1" element={<Chess />} />
        <Route path="/onlinegames" element={<PrivateRoute><OnlineGames /></PrivateRoute> } />
        <Route path="/onlinegame/2" element={<TresEnRaya />} />
        <Route path="/onlinegame/3" element={<BattleShip />} />
        
        <Route path="/cart" element={<Cart />} />
        <Route path="/return" element={<PaymentReturn />} />
      </Route>
    )
);