
import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Save, 
  Loader2, 
  Plus, 
  Trash2, 
  Layers,
  Settings2,
  ToggleLeft,
  ToggleRight,
  Upload,
  CloudUpload,
  GripVertical
} from 'lucide-react';
import { IMaskInput } from 'react-imask';
import { 
    type Produto, 
    type CategoriaProduto, 
    type GrupoOpcaoPayload,
    type OpcaoPayload
} from '../../../types/interfaces-types';
import { getAllCategoriasProdutos } from '../../../services/categoriaProdutoService';
import { createProduto, updateProduto } from '../../../services/produtoService';
import api from '../../../services/api';
import { toast } from 'react-toastify';
import CategoriaModal from './CategoriaModal';

interface ProductFormProps {
  product: Produto | null;
  onClose: () => void;
  onSuccess: () => void;
}

const ProductForm: React.FC<ProductFormProps> = ({ product, onClose, onSuccess }) => {
  const [nome, setNome] = useState(product?.nomeProduto || '');
  const [preco, setPreco] = useState(product?.valorProduto?.toString().replace('.', ',') || '');
  const [image, setImage] = useState(product?.image || '');
  const [descricao, setDescricao] = useState(product?.descricao || '');
  const [categoriaId, setCategoriaId] = useState(product?.categoriaProduto_id?.toString() || '');
  const [isAtivo, setIsAtivo] = useState(product?.isAtivo ?? true);
  const [isUploading, setIsUploading] = useState(false);
  
  const [grupos, setGrupos] = useState<GrupoOpcaoPayload[]>(() => {
    if (product?.gruposOpcoes) {
      return product.gruposOpcoes.map(g => ({
        id: g.id,
        nomeGrupo: g.nomeGrupo,
        minEscolhas: g.minEscolhas,
        maxEscolhas: g.maxEscolhas,
        opcoes: g.opcoes?.map(o => ({
          id: o.id,
          nomeSubProduto: (o as any).nomeSubProduto || (o as any).nome,
          valorAdicional: Number(o.valorAdicional),
          isAtivo: (o as any).isAtivo ?? true
        })) || []
      }));
    }
    return [];
  });

  const [categorias, setCategorias] = useState<CategoriaProduto[]>([]);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'basic' | 'options'>('basic');

  // Estados para Drag & Drop
  const [draggedItem, setDraggedItem] = useState<{ gIndex: number; oIndex: number } | null>(null);
  const [dragOverGroup, setDragOverGroup] = useState<number | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchCategorias = async () => {
    try {
      const data = await getAllCategoriasProdutos();
      setCategorias(data);
    } catch (error) {
      toast.error("Erro ao carregar categorias.");
    }
  };

  useEffect(() => {
    fetchCategorias();
  }, []);

  const uploadImage = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('image', file);
    try {
        const response = await api.post('/upload/image', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return response.data.imageUrl;
    } catch (error) {
        throw new Error("Erro ao fazer upload da imagem.");
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
        toast.error("Selecione um arquivo de imagem.");
        return;
    }
    setIsUploading(true);
    const loadingToast = toast.loading("Enviando imagem...");
    try {
        const imageUrl = await uploadImage(file);
        setImage(imageUrl);
        toast.update(loadingToast, { render: "Sucesso!", type: "success", isLoading: false, autoClose: 2000 });
    } catch (error: any) {
        toast.update(loadingToast, { render: "Falha no upload.", type: "error", isLoading: false, autoClose: 3000 });
    } finally {
        setIsUploading(false);
    }
  };

  const addGrupo = () => {
    setGrupos([...grupos, { nomeGrupo: '', minEscolhas: 0, maxEscolhas: 1, opcoes: [] }]);
    setActiveTab('options');
  };

  const removeGrupo = (index: number) => {
    const newGrupos = [...grupos];
    newGrupos.splice(index, 1);
    setGrupos(newGrupos);
  };

  const updateGrupo = (index: number, field: keyof GrupoOpcaoPayload, value: any) => {
    const newGrupos = [...grupos];
    newGrupos[index] = { ...newGrupos[index], [field]: value };
    setGrupos(newGrupos);
  };

  const addOpcao = (grupoIndex: number) => {
    const newGrupos = [...grupos];
    newGrupos[grupoIndex].opcoes.push({ nomeSubProduto: '', valorAdicional: 0, isAtivo: true });
    setGrupos(newGrupos);
  };

  const removeOpcao = (grupoIndex: number, opcaoIndex: number) => {
    const newGrupos = [...grupos];
    newGrupos[grupoIndex].opcoes.splice(opcaoIndex, 1);
    setGrupos(newGrupos);
  };

  const updateOpcao = (grupoIndex: number, opcaoIndex: number, field: keyof OpcaoPayload, value: any) => {
    const newGrupos = [...grupos];
    newGrupos[grupoIndex].opcoes[opcaoIndex] = { ...newGrupos[grupoIndex].opcoes[opcaoIndex], [field]: value };
    setGrupos(newGrupos);
  };

  // Funções de Drag and Drop
  const handleDragStart = (gIndex: number, oIndex: number) => {
    setDraggedItem({ gIndex, oIndex });
  };

  const handleDragOver = (e: React.DragEvent, gIndex: number) => {
    e.preventDefault();
    if (dragOverGroup !== gIndex) {
      setDragOverGroup(gIndex);
    }
  };

  const handleDrop = (targetGIndex: number) => {
    if (!draggedItem) return;
    const { gIndex: sourceGIndex, oIndex: sourceOIndex } = draggedItem;

    // Se soltar no mesmo grupo, apenas reseta os estados de controle
    if (sourceGIndex === targetGIndex) {
      setDraggedItem(null);
      setDragOverGroup(null);
      return;
    }

    const newGrupos = [...grupos];
    
    // IMPORTANTE: Clonamos o item e REMOVEMOS o ID.
    // Isso garante que o backend entenda que este item deve ser CRIADO no novo grupo,
    // e o item original (que tinha o ID no grupo antigo) será removido por não estar mais na lista do grupo de origem.
    const itemToMove = { ...newGrupos[sourceGIndex].opcoes[sourceOIndex] };
    delete itemToMove.id; 

    // Remove do grupo de origem
    newGrupos[sourceGIndex].opcoes.splice(sourceOIndex, 1);
    
    // Adiciona ao grupo de destino
    newGrupos[targetGIndex].opcoes.push(itemToMove);

    setGrupos(newGrupos);
    setDraggedItem(null);
    setDragOverGroup(null);
    toast.info(`Item movido para "${newGrupos[targetGIndex].nomeGrupo || 'o grupo'}"`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!image) { return toast.warning("A imagem é obrigatória!"); }
    if (!categoriaId) return toast.warning("Selecione uma categoria.");
    if (isUploading) return toast.info("Aguarde o upload.");

    setSaving(true);
    const valorNumerico = parseFloat(preco.replace(/\./g, '').replace(',', '.'));
    
    // Sanitização final para garantir que grupos vazios ou sem nome não quebrem
    const gruposLimpos = grupos.filter(g => g.nomeGrupo.trim() !== "");

    const payload: any = {
      nomeProduto: nome,
      valorProduto: valorNumerico,
      image: image,
      descricao: descricao,
      isAtivo: isAtivo,
      categoriaProduto_id: Number(categoriaId),
      gruposOpcoes: gruposLimpos
    };

    try {
      if (product) {
        await updateProduto(product.id, payload);
        toast.success("Produto atualizado!");
      } else {
        await createProduto(payload);
        toast.success("Produto criado!");
      }
      onSuccess();
    } catch (error) {
      toast.error("Erro ao salvar o produto.");
    } finally {
      setSaving(false);
    }
  };

  const inputClasses = "w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3.5 text-sm outline-none focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 dark:text-slate-100 transition-all";
  const labelClasses = "block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5 ml-1";

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-0 sm:p-4 transition-colors">
      <div className="absolute inset-0 bg-slate-900/60 dark:bg-black/80 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-full sm:max-w-4xl h-full sm:h-auto sm:max-h-[90vh] bg-white dark:bg-slate-900 sm:rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col animate-slide-up">
        
        <div className="px-6 sm:px-8 pt-6 sm:pt-8 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl sm:text-2xl font-black text-slate-800 dark:text-slate-100 tracking-tight truncate">
                {product ? 'Editar Produto' : 'Novo Produto'}
            </h2>
            <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-800 dark:hover:text-slate-100 shrink-0">
              <X size={24} />
            </button>
          </div>

          <div className="flex gap-4 sm:gap-8 overflow-x-auto hide-scrollbar">
            <button 
              type="button"
              onClick={() => setActiveTab('basic')}
              className={`pb-4 px-2 text-[10px] sm:text-xs font-black uppercase tracking-widest transition-all border-b-4 whitespace-nowrap ${activeTab === 'basic' ? 'border-orange-500 text-orange-600 dark:text-orange-500' : 'border-transparent text-slate-400 dark:text-slate-600'}`}
            >
              <div className="flex items-center gap-2"><Settings2 size={14} /> Básico</div>
            </button>
            <button 
              type="button"
              onClick={() => setActiveTab('options')}
              className={`pb-4 px-2 text-[10px] sm:text-xs font-black uppercase tracking-widest transition-all border-b-4 whitespace-nowrap ${activeTab === 'options' ? 'border-orange-500 text-orange-600 dark:text-orange-500' : 'border-transparent text-slate-400 dark:text-slate-600'}`}
            >
              <div className="flex items-center gap-2"><Layers size={14} /> Adicionais ({grupos.length})</div>
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-8 bg-white dark:bg-slate-900 custom-scrollbar">
          {isCategoryModalOpen && (
            <CategoriaModal onClose={() => setIsCategoryModalOpen(false)} onRefresh={fetchCategorias} />
          )}

          {activeTab === 'basic' && (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div>
                    <label className={labelClasses}>Nome do Item *</label>
                    <input type="text" className={inputClasses} required value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Ex: X-Bacon Supremo" />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className={labelClasses}>Preço Base *</label>
                      <IMaskInput mask={Number} scale={2} radix="," thousandsSeparator="." className={inputClasses} required value={preco} onAccept={(value) => setPreco(value as string)} placeholder="0,00" />
                    </div>
                    <div>
                      <div className="flex justify-between items-center mb-1.5">
                        <label className={labelClasses}>Categoria</label>
                        <button type="button" onClick={() => setIsCategoryModalOpen(true)} className="text-[9px] font-black text-orange-600 uppercase hover:underline">Editar</button>
                      </div>
                      <select className={inputClasses} required value={categoriaId} onChange={(e) => setCategoriaId(e.target.value)}>
                          <option value="">Selecione...</option>
                          {categorias.map(cat => <option key={cat.id} value={cat.id}>{cat.nomeCategoriaProduto}</option>)}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className={labelClasses}>Descrição do Cardápio</label>
                    <textarea className={`${inputClasses} h-32 resize-none`} value={descricao} onChange={(e) => setDescricao(e.target.value)} placeholder="Descreva os ingredientes..." />
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className={labelClasses}>Foto do Produto *</label>
                    <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileChange} accept="image/*" />
                    <div 
                        onClick={() => fileInputRef.current?.click()}
                        className={`group relative aspect-video w-full rounded-[2rem] border-2 border-dashed transition-all flex flex-col items-center justify-center overflow-hidden shadow-inner cursor-pointer
                            ${image ? 'border-orange-500 bg-orange-50 dark:bg-orange-950/20' : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50'}
                            ${isUploading ? 'opacity-50 pointer-events-none' : ''}
                        `}
                    >
                        {isUploading ? (
                            <Loader2 className="animate-spin text-orange-500" size={32} />
                        ) : image ? (
                            <>
                                <img src={image} className="w-full h-full object-cover" alt="Preview" />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"><CloudUpload className="text-white" size={32} /></div>
                            </>
                        ) : (
                            <div className="flex flex-col items-center">
                                <Upload size={32} className="text-orange-500 mb-2" />
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Clique para enviar</span>
                            </div>
                        )}
                    </div>
                  </div>
                  
                  <div className="p-4 bg-orange-50 dark:bg-orange-900/10 rounded-2xl border border-orange-100 dark:border-orange-800 flex items-center justify-between">
                    <span className="text-[10px] font-black text-orange-800 dark:text-orange-500 uppercase tracking-widest">Disponível no Cardápio</span>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input type="checkbox" className="sr-only peer" checked={isAtivo} onChange={(e) => setIsAtivo(e.target.checked)} />
                      <div className="w-11 h-6 bg-slate-200 dark:bg-slate-700 rounded-full peer peer-checked:bg-orange-500 transition-all after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full"></div>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'options' && (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Grupos de Adicionais</h3>
                <button type="button" onClick={addGrupo} className="text-[10px] font-black text-orange-600 uppercase flex items-center gap-2 bg-orange-50 dark:bg-orange-500/10 px-4 py-2 rounded-xl hover:bg-orange-100 transition-all"><Plus size={14} /> Novo Grupo</button>
              </div>

              {grupos.length === 0 ? (
                <div className="py-20 text-center border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-[2.5rem]">
                  <p className="text-slate-400 font-bold text-[10px] uppercase">Nenhum adicional configurado</p>
                </div>
              ) : (
                <div className="space-y-8">
                  {grupos.map((grupo, gIndex) => (
                    <div 
                      key={gIndex} 
                      onDragOver={(e) => handleDragOver(e, gIndex)}
                      onDrop={() => handleDrop(gIndex)}
                      className={`bg-slate-50 dark:bg-slate-800/50 rounded-[2rem] p-6 border-2 transition-all relative group/card ${
                        dragOverGroup === gIndex 
                        ? 'border-orange-500 bg-orange-50/50 dark:bg-orange-500/10' 
                        : 'border-slate-100 dark:border-slate-700'
                      }`}
                    >
                      <button type="button" onClick={() => removeGrupo(gIndex)} className="absolute -top-2 -right-2 w-8 h-8 bg-rose-500 text-white rounded-xl flex items-center justify-center shadow-lg hover:bg-rose-600 transition-all z-10"><Trash2 size={14} /></button>

                      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mb-6">
                        <div className="md:col-span-8">
                          <label className={labelClasses}>Nome do Grupo</label>
                          <input type="text" className={inputClasses} placeholder="Ex: Escolha o ponto da carne" value={grupo.nomeGrupo} onChange={(e) => updateGrupo(gIndex, 'nomeGrupo', e.target.value)} />
                        </div>
                        <div className="grid grid-cols-2 md:col-span-4 gap-3">
                          <div>
                            <label className={labelClasses}>Mín</label>
                            <input type="number" className={inputClasses} value={grupo.minEscolhas} onChange={(e) => updateGrupo(gIndex, 'minEscolhas', Number(e.target.value))} />
                          </div>
                          <div>
                            <label className={labelClasses}>Máx</label>
                            <input type="number" className={inputClasses} value={grupo.maxEscolhas} onChange={(e) => updateGrupo(gIndex, 'maxEscolhas', Number(e.target.value))} />
                          </div>
                        </div>
                      </div>

                      <div className={`bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-100 dark:border-slate-800 space-y-3 transition-colors ${dragOverGroup === gIndex ? 'bg-orange-50/20' : ''}`}>
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Opções de Seleção</h4>
                          <button type="button" onClick={() => addOpcao(gIndex)} className="text-[9px] font-black text-blue-500 uppercase flex items-center gap-1 hover:underline"><Plus size={10} /> Adicionar Opção</button>
                        </div>
                        {grupo.opcoes.map((opcao, oIndex) => {
                          const isBeingDragged = draggedItem?.gIndex === gIndex && draggedItem?.oIndex === oIndex;
                          
                          return (
                            <div 
                              key={oIndex} 
                              draggable="true"
                              onDragStart={() => handleDragStart(gIndex, oIndex)}
                              onDragEnd={() => { setDraggedItem(null); setDragOverGroup(null); }}
                              className={`flex flex-col sm:flex-row items-stretch gap-3 bg-slate-50 dark:bg-slate-800/30 p-2 rounded-xl border border-slate-100 dark:border-slate-800 transition-all ${
                                isBeingDragged ? 'opacity-20 scale-95 border-dashed' : 'hover:border-slate-300'
                              }`}
                            >
                              <div className="flex items-center gap-2 flex-1">
                                <div className="cursor-grab active:cursor-grabbing text-slate-300 hover:text-orange-500 transition-colors shrink-0">
                                  <GripVertical size={16} />
                                </div>
                                <input type="text" className="flex-1 bg-transparent border-none text-xs font-bold p-1 outline-none dark:text-slate-100" placeholder="Título da opção" value={opcao.nomeSubProduto} onChange={(e) => updateOpcao(gIndex, oIndex, 'nomeSubProduto', e.target.value)} />
                              </div>
                              <div className="flex items-center gap-3">
                                  <div className="flex items-center bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2 shrink-0">
                                    <span className="text-[9px] font-bold text-slate-300 mr-1">R$</span>
                                    <input type="number" step="0.01" className="w-16 bg-transparent border-none text-[10px] font-black p-1 outline-none text-right dark:text-slate-100" value={opcao.valorAdicional} onChange={(e) => updateOpcao(gIndex, oIndex, 'valorAdicional', Number(e.target.value))} />
                                  </div>
                                  <button type="button" onClick={() => updateOpcao(gIndex, oIndex, 'isAtivo', !opcao.isAtivo)} className={`p-2 rounded-lg transition-all ${opcao.isAtivo ? 'text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10' : 'text-slate-300'}`}>{opcao.isAtivo ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}</button>
                                  <button type="button" onClick={() => removeOpcao(gIndex, oIndex)} className="p-2 text-slate-200 hover:text-rose-500"><Trash2 size={14} /></button>
                              </div>
                            </div>
                          );
                        })}
                        {grupo.opcoes.length === 0 && (
                          <div className="py-4 text-center border border-dashed border-slate-100 dark:border-slate-800 rounded-xl">
                            <p className="text-[8px] font-bold text-slate-300 uppercase">Arraste itens para cá ou adicione novos</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </form>

        <div className="p-6 sm:p-8 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row gap-4 transition-colors">
          <button type="button" onClick={onClose} className="w-full sm:w-auto px-10 py-4 rounded-2xl font-bold text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-800 transition-all text-[10px] uppercase tracking-widest">Cancelar</button>
          <button onClick={handleSubmit} disabled={saving || isUploading} className="flex-1 bg-orange-500 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-orange-600 transition-all shadow-xl shadow-orange-100 dark:shadow-none flex items-center justify-center gap-3 disabled:opacity-50">
            {saving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />} 
            {product ? 'Salvar Alterações' : 'Cadastrar Produto'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductForm;