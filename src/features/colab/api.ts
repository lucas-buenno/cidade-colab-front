import { apiClient } from "@/shared/api/client";
import type {
  ColabResponse,
  CreateColabRequest,
  PrepareColabResponse,
} from "@/shared/types/colab";

export async function prepareColab(
  file: File,
  onProgress?: (percent: number) => void,
  signal?: AbortSignal,
): Promise<PrepareColabResponse> {
  const formData = new FormData();
  formData.append("file", file);

  const { data } = await apiClient.post<PrepareColabResponse>(
    "/v1/colab/prepare",
    formData,
    {
      timeout: 120_000,
      signal,
      headers: { "Content-Type": false as unknown as string },
      onUploadProgress: (event) => {
        if (!event.total) return;
        onProgress?.(Math.round((event.loaded / event.total) * 100));
      },
    },
  );

  return data;
}

export async function createColab(payload: CreateColabRequest): Promise<void> {
  await apiClient.post("/v1/colab/create", payload);
}

export async function fetchColab(colabId: string): Promise<ColabResponse> {
  const { data } = await apiClient.get<ColabResponse>(`/v1/colab/${colabId}`);
  return data;
}
