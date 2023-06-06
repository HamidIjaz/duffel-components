import { compileCreateOrderPayload } from "@lib/compileCreateOrderPayload";
import { createPriceFormatters } from "@lib/createPriceFormatters";
import { formatAvailableServices } from "@lib/formatAvailableServices";
import { formatSeatMaps } from "@lib/formatSeatMaps";
import { isPayloadComplete } from "@lib/isPayloadComplete";
import { offerIsExpired } from "@lib/offerIsExpired";
import { retrieveOffer } from "@lib/retrieveOffer";
import { retrieveSeatMaps } from "@lib/retrieveSeatMaps";
import {
  areDuffelAncillariesPropsValid,
  isDuffelAncillariesPropsWithClientKeyAndOfferId,
  isDuffelAncillariesPropsWithOfferAndClientKey,
  isDuffelAncillariesPropsWithOfferAndSeatMaps,
  isDuffelAncillariesPropsWithOfferIdForFixture,
} from "@lib/validateProps";
import * as React from "react";
import {
  CreateOrderPayloadPassengers,
  CreateOrderPayloadService,
} from "../types/CreateOrderPayload";
import { DuffelAncillariesProps } from "../types/DuffelAncillariesProps";
import { Offer } from "../types/Offer";
import { SeatMap } from "../types/SeatMap";
import { ErrorBoundary } from "./ErrorBoundary";
import { FetchOfferErrorState } from "./FetchOfferErrorState";
import { Inspect } from "./Inspect";
import { BaggageSelectionCard } from "./bags/BaggageSelectionCard";
import { CfarSelectionCard } from "./cancel_for_any_reason/CfarSelectionCard";
import { SeatSelectionCard } from "./seats/SeatSelectionCard";

const COMPONENT_CDN = process.env.COMPONENT_CDN || "";
const hrefToComponentStyles = `${COMPONENT_CDN}/global.css`;

