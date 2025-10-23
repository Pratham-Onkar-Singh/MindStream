import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Dashboard } from "./pages/Dashboard";
import { Signin } from "./pages/SignIn";
import { Signup } from "./pages/Signup";
import { Brain } from "./pages/Brain";
import { Profile } from "./pages/Profile";

function App() {
  return <BrowserRouter>
    <Routes>
      <Route path="/signup" element={<Signup/>} />
      <Route path="/signin" element={<Signin/>} />
      <Route path="/dashboard" element={<Dashboard/>} />
      <Route path="/profile" element={<Profile/>} />
      <Route path="/brain/:linkHash" element={<Brain/>} />
    </Routes>
  </BrowserRouter>
}

export default App
