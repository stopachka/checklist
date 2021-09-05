import "./App.css";
import { useAuthState } from "./shared/api";
import FullScreenLoading from "./shared/FullScreenLoading";
import LoginPage from "./LoginPage";
import UserContext from "./shared/UserContext";
import Dashboard from "./Dashboard";

const App = () => {
  const [isLoading, user] = useAuthState();
  if (isLoading) {
    return <FullScreenLoading />;
  }
  return (
    <UserContext.Provider value={user}>
      {user ? <Dashboard /> : <LoginPage />}
    </UserContext.Provider>
  );
};

const AppContainer = () => (
  <div className="relative bg-gray-900 min-h-screen min-w-screen text-white antialiased">
    <App />
  </div>
);

export default AppContainer;
