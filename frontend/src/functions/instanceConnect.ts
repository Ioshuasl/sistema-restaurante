
import axios, { AxiosError } from "axios";

interface EvolutionInstanceConnection {
  pairingCode: string | null;
  code: string;
  base64: string; 
  count: number;
}

export interface EvolutionConnectionState {
  instance: {
    instanceName: string;
    state: string;
  }
}

export interface EvolutionConnectionParams {
  serverUrl?: string;
  instanceName: string;
  apikey?: string;
}

const DEFAULT_EVOLUTION_SERVER_URL = import.meta.env.VITE_EVOLUTION_API_URL || "";
const DEFAULT_EVOLUTION_API_KEY = import.meta.env.VITE_EVOLUTION_API_KEY || "";

/**
 * Conecta uma instância gerando um QR Code (Base64)
 */
export async function connectInstance(
  params: EvolutionConnectionParams
): Promise<EvolutionInstanceConnection | null> {
  const { instanceName } = params;
  const serverUrl = params.serverUrl || DEFAULT_EVOLUTION_SERVER_URL;
  const apikey = params.apikey || DEFAULT_EVOLUTION_API_KEY;

  if (!serverUrl || !serverUrl.startsWith("http")) {
    console.error("URL do servidor inválida.");
    return null;
  }
  if (!instanceName) return null;

  const endpoint = `${serverUrl}/instance/connect/${instanceName}`;

  try {
    const response = await axios.get<EvolutionInstanceConnection>(endpoint, {
      headers: {
        "apikey": apikey,
        "Content-Type": "application/json",
      },
    });
    return response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;
      console.error("Erro Evolution API (Connect):", axiosError.response?.data || axiosError.message);
    }
    return null;
  }
}

/**
 * Verifica o estado atual da conexão da instância (open, close, connecting, etc)
 */
export async function connectionState(
  params: EvolutionConnectionParams
): Promise<EvolutionConnectionState | null> {
  const { instanceName } = params;
  const serverUrl = params.serverUrl || DEFAULT_EVOLUTION_SERVER_URL;
  const apikey = params.apikey || DEFAULT_EVOLUTION_API_KEY;

  if (!serverUrl || !serverUrl.startsWith("http")) {
    console.error("URL do servidor inválida.");
    return null;
  }
  if (!instanceName) return null;

  const endpoint = `${serverUrl}/instance/connectionState/${instanceName}`;

  try {
    const response = await axios.get<EvolutionConnectionState>(endpoint, {
      headers: {
        "apikey": apikey,
        "Content-Type": "application/json",
      },
    });
    return response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;
      console.error("Erro Evolution API (State):", axiosError.response?.data || axiosError.message);
    }
    return null;
  }
}
