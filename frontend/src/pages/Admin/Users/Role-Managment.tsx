import { useState, useEffect } from "react";
import Sidebar from "../Components/Sidebar";
import { Pencil, Trash2, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import ToggleSwitch from "../Components/ToggleSwitch";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { type Cargo } from '../../../types/interfaces-types';
import { getCargos, createCargo, updateCargo, deleteCargo } from '../../../services/cargoService';

export default function RoleManagment() {
    const [cargos, setCargos] = useState<Cargo[]>([]);
    const [filter, setFilter] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Estados para o novo cargo
    const [newCargoName, setNewCargoName] = useState("");
    const [newCargoDescricao, setNewCargoDescricao] = useState("");
    const [newCargoAdmin, setNewCargoAdmin] = useState(false);

    // Estados para edição
    const [cargoBeingEdited, setCargoBeingEdited] = useState<Cargo | null>(null);
    const [editCargoName, setEditCargoName] = useState("");
    const [editCargoDescricao, setEditCargoDescricao] = useState("");
    const [editCargoAdmin, setEditCargoAdmin] = useState(false);

    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const navigate = useNavigate();

    const fetchCargos = async () => {
        try {
            setIsLoading(true);
            const cargosData = await getCargos();
            setCargos(cargosData);
        } catch (err) {
            console.error("Erro ao buscar cargos:", err);
            setError("Não foi possível carregar os cargos.");
            toast.error("Erro ao carregar cargos.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchCargos();
    }, []);

    const filteredCargos = cargos.filter((cargo) =>
        cargo.nome.toLowerCase().includes(filter.toLowerCase())
    );

    const handleAddCargo = async () => {
        if (!newCargoName.trim()) {
            toast.error("Digite o nome do cargo!");
            return;
        }

        setIsSubmitting(true);
        try {
            await createCargo({
                nome: newCargoName.trim(),
                descricao: newCargoDescricao.trim(),
                admin: newCargoAdmin,
            });
            toast.success(`Cargo "${newCargoName}" cadastrado com sucesso!`);
            setNewCargoName("");
            setNewCargoDescricao("");
            setNewCargoAdmin(false);
            setIsModalOpen(false);
            fetchCargos();
        } catch (err) {
            console.error("Erro ao adicionar cargo:", err);
            toast.error("Erro ao adicionar o cargo.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteCargo = async (id: number) => {
        const confirmDelete = window.confirm("Tem certeza que deseja excluir este cargo?");
        if (confirmDelete) {
            try {
                await deleteCargo(id);
                toast.success("Cargo excluído com sucesso!");
                fetchCargos();
            } catch (err) {
                console.error("Erro ao excluir cargo:", err);
                toast.error("Erro ao excluir o cargo.");
            }
        }
    };

    const handleEditCargo = (cargo: Cargo) => {
        setCargoBeingEdited(cargo);
        setEditCargoName(cargo.nome);
        setEditCargoDescricao(cargo.descricao);
        setEditCargoAdmin(cargo.admin);
    };

    const handleUpdateCargo = async () => {
        if (!editCargoName.trim() || !cargoBeingEdited) {
            toast.error("Digite o nome do cargo!");
            return;
        }
        setIsSubmitting(true);

        try {
            await updateCargo(cargoBeingEdited.id, {
                nome: editCargoName.trim(),
                descricao: editCargoDescricao.trim(),
                admin: editCargoAdmin,
            });
            toast.success("Cargo atualizado com sucesso!");
            setCargoBeingEdited(null);
            setEditCargoName("");
            setEditCargoDescricao("");
            setEditCargoAdmin(false);
            fetchCargos();
        } catch (err) {
            console.error("Erro ao atualizar cargo:", err);
            toast.error("Erro ao atualizar o cargo.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <p className="text-gray-600">Carregando cargos...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <p className="text-red-600">{error}</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex bg-gray-100">
            <title>Gerenciamento de Cargos</title>
            <main className="flex flex-1 bg-gray-100">
                <Sidebar />

                <div className="flex flex-1 p-6">
                    <div className="flex flex-col flex-1 bg-white rounded-lg shadow-lg p-6 mx-auto">
                        <h1 className="text-2xl font-bold mb-4">Gerenciamento de Cargos</h1>

                        {/* Filtro */}
                        <div className="mb-4">
                            <label className="block mb-1 font-medium">Pesquisar Cargo:</label>
                            <input
                                type="text"
                                value={filter}
                                onChange={(e) => setFilter(e.target.value)}
                                className="w-full border border-gray-300 rounded-md px-3 py-2"
                                placeholder="Digite o nome do cargo para filtrar"
                            />
                        </div>

                        {/* Botão para abrir o modal */}
                        <div className="mb-4">
                            <button
                                onClick={() => setIsModalOpen(true)}
                                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition"
                            >
                                Novo Cargo
                            </button>
                        </div>

                        {/* Lista de Cargos */}
                        <div>
                            <h2 className="text-lg font-semibold mb-2">Cargos Cadastrados:</h2>
                            <ul className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {filteredCargos.length > 0 ? (
                                    filteredCargos.map((cargo) => (
                                        <li
                                            key={cargo.id}
                                            className="flex flex-col gap-2 border border-gray-300 rounded-md px-3 py-2"
                                        >
                                            <div className="flex justify-between items-center">
                                                <h3 className="text-lg font-semibold">
                                                    {cargo.nome.charAt(0).toUpperCase() + cargo.nome.slice(1)}
                                                </h3>
                                                {cargo.admin && (
                                                    <span className="text-xs font-semibold text-white bg-indigo-600 px-2 py-1 rounded-full">
                                                        Admin
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-sm text-gray-600">{cargo.descricao}</p>
                                            <div className="flex gap-2 mt-2">
                                                <button
                                                    onClick={() => handleEditCargo(cargo)}
                                                    className="p-2 rounded hover:bg-gray-100"
                                                    title="Editar"
                                                >
                                                    <Pencil className="w-5 h-5 text-gray-600" />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteCargo(cargo.id)}
                                                    className="p-2 rounded hover:bg-gray-100"
                                                    title="Excluir"
                                                >
                                                    <Trash2 className="w-5 h-5 text-red-600" />
                                                </button>
                                            </div>
                                        </li>
                                    ))
                                ) : (
                                    <li className="text-gray-500 italic">
                                        Nenhum cargo encontrado.
                                    </li>
                                )}
                            </ul>
                        </div>
                    </div>
                </div>
            </main>

            {/* Modal Novo Cargo */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold">Cadastrar Novo Cargo</h2>
                            <button onClick={() => setIsModalOpen(false)}>
                                <X size={20} className="text-gray-500 hover:text-gray-700" />
                            </button>
                        </div>
                        <label className="block mb-2 font-medium">Nome do Cargo:</label>
                        <input
                            type="text"
                            value={newCargoName}
                            onChange={(e) => setNewCargoName(e.target.value)}
                            className="w-full border border-gray-300 rounded-md px-3 py-2 mb-4"
                            placeholder="Ex: Administrador, Entregador..."
                        />
                        <label className="block mb-2 font-medium">Descrição:</label>
                        <textarea
                            value={newCargoDescricao}
                            onChange={(e) => setNewCargoDescricao(e.target.value)}
                            className="w-full border border-gray-300 rounded-md px-3 py-2 mb-4"
                            placeholder="Breve descrição do cargo"
                        />
                        <div className="flex items-center mb-4">
                            <span className="font-medium mr-2">Administrador:</span>
                            <ToggleSwitch
                                checked={newCargoAdmin}
                                onChange={() => setNewCargoAdmin(!newCargoAdmin)}
                            />
                        </div>
                        <div className="flex justify-end gap-2">
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-lg transition"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleAddCargo}
                                disabled={isSubmitting}
                                className={`px-4 py-2 rounded-lg transition ${isSubmitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700 text-white'}`}
                            >
                                {isSubmitting ? "Adicionando..." : "Adicionar"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Editar Cargo */}
            {cargoBeingEdited && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold">Editar Cargo</h2>
                            <button onClick={() => setCargoBeingEdited(null)}>
                                <X size={20} className="text-gray-500 hover:text-gray-700" />
                            </button>
                        </div>
                        <label className="block mb-2 font-medium">Nome do Cargo:</label>
                        <input
                            type="text"
                            value={editCargoName}
                            onChange={(e) => setEditCargoName(e.target.value)}
                            className="w-full border border-gray-300 rounded-md px-3 py-2 mb-4"
                            placeholder="Digite o novo nome do cargo"
                        />
                        <label className="block mb-2 font-medium">Descrição:</label>
                        <textarea
                            value={editCargoDescricao}
                            onChange={(e) => setEditCargoDescricao(e.target.value)}
                            className="w-full border border-gray-300 rounded-md px-3 py-2 mb-4"
                            placeholder="Breve descrição do cargo"
                        />
                        <div className="flex items-center mb-4">
                            <span className="font-medium mr-2">Administrador:</span>
                            <ToggleSwitch
                                checked={editCargoAdmin}
                                onChange={() => setEditCargoAdmin(!editCargoAdmin)}
                            />
                        </div>
                        <div className="flex justify-end gap-2">
                            <button
                                onClick={() => setCargoBeingEdited(null)}
                                className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-lg transition"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleUpdateCargo}
                                disabled={isSubmitting}
                                className={`px-4 py-2 rounded-lg transition ${isSubmitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}
                            >
                                {isSubmitting ? "Salvando..." : "Salvar"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
            <ToastContainer />
        </div>
    );
}