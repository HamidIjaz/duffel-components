import { Offer } from "./Offer";

// TODO: define types.
export interface CreateOrderPayload {
  selected_offers: Array<Offer["id"]>;
  passengers: Array<CreateOrderPayloadPassengers>;
  services: CreateOrderPayloadServices;
}

export type CreateOrderPayloadServices = CreateOrderPayloadService[];

export interface CreateOrderPayloadService {
  id: string;
  quantity: number;
}

export interface CreateOrderPayloadPassengers {
  id: string;
}
