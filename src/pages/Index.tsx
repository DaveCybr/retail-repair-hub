import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import Dashboard from "./Dashboard";
import Login from "./Login";

const Index = () => {
  return <Dashboard />;
};

export default Index;
