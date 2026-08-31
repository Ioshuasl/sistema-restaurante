import { useState, useEffect } from "react";
import Sidebar from "../Components/Sidebar";
import { Plus, Pencil, X } from "lucide-react";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { type FormaPagamento, type CreateFormaPagamentoPayload, type UpdateFormaPagamentoPayload } from '../../../types';
import {
    getAllFormasPagamento,
    createFormaPagamento,
    updateFormaPagamento,
    deleteFormaPagamento
} from '../../../services/formaPagamentoService';

export default function PaymentMethod() {
    const [paymentMethods, setPaymentMethods] = useState<FormaPagamento[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [searchName, setSearchName] = useState("");
    // Removido o estado de filtro de status
    
    const [showModal, setShowModal] = useState(false);
    const [newPaymentName, setNewPaymentName] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [editingMethod, setEditingMethod] = useState<FormaPagamento | null>(null);

    const fetchPaymentMethods = async () => {
        try {
            setIsLoading(true);
            const methods = await getAllFormasPagamento();
            setPaymentMethods(methods);
        } catch (err) {
            setError("Não foi possível carregar as formas de pagamento.");
            toast.error("Erro ao carregar as formas de pagamento.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchPaymentMethods();
    }, []);

    const handleAddPaymentMethod = async () => {
        if (newPaymentName.trim() === "") {
            toast.error("O nome da forma de pagamento não pode ser vazio.");
            return;
        }

        setIsSubmitting(true);
        const payload: CreateFormaPagamentoPayload = { nomeFormaPagamento: newPaymentName };

        try {
            await createFormaPagamento(payload);
            toast.success(`Forma de pagamento "${newPaymentName}" adicionada com sucesso.`);
            setNewPaymentName("");
            setShowModal(false);
            fetchPaymentMethods();
        } catch (err) {
            toast.error("Erro ao adicionar forma de pagamento.");
        } finally {
            setIsSubmitting(false);
        }
    };
    
    const handleEditClick = (method: FormaPagamento) => {
        setEditingMethod(method);
        setNewPaymentName(method.nomeFormaPagamento);
        setShowModal(true);
    };

    const handleUpdatePaymentMethod = async () => {
        if (!editingMethod || newPaymentName.trim() === "") {
            toast.error("O nome da forma de pagamento não pode ser vazio.");
            return;
        }
        setIsSubmitting(true);

        const payload: UpdateFormaPagamentoPayload = { nomeFormaPagamento: newPaymentName };

        try {
            await updateFormaPagamento(editingMethod.id, payload);
            toast.success(`Forma de pagamento atualizada para "${newPaymentName}".`);
            setEditingMethod(null);
            setNewPaymentName("");
            setShowModal(false);
            fetchPaymentMethods();
        } catch (err) {
            toast.error("Erro ao atualizar forma de pagamento.");
        } finally {
            setIsSubmitting(false);
        }
    };
    
    const handleDelete = async (id: number) => {
        const confirmDelete = window.confirm("Tem certeza que deseja excluir esta forma de pagamento?");
        if (confirmDelete) {
            try {
                await deleteFormaPagamento(id);
                toast.success("Forma de pagamento excluída com sucesso.");
                fetchPaymentMethods();
            } catch (err) {
                toast.error("Erro ao excluir forma de pagamento.");
            }
        }
    };

    // Lógica de filtro foi simplificada, removendo o filtro por status
    const filteredPaymentMethods = paymentMethods.filter((method) => {
        const matchesName = method.nomeFormaPagamento
            .toLowerCase()
            .includes(searchName.toLowerCase());
        return matchesName;
    });

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <p className="text-gray-600">Carregando formas de pagamento...</p>
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
            <title>Forma de Pagamento</title>
            <main className="flex flex-1 bg-gray-100">
                <Sidebar />

                <div className="flex flex-1 p-6">
                    <div className="flex flex-col flex-1 bg-white rounded-lg shadow-lg p-6 mx-auto">
                        <h1 className="text-2xl font-bold mb-4">Formas de Pagamento</h1>

                        {/* Filtro simplificado, removendo o seletor de status */}
                        <div className="flex flex-col md:flex-row gap-4 mb-6">
                            <input
                                type="text"
                                placeholder="Pesquisar por nome..."
                                value={searchName}
                                onChange={(e) => setSearchName(e.target.value)}
                                className="border border-gray-300 rounded-md px-3 py-2 flex-1"
                            />
                        </div>

                        <div>
                            <button
                                onClick={() => {
                                    setEditingMethod(null);
                                    setNewPaymentName('');
                                    setShowModal(true);
                                }}
                                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                            >
                                <Plus size={18} />
                                Nova Forma de Pagamento
                            </button>
                        </div>

                        {/* Lista de Formas de Pagamento */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
                            {filteredPaymentMethods.length > 0 ? (
                                filteredPaymentMethods.map((method) => (
                                    <div
                                        key={method.id}
                                        className="bg-gray-100 rounded-lg p-4 shadow-md flex flex-col gap-2"
                                    >
                                        <h2 className="text-lg font-semibold">{method.nomeFormaPagamento}</h2>
                                        <div className="flex gap-2 mt-2">
                                            <button
                                                onClick={() => handleEditClick(method)}
                                                className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-lg flex items-center gap-1"
                                            >
                                                <Pencil size={16} />
                                                Editar
                                            </button>
                                            <button
                                                onClick={() => handleDelete(method.id)}
                                                className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-lg flex items-center gap-1"
                                            >
                                                <X size={16} />
                                                Cancelar
                                            </button>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-gray-500">Nenhuma forma de pagamento encontrada.</p>
                            )}
                        </div>
                    </div>
                </div>
            </main>

            {/* Modal de Cadastro/Edição */}
            {showModal && (
                <div className="fixed inset-0 flex items-center justify-center bg-[rgba(0,0,0,0.70)] z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md">
                        <h2 className="text-xl font-bold mb-4">
                            {editingMethod ? "Editar Forma de Pagamento" : "Cadastrar Forma de Pagamento"}
                        </h2>
                        <div className="mb-4">
                            <label className="block mb-1 font-medium">
                                Nome da Forma de Pagamento:
                            </label>
                            <input
                                type="text"
                                placeholder="Digite o nome"
                                value={newPaymentName}
                                onChange={(e) => setNewPaymentName(e.target.value)}
                                className="w-full border border-gray-300 rounded-md px-3 py-2"
                            />
                        </div>
                        <div className="flex justify-end gap-2">
                            <button
                                onClick={() => {
                                    setShowModal(false);
                                    setEditingMethod(null);
                                    setNewPaymentName('');
                                }}
                                className="bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded-lg"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={editingMethod ? handleUpdatePaymentMethod : handleAddPaymentMethod}
                                disabled={isSubmitting}
                                className={`px-4 py-2 rounded-lg text-white ${isSubmitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'}`}
                            >
                                {isSubmitting ? 'Salvando...' : 'Salvar'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
            <ToastContainer />
        </div>
    );
}