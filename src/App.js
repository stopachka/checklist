import "./App.css";
import { useAuthState } from "./shared/api";
import FullScreenLoading from "./shared/FullScreenLoading";

const App = () => {
  const [isLoading, user] = useAuthState();
  if (isLoading) {
    return <FullScreenLoading />;
  }
  return <div>Hello world!</div>
};

const AppContainer = () => (
  <div className="relative bg-gray-900 min-h-screen min-w-screen text-white antialiased">
    <App />
  </div>
);

export default AppContainer;
