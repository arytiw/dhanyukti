import { Navigate } from "react-router-dom";
import { useAuthContext } from "@/context/AuthContext";

type Props = {
  children: React.ReactElement;
};

const ProtectedRoute = ({ children }: Props) => {
  const { token } = useAuthContext();
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

export default ProtectedRoute;

