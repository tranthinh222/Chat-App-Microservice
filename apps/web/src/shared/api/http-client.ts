import axios from 'axios'
import type { AxiosRequestConfig } from 'axios'

type ApiEnvelope<T> = {
  success: boolean
  message: string
  data: T
}

type ApiErrorBody = {
  code?: string
  message?: string
  errors?: Array<{
    field: string
    message: string
  }>
}

export class ApiRequestError extends Error {
  readonly code?: string
  readonly fieldErrors: Record<string, string>

  constructor(
    message: string,
    errors: ApiErrorBody['errors'] = [],
    code?: string,
    cause?: unknown,
  ) {
    super(message, { cause })
    this.name = 'ApiRequestError'
    this.code = code
    this.fieldErrors = Object.fromEntries(
      errors.map((error) => [error.field, error.message]),
    )
  }
}

export const httpClient = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
})

export async function apiRequest<T>(config: AxiosRequestConfig): Promise<T> {
  try {
    const response = await httpClient.request<ApiEnvelope<T>>(config)

    if (response.status === 204) {
      return undefined as T
    }

    return response.data.data
  } catch (error) {
    if (axios.isAxiosError<ApiErrorBody>(error)) {
      const body = error.response?.data

      throw new ApiRequestError(
        body?.message ?? 'Request failed',
        body?.errors,
        body?.code,
        error,
      )
    }

    throw error
  }
}
