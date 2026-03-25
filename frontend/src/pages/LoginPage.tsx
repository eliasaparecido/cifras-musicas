import { FormEvent, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { authService } from "../services/authService";

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const redirectTo = useMemo(() => {
    const params = new URLSearchParams(location.search);
    return params.get("redirect") || "/";
  }, [location.search]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError("");

    if (!email || !password || (mode === "register" && !name)) {
      setError("Preencha os campos obrigatorios.");
      return;
    }

    try {
      setLoading(true);
      if (mode === "login") {
        await authService.login(email, password);
      } else {
        await authService.register(name, email, password);
      }
      navigate(redirectTo, { replace: true });
    } catch (requestError: any) {
      const message =
        requestError?.response?.data?.error ||
        "Nao foi possivel autenticar. Verifique os dados e tente novamente.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <div className="card">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          {mode === "login" ? "Entrar" : "Criar Conta"}
        </h1>
        <p className="text-gray-600 mb-6">
          {mode === "login"
            ? "Entre para cadastrar, editar e excluir musicas e playlists."
            : "Cadastro basico com nome, email e senha."}
        </p>

        {error && (
          <div className="mb-4 rounded bg-red-100 text-red-700 px-3 py-2 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === "register" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
              <input
                type="text"
                className="input-field"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={loading}
              />
            </div>
          )}

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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Senha</label>
            <input
              type="password"
              className="input-field"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
            />
            {mode === "login" && (
              <div className="mt-2 text-right">
                <Link to="/forgot-password" className="text-sm text-primary-700 hover:text-primary-800">
                  Esqueci minha senha
                </Link>
              </div>
            )}
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? "Processando..." : mode === "login" ? "Entrar" : "Cadastrar"}
          </button>
        </form>

        <div className="mt-4 text-sm text-gray-600">
          {mode === "login" ? "Ainda nao tem conta?" : "Ja tem conta?"} {" "}
          <button
            className="text-primary-700 font-semibold"
            onClick={() => {
              setMode(mode === "login" ? "register" : "login");
              setError("");
            }}
            type="button"
          >
            {mode === "login" ? "Cadastre-se" : "Entrar"}
          </button>
        </div>

        <div className="mt-4 text-sm">
          <Link to="/songs" className="text-gray-500 hover:text-gray-700">
            Continuar apenas visualizando musicas
          </Link>
        </div>
      </div>
    </div>
  );
}
