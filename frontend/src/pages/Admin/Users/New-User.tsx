import { useState, useEffect } from "react";
import Sidebar from "../Components/Sidebar";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { getCargos } from '../../../services/cargoService';
import { createUser } from '../../../services/userService';
import { type Cargo, type CreateUserPayload } from '../../../types/interfaces-types';

export default function NewUser() {
    const [nome, setNome] = useState("")
    const [cargo_id, setCargo_id] = useState("")
    const [username, setUsername] = useState("")
    const [password, setPassword] = useState("")

    const [cargos, setCargos] = useState<Cargo[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const navigate = useNavigate();

    // Efeito para buscar os cargos do backend
    useEffect(() => {
        const fetchCargos = async () => {
            try {
                const cargosData = await getCargos();
                setCargos(cargosData);
            } catch (err) {
                console.error("Erro ao buscar cargos:", err);
                toast.error("Não foi possível carregar os cargos.");
            } finally {
                setIsLoading(false);
            }
        };
        fetchCargos();
    }, []);

    const handleSubmit = async () => {
        if (!nome || !cargo_id || !username || !password) {
            toast.error('Preencha todos os campos obrigatórios!');
            return;
        }
        
        setIsSubmitting(true);
        const newUserPayload: CreateUserPayload = {
            nome,
            cargo_id: parseInt(cargo_id),
            username,
            password
        };

        try {
            await createUser(newUserPayload);
            toast.success(`Usuário "${nome}" cadastrado com sucesso!`);
            navigate("/admin/user/consult");
        } catch (error) {
            console.error("Erro ao cadastrar usuário:", error);
            toast.error("Erro ao cadastrar o usuário. Tente novamente.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCancel = () => {
        if (window.confirm("Deseja realmente cancelar o cadastro do usuário?")) {
            navigate("/admin/user/consult");
        }
    }


    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <p className="text-gray-600">Carregando cargos...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex bg-gray-100">
            <title>Gerenciamento de Usuáro</title>
            <main className="flex flex-1 bg-gray-100">
                <Sidebar />

                <div className="flex flex-col flex-1 bg-white rounded-lg shadow-lg p-6">
                    <h1 className="text-2xl font-bold mb-4">Cadastro de Usuário</h1>
                    <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                            <div>
                                <label className="block mb-1 font-medium">Nome:</label>
                                <input
                                    type="text"
                                    value={nome}
                                    onChange={(e) => setNome(e.target.value)}
                                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block mb-1 font-medium">Cargo:</label>
                                <select
                                    value={cargo_id}
                                    onChange={(e) => setCargo_id(e.target.value)}
                                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                                >
                                    <option value="">Selecione um Cargo</option>
                                    {cargos.map((cargo) => (
                                        <option key={cargo.id} value={cargo.id}>
                                            {cargo.nome}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                            <div>
                                <label className="block mb-1 font-medium">Login:</label>
                                <input
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block mb-1 font-medium">Senha:</label>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                                    required
                                />
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <button
                                type="button"
                                onClick={handleCancel}
                                className="w-32 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition"
                            >
                                Cancelar
                            </button>
                            <button
                                type="button"
                                onClick={handleSubmit}
                                disabled={isSubmitting}
                                className={`w-32 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                {isSubmitting ? "Cadastrando..." : "Cadastrar"}
                            </button>
                        </div>
                    </form>
                </div>
            </main>
            <ToastContainer />
        </div>
    );
}