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
  <div className="bg-gray-900 absolute inset-0 min-w-screen text-white antialiased overflow-y-scroll">
    <div className="relative h-full">
      <App />
    </div>
  </div>
);

export default AppContainer;
