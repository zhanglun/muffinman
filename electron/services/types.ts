export interface ServiceConfig {
  id: string;
  name: string;
  urls: string[];
}

export type MessageDto = {
  message: string;
  action: string;
  payload: any;
  fromId: string;
  services: {
    id: string;
    name?: string;
    urls: string[];
  }[];
};

export type CrossWebviewMessageDto = {
  message: string;
  action: string;
  payload: any;
  fromId: string;
  services: {
    id: string;
    name?: string;
    urls: string[];
  }[];
};
