import { Routes, Route } from "react-router";
import { Toaster } from "sonner";
import Landing from "./pages/Landing";
import PricingPage from "./pages/PricingPage";
import Workspace from "./pages/Workspace";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";

export default function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/pricing" element={<PricingPage />} />
        <Route path="/workspace" element={<Workspace />} />
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Toaster position="top-right" richColors />
    </>
  );
}
