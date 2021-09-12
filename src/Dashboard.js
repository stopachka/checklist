import {
  BrowserRouter as Router,
  Switch,
  Route,
  NavLink,
} from "react-router-dom";
import { Redirect } from "react-router";
import ChecklistPage from "./ChecklistPage";
import LogPage from "./LogPage";
import DistortionsPage from "./DistortionsPage";
import ThoughtsPage from "./ThoughtsPage";

function Navigation() {
  return (
    <div>
      <div className="w-full h-16"></div>
      <div
        className="
          bg-gray-900 
          z-50 
          py-3 
          fixed
          bottom-0 
          inset-x-0
          max-w-md 
          mx-auto 
          h-15">
        <div className="flex border-gray-700">
          {[
            ["Quiz", "/"],
            ["Thoughts", "/thoughts"],
            ["Log", "/log"],
            ["Distortions", "/distortions"],
          ].map(([label, pathname]) => {
            return (
              <NavLink
                key={pathname}
                className="
                  cursor-pointer 
                  font-semibold 
                  text-center
                  h-12
                  flex-1
                  flex 
                  items-center
                  justify-center
                  uppercase
                  tracking-wider
                  text-sm
                  px-4
                "
                to={pathname}
                activeClassName="bg-gray-700"
                exact={true}>
                {label}
              </NavLink>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  return (
    <Router>
      <Switch>
        <Route exact strict path="/log">
          <LogPage />
        </Route>
        <Route exact strict path="/thoughts">
          <ThoughtsPage />
        </Route>
        <Route exact strict path="/distortions">
          <DistortionsPage />
        </Route>
        <Route exact strict path="/">
          <ChecklistPage />
        </Route>
        <Redirect to="/"></Redirect>
      </Switch>
      <Navigation />
    </Router>
  );
}