export const DuffelAncillaries: React.FC<DuffelAncillariesProps> = (props) => {
  if (!areDuffelAncillariesPropsValid(props)) {
    throw new Error(
      `The props (${Object.keys(
        props
      )}) passed to DuffelAncillaries are invalid. ` +
        "`onPayloadReady`, `passengers` and `services` are always required. " +
        "Then, depending on your use case you may have one of the following combinations of required props: " +
        "`offer_id` and `client_key`, `offer` and `seat_maps` or `offer` and `client_key`." +
        "Please refer to the documentation for more information and working examples: " +
        "https://duffel.com/docs/guides/ancillaries-component"
    );
  }
  if (props.services.length === 0) {
    throw new Error(
      `You must provide at least one service in the "services" prop. Valid services: ["bags", "seats"]`
    );
  }

  const isPropsWithOfferIdForFixture =
    isDuffelAncillariesPropsWithOfferIdForFixture(props);

  const isPropsWithClientKeyAndOfferId =
    isDuffelAncillariesPropsWithClientKeyAndOfferId(props);

  const isPropsWithOfferAndSeatMaps =
    isDuffelAncillariesPropsWithOfferAndSeatMaps(props);

  const isPropsWithOfferAndClientKey =
    isDuffelAncillariesPropsWithOfferAndClientKey(props);

  const shouldRetrieveSeatMaps =
    props.services.includes("seats") &&
    !("seat_maps" in props) &&
    (isPropsWithOfferIdForFixture ||
      isPropsWithClientKeyAndOfferId ||
      isPropsWithOfferAndClientKey);

  const [passengers, setPassengers] =
    React.useState<CreateOrderPayloadPassengers>(props.passengers);

  const [offer, setOffer] = React.useState<Offer | undefined>(
    (props as any).offer
  );

  const [isOfferLoading, setIsOfferLoading] = React.useState(
    isPropsWithClientKeyAndOfferId
  );

  const [seatMaps, setSeatMaps] = React.useState<SeatMap[] | undefined>(
    isPropsWithOfferAndSeatMaps ? props.seat_maps : undefined
  );
  const [isSeatMapLoading, setIsSeatMapLoading] = React.useState(
    shouldRetrieveSeatMaps
  );

  const [error, setError] = React.useState<null | string>(null);

  const [baggageSelectedServices, setBaggageSelectedServices] = React.useState(
    new Array<CreateOrderPayloadService>()
  );
  const [seatSelectedServices, setSeatSelectedServices] = React.useState(
    new Array<CreateOrderPayloadService>()
  );
  const [cfarSelectedServices, setCfarSelectedServices] = React.useState(
    new Array<CreateOrderPayloadService>()
  );

  const priceFormatters = createPriceFormatters(
    props.markup,
    props.priceFormatters
  );

  const updateOffer = (offer: Offer) => {
    const expiryErrorMessage = "This offer has expired.";
    if (offerIsExpired(offer)) {
      setError(expiryErrorMessage);
      return;
    } else {
      const msUntilExpiry = new Date(offer.expires_at).getTime() - Date.now();

      // Only show the expiry error message if the offer expires in less than a day,
      // to prevent buffer overflows when showing offers for fixtures, which expire in
      // years.
      const milisecondsInOneDay = 1000 * 60 * 60 * 24;
      if (msUntilExpiry < milisecondsInOneDay) {
        setTimeout(() => setError(expiryErrorMessage), msUntilExpiry);
      }
    }

    const offerWithFormattedServices = formatAvailableServices(
      offer,
      priceFormatters
    );
    setOffer(offerWithFormattedServices);
  };

  const updateSeatMaps = (seatMaps: SeatMap[]) => {
    const formattedSeatMaps = formatSeatMaps(seatMaps, priceFormatters.seats);
    setSeatMaps(formattedSeatMaps);
  };

  React.useEffect(() => {
    if (isPropsWithClientKeyAndOfferId || isPropsWithOfferIdForFixture) {
      retrieveOffer(
        props.offer_id,
        !isPropsWithOfferIdForFixture ? props.client_key : null,
        setError,
        setIsOfferLoading,
        (offer) => {
          updateOffer(offer);

          if (offer.passengers.length !== passengers.length) {
            throw new Error(
              `The number of passengers given to \`duffel-ancillaries\` (${props.passengers.length}) doesn't match ` +
                `the number of passengers on the given offer (${offer.passengers.length}).`
            );
          }

          if (isPropsWithOfferIdForFixture) {
            // There's no way the component users will know the passenger IDs for the fixture offer
            // so we'll need to add them here
            setPassengers(
              props.passengers.map((passenger, index) => ({
                ...passenger,
                id: offer.passengers[index].id,
              }))
            );
          }
        }
      );
    }

    if (shouldRetrieveSeatMaps) {
      retrieveSeatMaps(
        isPropsWithClientKeyAndOfferId || isPropsWithOfferIdForFixture
          ? props.offer_id
          : props.offer.id,
        !isPropsWithOfferIdForFixture ? props.client_key : null,
        setError,
        setIsSeatMapLoading,
        updateSeatMaps
      );
    }

    if (isPropsWithOfferAndClientKey) {
      updateOffer(props.offer);
    }

    if (isPropsWithOfferAndSeatMaps) {
      updateOffer(props.offer);
      updateSeatMaps(props.seat_maps);
    }
  }, [
    // `as any` is needed here because the list
    // of dependencies is different for each combination of props.
    // To satisfy typescript, we'd need to conditionally assign
    // the dependencies to the hook after checking its type,
    // however that is not possible in a react hook.
    (props as any).offer_id,
    (props as any).client_key,
    (props as any).offer?.id,
    (props as any).seat_maps?.[0]?.id,
  ]);

  React.useEffect(() => {
    if (!offer) return;

    const createOrderPayload = compileCreateOrderPayload({
      baggageSelectedServices,
      seatSelectedServices,
      cfarSelectedServices,
      offer,
      passengers,
      seatMaps,
    });

    if (isPayloadComplete(createOrderPayload)) {
      props.onPayloadReady(createOrderPayload, {
        offer_total_amount: offer.total_amount,
        offer_total_currency: offer.total_currency,
        offer_tax_amount: offer.tax_amount,
        offer_tax_currency: offer.tax_currency,
        baggage_services: baggageSelectedServices,
        seat_services: seatSelectedServices,
        cancel_for_any_reason_services: cfarSelectedServices,
      });
    }
  }, [baggageSelectedServices, seatSelectedServices, cfarSelectedServices]);

  if (!areDuffelAncillariesPropsValid(props)) {
    return null;
  }

  const nonIdealStateHeight = `${
    // 72 (card height) + 32 gap between cards
    72 * props.services.length + 32 * (props.services.length - 1)
  }px`;

  const duffelComponentsStyle = {
    // Adding inline styles here to avoid the cards jumping down
    // before the css is loaded duet to the missing "row gap".
    display: "flex",
    width: "100%",
    flexDirection: "column",
    rowGap: "12px",
    ...(props.styles?.accentColor && {
      "--ACCENT": props.styles.accentColor,
    }),
    ...(props.styles?.fontFamily && {
      "--FONT-FAMILY": props.styles.fontFamily,
    }),
    ...(props.styles?.buttonCornerRadius && {
      "--BUTTON-RADIUS": props.styles.buttonCornerRadius,
    }),
    // `as any` is needed here is needed because we want to set css variables
    // that are not part of the css properties type
  } as any;

  return (
    <>
      <link rel="stylesheet" href={hrefToComponentStyles}></link>

      <div className="duffel-components" style={duffelComponentsStyle}>
        <ErrorBoundary>
          {location.hash.includes("inspect-duffel-ancillaries") && (
            <Inspect
              props={props}
              state={{
                isOfferLoading,
                isSeatMapLoading,
                baggageSelectedServices,
                seatSelectedServices,
                cfarSelectedServices,
                offer,
                seatMaps,
                error,
              }}
            />
          )}

          {error && (
            <FetchOfferErrorState
              height={nonIdealStateHeight}
              message={error}
            />
          )}

          {!error &&
            props.services.map((ancillaryName) => {
              if (ancillaryName === "bags")
                return (
                  <BaggageSelectionCard
                    key="bags"
                    isLoading={isOfferLoading}
                    offer={offer}
                    passengers={passengers}
                    selectedServices={baggageSelectedServices}
                    setSelectedServices={setBaggageSelectedServices}
                  />
                );

              if (ancillaryName === "seats")
                return (
                  <SeatSelectionCard
                    key="seats"
                    isLoading={isOfferLoading || isSeatMapLoading}
                    seatMaps={seatMaps}
                    offer={offer}
                    passengers={passengers}
                    selectedServices={seatSelectedServices}
                    setSelectedServices={setSeatSelectedServices}
                  />
                );

              if (ancillaryName === "cancel_for_any_reason")
                return (
                  <CfarSelectionCard
                    key="cancel_for_any_reason"
                    isLoading={isOfferLoading}
                    offer={offer}
                    selectedServices={cfarSelectedServices}
                    setSelectedServices={setCfarSelectedServices}
                  />
                );
            })}
        </ErrorBoundary>
      </div>
    </>
  );
};
