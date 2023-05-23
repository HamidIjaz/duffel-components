import {
  CreateOrderPayload,
  CreateOrderPayloadServices,
} from "./CreateOrderPayload";
import { Offer, OfferAvailableServiceBaggage } from "./Offer";
import { SeatMap } from "./SeatMap";

export type DuffelAncillariesProps =
  | DuffelAncillariesPropsWithOfferIdForFixture
  | DuffelAncillariesPropsWithClientKeyAndOfferId
  | DuffelAncillariesPropWithOfferAndClientKey
  | DuffelAncillariesPropsWithOffersAndSeatMaps;

export interface DuffelAncillariesPropsWithOfferIdForFixture
  extends DuffelAncillariesCommonProps {
  offer_id: `fixture_${string}`;
}

export interface DuffelAncillariesPropsWithClientKeyAndOfferId
  extends DuffelAncillariesCommonProps {
  offer_id: string;
  client_key: string;
}

export interface DuffelAncillariesPropWithOfferAndClientKey
  extends DuffelAncillariesCommonProps {
  offer: Offer;
  client_key: string;
}

export interface DuffelAncillariesPropsWithOffersAndSeatMaps
  extends DuffelAncillariesCommonProps {
  offer: Offer;
  seat_maps: SeatMap[];
}

export interface DuffelAncillariesPriceFormatters {
  bags?: (
    amount: string,
    currency: string,
    service: OfferAvailableServiceBaggage
  ) => { amount: string; currency: string };
}

export interface DuffelAncillariesCommonProps {
  styles?: CustomStyles;
  onPayloadReady: OnPayloadReady;
  passengers: CreateOrderPayload["passengers"];
  services: Ancillaries[];
  priceFormatters?: DuffelAncillariesPriceFormatters;
}

export interface CustomStyles {
  accentColor: string;
  buttonCornerRadius: string;
  fontFamily: string;
}

export type OnPayloadReady = (
  data: CreateOrderPayload,
  metadata: OnPayloadReadyMetadata
) => void;

export interface OnPayloadReadyMetadata {
  offer_total_amount: Offer["total_amount"];
  offer_total_currency: Offer["total_currency"];
  offer_tax_amount: Offer["tax_amount"];
  offer_tax_currency: Offer["tax_currency"];

  baggage_services: CreateOrderPayloadServices;
  seat_services: CreateOrderPayloadServices;
}

const bags = "bags" as const;
const seats = "seats" as const;
export type Ancillaries = typeof bags | typeof seats;
