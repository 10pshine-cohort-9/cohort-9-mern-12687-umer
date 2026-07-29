import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/LoginPage";
import Signup from "./pages/SignUpPage";
import Dashboard from "./pages/Dashboard";
import { AuthProvider, useAuth } from "./contexts/AuthContext";

function ProtectedRoute({ children }: { children: React.JSX.Element }): React.JSX.Element {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  return children;
}

function App(): React.JSX.Element {
  return (
    <AuthProvider>
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
    </AuthProvider>
  );
}

export default App;
