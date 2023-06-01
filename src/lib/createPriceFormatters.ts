import {
  DuffelAncillariesMarkup,
  DuffelAncillariesMarkupDefinition,
  DuffelAncillariesPriceFormatters,
} from "src/types/DuffelAncillariesProps";

const convertMarkupIntoPriceFormatter = (
  markup: DuffelAncillariesMarkupDefinition
) => {
  return (amount: number, currency: string) => {
    const { rate, amount: markupAmount } = markup;
    const newAmount = amount * (1 + rate) + markupAmount;
    return { amount: newAmount, currency };
  };
};

const errorMessage =
  "You cannot supply both markup and priceFormatters for the same service.";

/**
 * Creates price formatters from the markup and priceFormatters passed in.
 * Throws an error if both are supplied.
 * If neither are supplied, the priceFormatters will be undefined.
 *
 * @param markup The markup to be applied to the prices of the available services of an offer.
 * @param priceFormatters Price formatters to apply to the prices of the available services of an offer.
 * @returns
 */
const createPriceFormatters = (
  markup?: DuffelAncillariesMarkup,
  priceFormatters?: DuffelAncillariesPriceFormatters
): DuffelAncillariesPriceFormatters => {
  const formatters: DuffelAncillariesPriceFormatters = {};

  if (priceFormatters) {
    if (priceFormatters.bags) {
      formatters.bags = priceFormatters.bags;
    }
    if (priceFormatters.seats) {
      formatters.seats = priceFormatters.seats;
    }
  }

  // Markup takes precedence over priceFormatters.
  if (markup) {
    if (markup.bags) {
      if (priceFormatters && priceFormatters.bags) {
        throw new Error(errorMessage);
      }
      formatters.bags = convertMarkupIntoPriceFormatter(markup.bags);
    }
    if (markup.seats) {
      if (priceFormatters && priceFormatters.seats) {
        throw new Error(errorMessage);
      }
      formatters.seats = convertMarkupIntoPriceFormatter(markup.seats);
    }
  }
  return formatters;
};

export { createPriceFormatters };
