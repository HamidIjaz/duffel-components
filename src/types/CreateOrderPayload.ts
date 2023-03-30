import { Offer } from "./Offer";

export interface CreateOrderPayload {
  selected_offers: Array<Offer["id"]>;
  passengers: CreateOrderPayloadPassengers;
  services: CreateOrderPayloadServices;
  payments: Array<CreateOrderPayloadPayment>;
  type: "instant";
  metadata: Record<string, string>;
}

export interface CreateOrderPayloadPassenger {
  id: string;
  given_name: string;
  family_name: string;
  gender: string;
  title: string;
  born_on: string;
  email: string;
  phone_number: string;
}

export type CreateOrderPayloadPassengers = Array<CreateOrderPayloadPassenger>;

export type CreateOrderPayloadPaymentType = "balance";

export interface CreateOrderPayloadPayment {
  type: CreateOrderPayloadPaymentType;
  amount: string;
  currency: string;
}

export type CreateOrderPayloadServices = CreateOrderPayloadService[];

export interface CreateOrderPayloadService {
  id: string;
  quantity: number;
}
