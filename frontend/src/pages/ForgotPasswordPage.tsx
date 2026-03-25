import { FormEvent, useState } from "react";
import { Link } from "react-router-dom";
import { authService } from "../services/authService";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError("");
    setMessage("");

    if (!email) {
      setError("Informe seu email.");
      return;
    }

    try {
      setLoading(true);
      const serverMessage = await authService.forgotPassword(email);
      setMessage(serverMessage);
    } catch (requestError: any) {
      const serverError = requestError?.response?.data?.error;
      setError(serverError || "Nao foi possivel processar sua solicitacao.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <div className="card">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Esqueci minha senha</h1>
        <p className="text-gray-600 mb-6">
          Informe seu email para receber o link de redefinicao de senha.
        </p>

        {error && <div className="mb-4 rounded bg-red-100 text-red-700 px-3 py-2 text-sm">{error}</div>}
        {message && (
          <div className="mb-4 rounded bg-green-100 text-green-700 px-3 py-2 text-sm">{message}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              className="input-field"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
            />
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? "Processando..." : "Enviar link de redefinicao"}
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
