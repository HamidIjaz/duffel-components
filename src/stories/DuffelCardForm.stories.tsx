import { DuffelCardForm } from "@components/DuffelCardForm/DuffelCardForm";
import { DuffelCardFormProps } from "@components/DuffelCardForm/lib/types";
import type { Meta, StoryObj } from "@storybook/react";

export default {
  title: "DuffelCardForm",
  component: DuffelCardForm,
} as Meta;

type DuffelCardFormStory = StoryObj<typeof DuffelCardForm>;

const defaultProps: DuffelCardFormProps = {
  clientKey:
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbiI6IkVOQ1JZUFRFRF9UT0tFTiJ9.qP-zHSkMn-O9VGSj4wkh_A4VDOIrzpgRxh1xgLZ51rk",
  shouldUseLocalTokenProxy: true,
  actions: ["validate"],
  onValidateSuccess: console.log,
  onValidateFailure: console.error,
  onCreateCardForTemporaryUseSuccess: console.log,
  onCreateCardForTemporaryUseFailure: console.error,
};

export const Default: DuffelCardFormStory = { args: defaultProps };

export const WithLinksStyles: DuffelCardFormStory = {
  args: {
    ...defaultProps,
    styles: {
      label: {
        color: "grey",
        "font-size": "12px",
        "font-weight": "500",
        "line-height": "20px",
        display: "inline-block",
        transform: "translate(12px, 11px)",
        "background-color": "white",
        width: "fit-content",
        "padding-inline": "4px",
      },
    },
  },
};
