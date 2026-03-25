import { FormEvent, useState } from "react";
import { authService } from "../services/authService";

export default function ChangePasswordPage() {
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");

    const handleSubmit = async (event: FormEvent) => {
        event.preventDefault();
        setError("");
        setMessage("");

        if (!currentPassword || !newPassword) {
            setError("Preencha todos os campos.");
            return;
        }

        if (newPassword.length < 6) {
            setError("A nova senha deve ter no minimo 6 caracteres.");
            return;
        }

        if (newPassword !== confirmPassword) {
            setError("As senhas nao conferem.");
            return;
        }

        try {
            setLoading(true);
            await authService.changePassword(currentPassword, newPassword);
            setMessage("Senha alterada com sucesso.");
            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");
        } catch (requestError: any) {
            const serverError = requestError?.response?.data?.error;
            setError(serverError || "Nao foi possivel alterar sua senha.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-md mx-auto">
            <div className="card">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Alterar senha</h1>
                <p className="text-gray-600 mb-6">Troque sua senha atual por uma nova senha segura.</p>

                {error && <div className="mb-4 rounded bg-red-100 text-red-700 px-3 py-2 text-sm">{error}</div>}
                {message && (
                    <div className="mb-4 rounded bg-green-100 text-green-700 px-3 py-2 text-sm">{message}</div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Senha atual</label>
                        <input
                            type="password"
                            className="input-field"
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            disabled={loading}
                        />
                    </div>

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
                        {loading ? "Processando..." : "Alterar senha"}
                    </button>
                </form>
            </div>
        </div>
    );
}
