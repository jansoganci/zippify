import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function RootRedirect() {
  const navigate = useNavigate();
  useEffect(() => {
    const token = localStorage.getItem('zippify_token');
    if (token) {
      navigate("/dashboard", { replace: true });
    } else {
      navigate("/landing", { replace: true });
    }
  }, [navigate]);
  return null;
}
