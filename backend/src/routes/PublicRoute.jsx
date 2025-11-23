import { Navigate } from "react-router-dom";
const PublicRoute = ({ children }) => {
//   localStorage.removeItem("token");
  const token = localStorage.getItem("token");
  console.log(token);

  //   if logged In -> redirect to dashboard
  if (token) {
    return <Navigate to="/" replace />;
  }
  return children;
};

export default PublicRoute;
