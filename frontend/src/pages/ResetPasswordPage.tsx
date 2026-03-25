import { FormEvent, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { authService } from "../services/authService";

export default function ResetPasswordPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const token = useMemo(() => {
    const params = new URLSearchParams(location.search);
    return params.get("token") || "";
  }, [location.search]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError("");
    setMessage("");

    if (!token) {
      setError("Token de redefinicao nao encontrado.");
      return;
    }

    if (!newPassword || newPassword.length < 6) {
      setError("A nova senha deve ter no minimo 6 caracteres.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("As senhas nao conferem.");
      return;
    }

    try {
      setLoading(true);
      const serverMessage = await authService.resetPassword(token, newPassword);
      setMessage(serverMessage);
      setTimeout(() => navigate("/login"), 1500);
    } catch (requestError: any) {
      const serverError = requestError?.response?.data?.error;
      setError(serverError || "Nao foi possivel redefinir sua senha.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <div className="card">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Redefinir senha</h1>
        <p className="text-gray-600 mb-6">Defina uma nova senha para sua conta.</p>

        {error && <div className="mb-4 rounded bg-red-100 text-red-700 px-3 py-2 text-sm">{error}</div>}
        {message && (
          <div className="mb-4 rounded bg-green-100 text-green-700 px-3 py-2 text-sm">{message}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nova senha</label>
            <input
              type="password"
              className="input-field"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Confirmar nova senha</label>
            <input
              type="password"
              className="input-field"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={loading}
            />
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? "Processando..." : "Salvar nova senha"}
          </button>
        </form>

        <div className="mt-4 text-sm">
          <Link to="/login" className="text-gray-600 hover:text-gray-900">
            Voltar para login
          </Link>
        </div>
      </div>
    </div>
  );
}
