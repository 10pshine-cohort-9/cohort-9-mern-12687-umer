import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { getAxiosToken } from "./api/axios";

import Login from "./pages/LoginPage";
import Signup from "./pages/SignUpPage";
import Dashboard from "./pages/Dashboard";

function ProtectedRoute({ children }: { children: React.JSX.Element }): React.JSX.Element {
  // Derive auth state from in-memory token rather than localStorage
  const isAuthenticated = !!getAxiosToken();

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  return children;
}

function App(): React.JSX.Element {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } 
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;