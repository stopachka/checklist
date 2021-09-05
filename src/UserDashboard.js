import { useState, useContext } from "react";
import Stats from "./Stats";
import Report from "./Report";
import FullScreenLoading from "./shared/FullScreenLoading";
import ErrorNotice from "./shared/ErrorNotice";
import UserContext from "./shared/UserContext";
import { useUserData, useAllUserProfiles } from "./shared/api";
import Header from "./shared/Header";
import {
  BrowserRouter as Router,
  Switch,
  Route,
  NavLink,
} from "react-router-dom";
import { Redirect } from "react-router";
import { ADMIN_EMAILS } from "./shared/data";

function Navigation() {
  return (
    <div className="bg-gray-900 z-50 py-3 sticky bottom-0 inset-x-0 max-w-md mx-auto">
      <div className="flex border border-gray-700">
        {[
          ["Home", "/"],
          ["Report", "/report"],
        ].map(([label, pathname]) => {
          return (
            <NavLink
              key={pathname}
              className={
                "cursor-pointer flex-1 p-4 font-semibold hover:bg-gray-600 text-center"
              }
              to={pathname}
              activeClassName="bg-gray-700"
              exact={true}
            >
              {label}
            </NavLink>
          );
        })}
      </div>
    </div>
  );
}

function isAdmin(user) {
  return user && ADMIN_EMAILS.includes(user.email);
}

function ImpersonateUserSelector({ currentUid, onUidChange }) {
  const [isLoading, error, allUserInfo] = useAllUserProfiles();
  if (isLoading) {
    return <div className="text-center text-gray-400">...</div>;
  }
  if (error) {
    return <ErrorNotice message={error} />;
  }
  window.currentUid = currentUid;
  window.allUserInfo = allUserInfo;
  return (
    <div className="flex">
      <select
        className="flex-1 bg-gray-700 p-2"
        value={currentUid}
        onChange={(e) => {
          onUidChange(e.target.value);
        }}
      >
        {allUserInfo
          .sort((pA, pB) => {
            return pA["real-name"].localeCompare(pB["real-name"]);
          })
          .map((profile) => {
            return (
              <option key={profile.uid} value={profile.uid}>
                {profile["real-name"]}
              </option>
            );
          })}
      </select>
    </div>
  );
}

export default function UserDashboard() {
  const user = useContext(UserContext);
  const [currentUid, setCurrentUid] = useState(user.uid);
  const [isLoading, error, data] = useUserData(currentUid);
  if (isLoading) {
    return <FullScreenLoading />;
  }
  if (error) {
    return (
      <div className="max-w-md mx-auto p-4">
        <ErrorNotice message={error} />
      </div>
    );
  }
  return (
    <Router>
      <Header />
      {isAdmin(user) && (
        <div className="p-4 max-w-md mx-auto">
          <ImpersonateUserSelector
            currentUid={currentUid}
            onUidChange={setCurrentUid}
          />
        </div>
      )}
      <Switch>
        <Route exact strict path="/report">
          <Report data={data} />
        </Route>
        <Route exact strict path="/">
          <Stats data={data} />
        </Route>
        <Redirect to="/"></Redirect>
      </Switch>
      <Navigation />
    </Router>
  );
}
