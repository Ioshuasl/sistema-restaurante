import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Save,
  Loader2,
  Plus,
  Trash2,
  ToggleLeft,
  ToggleRight,
  Upload,
  CloudUpload,
  GripVertical,
  ChevronLeft,
  ChevronRight,
  Check,
} from 'lucide-react';
import { IMaskInput } from 'react-imask';
import {
  type Produto,
  type CategoriaProduto,
  type GrupoOpcaoPayload,
  type OpcaoPayload,
  type TipoMenu,
} from '../../../types/interfaces-types';
import { getAllCategoriasProdutos } from '../../../services/categoriaProdutoService';
import { createProduto, updateProduto } from '../../../services/produtoService';
import api from '../../../services/api';
import { toast } from 'react-toastify';

interface ProductFormProps {
  product: Produto | null;
  onClose: () => void;
  onSuccess: () => void;
  onManageCategories: () => void;
  categoriasRefreshKey?: number;
}

type WizardStep = 1 | 2 | 3;

const TIPO_MENU_OPTIONS: { value: TipoMenu; label: string; hint: string }[] = [
  { value: 'dia', label: 'Almoço', hint: 'Marmitas / dia' },
  { value: 'noite', label: 'Jantar', hint: 'Espetinhos / noite' },
  { value: 'ambos', label: 'Ambos', hint: 'Aparece nos dois' },
];

const STEPS = [
  { id: 1 as const, label: 'Essenciais' },
  { id: 2 as const, label: 'Mídia' },
  { id: 3 as const, label: 'Adicionais' },
];

