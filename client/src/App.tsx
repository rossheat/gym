import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter as Router } from "react-router-dom";

export const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
if (!PUBLISHABLE_KEY) {
  throw new Error("Missing Publishable Key");
}

export const SERVER_URL = import.meta.env.VITE_SERVER_URL;
if (!SERVER_URL) {
  throw new Error("Missing Golang Gin Web Server URL");
}

import ClerkProviderWithRoutes from "./router/ClerkProviderWithRoutes";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <ClerkProviderWithRoutes />
      </Router>
    </QueryClientProvider>
  );
}

export default App;
