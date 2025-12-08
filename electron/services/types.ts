
export interface ServiceConfig {
  id: string
  name: string
  urls: string[]
}

export type MessageDto = {
  message: string,
  services: {
    id: string,
    name?: string,
    urls: string[]
  }[],
}

export type CrossWebviewMessageDto = {
  message: string,
  action: string,
  payload: any,
  services: {
    id: string,
    name?: string,
    urls: string[]
  }[],
}