const ProductForm: React.FC<ProductFormProps> = ({
  product,
  onClose,
  onSuccess,
  onManageCategories,
  categoriasRefreshKey = 0,
}) => {
  const [step, setStep] = useState<WizardStep>(1);
  const [nome, setNome] = useState(product?.nomeProduto || '');
  const [preco, setPreco] = useState(product?.valorProduto?.toString().replace('.', ',') || '');
  const [image, setImage] = useState(product?.image || '');
  const [descricao, setDescricao] = useState(product?.descricao || '');
  const [categoriaId, setCategoriaId] = useState(product?.categoriaProduto_id?.toString() || '');
  const [isAtivo, setIsAtivo] = useState(product?.isAtivo ?? true);
  const [tipoMenu, setTipoMenu] = useState<TipoMenu>(product?.tipoMenu || 'dia');
  const [isUploading, setIsUploading] = useState(false);

  const [grupos, setGrupos] = useState<GrupoOpcaoPayload[]>(() => {
    if (product?.gruposOpcoes) {
      return product.gruposOpcoes.map((g) => ({
        id: g.id,
        nomeGrupo: g.nomeGrupo,
        minEscolhas: g.minEscolhas,
        maxEscolhas: g.maxEscolhas,
        opcoes:
          g.opcoes?.map((o) => ({
            id: o.id,
            nomeSubProduto: (o as { nomeSubProduto?: string; nome?: string }).nomeSubProduto ||
              (o as { nome?: string }).nome ||
              '',
            valorAdicional: Number(o.valorAdicional),
            isAtivo: (o as { isAtivo?: boolean }).isAtivo ?? true,
          })) || [],
      }));
    }
    return [];
  });

  const [categorias, setCategorias] = useState<CategoriaProduto[]>([]);
  const [saving, setSaving] = useState(false);
  const [draggedItem, setDraggedItem] = useState<{ gIndex: number; oIndex: number } | null>(null);
  const [dragOverGroup, setDragOverGroup] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchCategorias = async () => {
    try {
      const data = await getAllCategoriasProdutos();
      setCategorias(Array.isArray(data) ? data : []);
    } catch {
      toast.error('Erro ao carregar categorias.');
    }
  };

  useEffect(() => {
    fetchCategorias();
  }, [categoriasRefreshKey]);

  const uploadImage = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('image', file);
    const response = await api.post('/upload/image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data.imageUrl;
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Selecione um arquivo de imagem.');
      return;
    }
    setIsUploading(true);
    const loadingToast = toast.loading('Enviando imagem...');
    try {
      const imageUrl = await uploadImage(file);
      setImage(imageUrl);
      toast.update(loadingToast, {
        render: 'Sucesso!',
        type: 'success',
        isLoading: false,
        autoClose: 2000,
      });
    } catch {
      toast.update(loadingToast, {
        render: 'Falha no upload.',
        type: 'error',
        isLoading: false,
        autoClose: 3000,
      });
    } finally {
      setIsUploading(false);
    }
  };

  const addGrupo = () => {
    setGrupos([...grupos, { nomeGrupo: '', minEscolhas: 0, maxEscolhas: 1, opcoes: [] }]);
  };

  const removeGrupo = (index: number) => {
    const next = [...grupos];
    next.splice(index, 1);
    setGrupos(next);
  };

  const updateGrupo = (index: number, field: keyof GrupoOpcaoPayload, value: unknown) => {
    const next = [...grupos];
    next[index] = { ...next[index], [field]: value };
    setGrupos(next);
  };

  const addOpcao = (grupoIndex: number) => {
    const next = [...grupos];
    next[grupoIndex].opcoes.push({ nomeSubProduto: '', valorAdicional: 0, isAtivo: true });
    setGrupos(next);
  };

  const removeOpcao = (grupoIndex: number, opcaoIndex: number) => {
    const next = [...grupos];
    next[grupoIndex].opcoes.splice(opcaoIndex, 1);
    setGrupos(next);
  };

  const updateOpcao = (
    grupoIndex: number,
    opcaoIndex: number,
    field: keyof OpcaoPayload,
    value: unknown
  ) => {
    const next = [...grupos];
    next[grupoIndex].opcoes[opcaoIndex] = {
      ...next[grupoIndex].opcoes[opcaoIndex],
      [field]: value,
    };
    setGrupos(next);
  };

  const handleDragStart = (gIndex: number, oIndex: number) => {
    setDraggedItem({ gIndex, oIndex });
  };

  const handleDragOver = (e: React.DragEvent, gIndex: number) => {
    e.preventDefault();
    if (dragOverGroup !== gIndex) setDragOverGroup(gIndex);
  };

  const handleDrop = (targetGIndex: number) => {
    if (!draggedItem) return;
    const { gIndex: sourceGIndex, oIndex: sourceOIndex } = draggedItem;
    if (sourceGIndex === targetGIndex) {
      setDraggedItem(null);
      setDragOverGroup(null);
      return;
    }

    const next = [...grupos];
    const itemToMove = { ...next[sourceGIndex].opcoes[sourceOIndex] };
    delete itemToMove.id;
    next[sourceGIndex].opcoes.splice(sourceOIndex, 1);
    next[targetGIndex].opcoes.push(itemToMove);
    setGrupos(next);
    setDraggedItem(null);
    setDragOverGroup(null);
    toast.info(`Item movido para "${next[targetGIndex].nomeGrupo || 'o grupo'}"`);
  };

  const validateStep1 = () => {
    if (!nome.trim()) {
      toast.warning('Informe o nome do produto.');
      return false;
    }
    if (!preco.trim()) {
      toast.warning('Informe o preço base.');
      return false;
    }
    if (!categoriaId) {
      toast.warning('Selecione uma categoria.');
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    if (!image) {
      toast.warning('A foto do produto é obrigatória.');
      return false;
    }
    if (isUploading) {
      toast.info('Aguarde o upload da imagem.');
      return false;
    }
    return true;
  };

  const goNext = () => {
    if (step === 1 && !validateStep1()) return;
    if (step === 2 && !validateStep2()) return;
    if (step < 3) setStep((s) => (s + 1) as WizardStep);
  };

  const goBack = () => {
    if (step > 1) setStep((s) => (s - 1) as WizardStep);
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!validateStep1()) {
      setStep(1);
      return;
    }
    if (!validateStep2()) {
      setStep(2);
      return;
    }

    setSaving(true);
    const valorNumerico = parseFloat(preco.replace(/\./g, '').replace(',', '.'));
    const gruposLimpos = grupos.filter((g) => g.nomeGrupo.trim() !== '');

    const payload = {
      nomeProduto: nome,
      valorProduto: valorNumerico,
      image,
      descricao,
      isAtivo,
      tipoMenu,
      categoriaProduto_id: Number(categoriaId),
      gruposOpcoes: gruposLimpos,
    };

    try {
      if (product) {
        await updateProduto(product.id, payload);
        toast.success('Produto atualizado!');
      } else {
        await createProduto(payload);
        toast.success('Produto criado!');
      }
      onSuccess();
    } catch {
      toast.error('Erro ao salvar o produto.');
    } finally {
      setSaving(false);
    }
  };

  const saveFromStep2 = async () => {
    if (!validateStep1() || !validateStep2()) return;
    await handleSubmit();
  };

  const inputClasses =
    'w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3.5 text-sm outline-none focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 dark:text-slate-100 transition-all';
  const labelClasses =
    'block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5 ml-1';

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-0 sm:p-4 transition-colors">
      <div className="absolute inset-0 bg-slate-900/60 dark:bg-black/80 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full sm:max-w-4xl h-full sm:h-auto sm:max-h-[92vh] bg-white dark:bg-slate-900 sm:rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col animate-slide-up">
        <div className="px-6 sm:px-8 pt-6 sm:pt-8 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 shrink-0">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-800 dark:text-slate-100 tracking-tight">
                {product ? 'Editar produto' : 'Novo produto'}
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Passo {step} de 3 — {STEPS[step - 1].label}
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="cursor-pointer p-2 text-slate-400 hover:text-slate-800 dark:hover:text-slate-100 shrink-0"
              aria-label="Fechar"
            >
              <X size={24} />
            </button>
          </div>

          <nav aria-label="Etapas do formulário" className="flex gap-2 pb-5">
            {STEPS.map((s) => {
              const done = step > s.id;
              const active = step === s.id;
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => {
                    if (s.id < step) setStep(s.id);
                    else if (s.id === step + 1) goNext();
                  }}
                  className={`cursor-pointer flex-1 flex items-center gap-2 px-3 py-2.5 rounded-xl border text-left transition-all ${
                    active
                      ? 'border-orange-500 bg-orange-50 dark:bg-orange-950/30 text-orange-700 dark:text-orange-400'
                      : done
                        ? 'border-emerald-200 dark:border-emerald-900 bg-emerald-50/50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400'
                        : 'border-slate-200 dark:border-slate-800 text-slate-400'
                  }`}
                >
                  <span
                    className={`w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-black shrink-0 ${
                      active
                        ? 'bg-orange-500 text-white'
                        : done
                          ? 'bg-emerald-500 text-white'
                          : 'bg-slate-200 dark:bg-slate-800'
                    }`}
                  >
                    {done ? <Check size={12} /> : s.id}
                  </span>
                  <span className="text-[10px] font-black uppercase tracking-widest hidden sm:inline">
                    {s.label}
                  </span>
                </button>
              );
            })}
          </nav>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (step === 3) handleSubmit();
            else goNext();
          }}
          className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6 bg-white dark:bg-slate-900 custom-scrollbar"
        >
          {step === 1 && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div>
                <label className={labelClasses} htmlFor="produto-nome">
                  Nome do item *
                </label>
                <input
                  id="produto-nome"
                  type="text"
                  className={inputClasses}
                  required
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  placeholder="Ex: X-Bacon Supremo"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelClasses} htmlFor="produto-preco">
                    Preço base *
                  </label>
                  <IMaskInput
                    id="produto-preco"
                    mask={Number}
                    scale={2}
                    radix=","
                    thousandsSeparator="."
                    className={inputClasses}
                    required
                    value={preco}
                    onAccept={(value) => setPreco(value as string)}
                    placeholder="0,00"
                  />
                </div>
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className={labelClasses} htmlFor="produto-categoria">
                      Categoria *
                    </label>
                    <button
                      type="button"
                      onClick={onManageCategories}
                      className="cursor-pointer text-[9px] font-black text-orange-600 uppercase hover:underline"
                    >
                      + Criar categoria
                    </button>
                  </div>
                  <select
                    id="produto-categoria"
                    className={inputClasses}
                    required
                    value={categoriaId}
                    onChange={(e) => setCategoriaId(e.target.value)}
                  >
                    <option value="">Selecione...</option>
                    {categorias.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.nomeCategoriaProduto}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <p className={labelClasses}>Cardápio *</p>
                <div className="grid grid-cols-3 gap-2" role="group" aria-label="Tipo de cardápio">
                  {TIPO_MENU_OPTIONS.map((opt) => {
                    const pressed = tipoMenu === opt.value;
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        aria-pressed={pressed}
                        onClick={() => setTipoMenu(opt.value)}
                        className={`cursor-pointer rounded-xl border px-3 py-3 text-center transition-all ${
                          pressed
                            ? 'border-orange-500 bg-orange-50 dark:bg-orange-950/30'
                            : 'border-slate-200 dark:border-slate-700 hover:border-orange-300'
                        }`}
                      >
                        <span
                          className={`block text-[10px] font-black uppercase tracking-widest ${
                            pressed ? 'text-orange-600' : 'text-slate-600 dark:text-slate-300'
                          }`}
                        >
                          {opt.label}
                        </span>
                        <span className="block text-[9px] text-slate-400 mt-1">{opt.hint}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className={labelClasses} htmlFor="produto-descricao">
                  Descrição do cardápio
                </label>
                <textarea
                  id="produto-descricao"
                  className={`${inputClasses} h-28 resize-none`}
                  value={descricao}
                  onChange={(e) => setDescricao(e.target.value)}
                  placeholder="Descreva os ingredientes..."
                />
              </div>

              <div className="p-4 bg-orange-50 dark:bg-orange-900/10 rounded-2xl border border-orange-100 dark:border-orange-800 flex items-center justify-between">
                <span className="text-[10px] font-black text-orange-800 dark:text-orange-500 uppercase tracking-widest">
                  Disponível no cardápio
                </span>
                <button
                  type="button"
                  role="switch"
                  aria-checked={isAtivo}
                  onClick={() => setIsAtivo((v) => !v)}
                  className="cursor-pointer"
                >
                  {isAtivo ? (
                    <ToggleRight size={28} className="text-orange-500" />
                  ) : (
                    <ToggleLeft size={28} className="text-slate-300" />
                  )}
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div>
                <label className={labelClasses}>Foto do produto *</label>
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  onChange={handleFileChange}
                  accept="image/*"
                />
                <div
                  onClick={() => fileInputRef.current?.click()}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') fileInputRef.current?.click();
                  }}
                  role="button"
                  tabIndex={0}
                  className={`group relative aspect-video w-full max-w-xl mx-auto rounded-[2rem] border-2 border-dashed transition-all flex flex-col items-center justify-center overflow-hidden shadow-inner cursor-pointer
                    ${image ? 'border-orange-500 bg-orange-50 dark:bg-orange-950/20' : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50'}
                    ${isUploading ? 'opacity-50 pointer-events-none' : ''}
                  `}
                >
                  {isUploading ? (
                    <Loader2 className="animate-spin text-orange-500" size={32} />
                  ) : image ? (
                    <>
                      <img src={image} className="w-full h-full object-cover" alt="Preview" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <CloudUpload className="text-white" size={32} />
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-col items-center px-6 text-center">
                      <Upload size={32} className="text-orange-500 mb-2" />
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        Clique para enviar
                      </span>
                      <span className="text-xs text-slate-400 mt-2">
                        Use uma foto clara do prato — isso vende no cardápio.
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="animate-in fade-in duration-200 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    Grupos de adicionais
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">Opcional — configure só se o item tiver escolhas.</p>
                </div>
                <button
                  type="button"
                  onClick={addGrupo}
                  className="cursor-pointer text-[10px] font-black text-orange-600 uppercase flex items-center gap-2 bg-orange-50 dark:bg-orange-500/10 px-4 py-2 rounded-xl hover:bg-orange-100 transition-all"
                >
                  <Plus size={14} /> Novo grupo
                </button>
              </div>

              {grupos.length === 0 ? (
                <div className="py-16 text-center border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-[2rem] space-y-3">
                  <p className="text-slate-500 font-bold text-sm">Nenhum adicional configurado</p>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto">
                    Você pode salvar o produto agora e adicionar grupos depois, se precisar.
                  </p>
                  <button
                    type="button"
                    onClick={addGrupo}
                    className="cursor-pointer text-orange-600 text-[10px] font-black uppercase tracking-widest hover:underline"
                  >
                    Adicionar grupo
                  </button>
                </div>
              ) : (
                <div className="space-y-8">
                  {grupos.map((grupo, gIndex) => (
                    <div
                      key={gIndex}
                      onDragOver={(e) => handleDragOver(e, gIndex)}
                      onDrop={() => handleDrop(gIndex)}
                      className={`bg-slate-50 dark:bg-slate-800/50 rounded-[2rem] p-6 border-2 transition-all relative ${
                        dragOverGroup === gIndex
                          ? 'border-orange-500 bg-orange-50/50 dark:bg-orange-500/10'
                          : 'border-slate-100 dark:border-slate-700'
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => removeGrupo(gIndex)}
                        className="cursor-pointer absolute -top-2 -right-2 w-8 h-8 bg-rose-500 text-white rounded-xl flex items-center justify-center shadow-lg hover:bg-rose-600 transition-all z-10"
                        aria-label="Remover grupo"
                      >
                        <Trash2 size={14} />
                      </button>

                      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mb-6">
                        <div className="md:col-span-8">
                          <label className={labelClasses}>Nome do grupo</label>
                          <input
                            type="text"
                            className={inputClasses}
                            placeholder="Ex: Escolha o ponto da carne"
                            value={grupo.nomeGrupo}
                            onChange={(e) => updateGrupo(gIndex, 'nomeGrupo', e.target.value)}
                          />
                        </div>
                        <div className="grid grid-cols-2 md:col-span-4 gap-3">
                          <div>
                            <label className={labelClasses}>Mín</label>
                            <input
                              type="number"
                              className={inputClasses}
                              value={grupo.minEscolhas}
                              onChange={(e) =>
                                updateGrupo(gIndex, 'minEscolhas', Number(e.target.value))
                              }
                            />
                          </div>
                          <div>
                            <label className={labelClasses}>Máx</label>
                            <input
                              type="number"
                              className={inputClasses}
                              value={grupo.maxEscolhas}
                              onChange={(e) =>
                                updateGrupo(gIndex, 'maxEscolhas', Number(e.target.value))
                              }
                            />
                          </div>
                        </div>
                      </div>

                      <div
                        className={`bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-100 dark:border-slate-800 space-y-3 ${
                          dragOverGroup === gIndex ? 'bg-orange-50/20' : ''
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-[9px] font-black text-slate-300 uppercase tracking-widest">
                            Opções de seleção
                          </h4>
                          <button
                            type="button"
                            onClick={() => addOpcao(gIndex)}
                            className="cursor-pointer text-[9px] font-black text-blue-500 uppercase flex items-center gap-1 hover:underline"
                          >
                            <Plus size={10} /> Adicionar opção
                          </button>
                        </div>
                        {grupo.opcoes.map((opcao, oIndex) => {
                          const isBeingDragged =
                            draggedItem?.gIndex === gIndex && draggedItem?.oIndex === oIndex;
                          return (
                            <div
                              key={oIndex}
                              draggable
                              onDragStart={() => handleDragStart(gIndex, oIndex)}
                              onDragEnd={() => {
                                setDraggedItem(null);
                                setDragOverGroup(null);
                              }}
                              className={`flex flex-col sm:flex-row items-stretch gap-3 bg-slate-50 dark:bg-slate-800/30 p-2 rounded-xl border border-slate-100 dark:border-slate-800 transition-all ${
                                isBeingDragged
                                  ? 'opacity-20 scale-95 border-dashed'
                                  : 'hover:border-slate-300'
                              }`}
                            >
                              <div className="flex items-center gap-2 flex-1">
                                <div className="cursor-grab active:cursor-grabbing text-slate-300 hover:text-orange-500 transition-colors shrink-0">
                                  <GripVertical size={16} />
                                </div>
                                <input
                                  type="text"
                                  className="flex-1 bg-transparent border-none text-xs font-bold p-1 outline-none dark:text-slate-100"
                                  placeholder="Título da opção"
                                  value={opcao.nomeSubProduto}
                                  onChange={(e) =>
                                    updateOpcao(gIndex, oIndex, 'nomeSubProduto', e.target.value)
                                  }
                                />
                              </div>
                              <div className="flex items-center gap-3">
                                <div className="flex items-center bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2 shrink-0">
                                  <span className="text-[9px] font-bold text-slate-300 mr-1">R$</span>
                                  <input
                                    type="number"
                                    step="0.01"
                                    className="w-16 bg-transparent border-none text-[10px] font-black p-1 outline-none text-right dark:text-slate-100"
                                    value={opcao.valorAdicional}
                                    onChange={(e) =>
                                      updateOpcao(
                                        gIndex,
                                        oIndex,
                                        'valorAdicional',
                                        Number(e.target.value)
                                      )
                                    }
                                  />
                                </div>
                                <button
                                  type="button"
                                  onClick={() =>
                                    updateOpcao(gIndex, oIndex, 'isAtivo', !opcao.isAtivo)
                                  }
                                  className={`cursor-pointer p-2 rounded-lg transition-all ${
                                    opcao.isAtivo
                                      ? 'text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10'
                                      : 'text-slate-300'
                                  }`}
                                >
                                  {opcao.isAtivo ? (
                                    <ToggleRight size={20} />
                                  ) : (
                                    <ToggleLeft size={20} />
                                  )}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => removeOpcao(gIndex, oIndex)}
                                  className="cursor-pointer p-2 text-slate-200 hover:text-rose-500"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                        {grupo.opcoes.length === 0 && (
                          <div className="py-4 text-center border border-dashed border-slate-100 dark:border-slate-800 rounded-xl">
                            <p className="text-[8px] font-bold text-slate-300 uppercase">
                              Arraste itens para cá ou adicione novos
                            </p>
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

        <div className="p-5 sm:p-6 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex flex-col-reverse sm:flex-row gap-3 transition-colors shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer w-full sm:w-auto px-6 py-3.5 rounded-2xl font-bold text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-800 transition-all text-[10px] uppercase tracking-widest"
          >
            Cancelar
          </button>

          <div className="flex-1 flex flex-col sm:flex-row gap-3 sm:justify-end">
            {step > 1 && (
              <button
                type="button"
                onClick={goBack}
                className="cursor-pointer px-6 py-3.5 rounded-2xl font-black uppercase tracking-widest text-[10px] border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800 flex items-center justify-center gap-2"
              >
                <ChevronLeft size={16} /> Voltar
              </button>
            )}

            {step === 2 && (
              <button
                type="button"
                onClick={saveFromStep2}
                disabled={saving || isUploading}
                className="cursor-pointer px-6 py-3.5 rounded-2xl font-black uppercase tracking-widest text-[10px] border border-orange-200 text-orange-700 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-950/30 disabled:opacity-50"
              >
                Salvar sem adicionais
              </button>
            )}

            {step < 3 ? (
              <button
                type="button"
                onClick={goNext}
                className="cursor-pointer flex-1 sm:flex-none bg-orange-500 text-white px-8 py-3.5 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-orange-600 transition-all shadow-lg shadow-orange-100 dark:shadow-none flex items-center justify-center gap-2"
              >
                Continuar <ChevronRight size={16} />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => handleSubmit()}
                disabled={saving || isUploading}
                className="cursor-pointer flex-1 sm:flex-none bg-orange-500 text-white px-8 py-3.5 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-orange-600 transition-all shadow-xl shadow-orange-100 dark:shadow-none flex items-center justify-center gap-3 disabled:opacity-50"
              >
                {saving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                {product ? 'Salvar alterações' : 'Cadastrar produto'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductForm;
