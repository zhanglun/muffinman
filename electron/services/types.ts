
export interface ServiceConfig {
  id: string
  name: string
  urls: string[]
}

export type MessageDto = {
  message: string,
  services: {
    id: string,
  }[],
}