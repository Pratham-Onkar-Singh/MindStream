import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Dashboard } from "./pages/Dashboard";
import { Auth } from "./pages/Auth";
import { Profile } from "./pages/Profile";
import { Brain } from "./pages/Brain";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/brain/:shareLink" element={<Brain />} />
        
        {/* Redirect old routes to new auth route */}
        <Route path="/signin" element={<Navigate to="/auth?mode=signin" replace />} />
        <Route path="/signup" element={<Navigate to="/auth?mode=signup" replace />} />
        
        {/* Default redirect */}
        <Route path="/" element={<Navigate to="/auth?mode=signin" replace />} />
        <Route path="*" element={<Navigate to="/auth?mode=signin" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
