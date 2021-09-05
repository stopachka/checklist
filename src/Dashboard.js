import {
  BrowserRouter as Router,
  Switch,
  Route,
  NavLink,
} from "react-router-dom";
import { Redirect } from "react-router";
import ChecklistPage from "./ChecklistPage";
import StatsPage from "./StatsPage";

function Navigation() {
  return (
    <div className="bg-gray-900 z-50 py-3 sticky bottom-0 inset-x-0 max-w-md mx-auto">
      <div className="flex border border-gray-700">
        {[
          ["Home", "/"],
          ["Stats", "/stats"],
        ].map(([label, pathname]) => {
          return (
            <NavLink
              key={pathname}
              className="cursor-pointer flex-1 font-semibold hover:bg-gray-600 text-center px-10 py-4"
              to={pathname}
              activeClassName="bg-gray-700"
              exact={true}>
              {label}
            </NavLink>
          );
        })}
      </div>
    </div>
  );
}

export default function Dashboard() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col">
        <div className="flex-1 flex">
          <Switch>
            <Route exact strict path="/stats">
              <StatsPage />
            </Route>
            <Route exact strict path="/">
              <ChecklistPage />
            </Route>
            <Redirect to="/"></Redirect>
          </Switch>
        </div>
        <Navigation />
      </div>
    </Router>
  );
}