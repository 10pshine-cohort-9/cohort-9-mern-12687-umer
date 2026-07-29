import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";

import Login from "./pages/LoginPage";
import Signup from "./pages/SignUpPage";
import Dashboard from "./pages/Dashboard";

function ProtectedRoute({ children }: { children: React.JSX.Element }): React.JSX.Element {
  const { user, isLoading } = useAuth();


  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#11111b] flex items-center justify-center text-[#cdd6f4] font-mono">
        verifying session...
      </div>
    );
  }

  if (!user) {
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