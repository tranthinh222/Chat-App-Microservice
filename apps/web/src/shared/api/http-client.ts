import axios from 'axios'
import type { AxiosRequestConfig } from 'axios'

type ApiEnvelope<T> = {
  success: boolean
  message: string
  data: T
}

type ApiErrorBody = {
  message?: string
}

export const httpClient = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
})

export async function apiRequest<T>(
  config: AxiosRequestConfig,
): Promise<T> {
  try {
    const response = await httpClient.request<ApiEnvelope<T>>(config)

    if (response.status === 204) {
      return undefined as T
    }

    return response.data.data
  } catch (error) {
    if (axios.isAxiosError<ApiErrorBody>(error)) {
      throw new Error(error.response?.data.message ?? 'Request failed', {
        cause: error,
      })
    }

    throw error
  }
}
