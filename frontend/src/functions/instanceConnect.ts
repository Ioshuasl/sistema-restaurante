import api from "../services/api";

export interface WhatsappConnectResult {
  state: "open" | "connecting" | "close";
  status: string;
  /** QR code como data URI (png), presente enquanto a sessão aguarda leitura. */
  qr: string | null;
}

export interface WhatsappStatus {
  state: "open" | "connecting" | "close";
  status: string;
}

/**
 * Inicia a sessão do WhatsApp no servidor e devolve o QR Code para leitura.
 * (As chamadas à WAHA passam pelo backend: a chave de API não fica exposta no navegador.)
 */
export async function connectInstance(): Promise<WhatsappConnectResult | null> {
  try {
    const { data } = await api.post<WhatsappConnectResult>("/whatsapp/connect", undefined, { timeout: 40000 });
    return data;
  } catch (error) {
    console.error("Erro ao conectar WhatsApp:", error);
    return null;
  }
}

/** Estado atual da conexão (open / connecting / close). */
export async function connectionState(): Promise<WhatsappStatus | null> {
  try {
    const { data } = await api.get<WhatsappStatus>("/whatsapp/status");
    return data;
  } catch (error) {
    console.error("Erro ao consultar status do WhatsApp:", error);
    return null;
  }
}
