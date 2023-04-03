import { captureErrorInSentry } from "@lib/captureErrorInSentry";
import React from "react";
import { Button } from "./Button";
import { NonIdealState } from "./NonIdealState";

export class ErrorBoundary extends React.Component<{
  children: React.ReactNode | React.ReactNode[];
}> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    // Update state so the next render will show the fallback UI.
    return { hasError: true };
  }

  componentDidCatch(error: Error, context: Record<any, any>) {
    // You can also log the error to an error reporting service
    captureErrorInSentry(error, context);
  }

  render() {
    if (this.state.hasError) {
      return (
        <NonIdealState>
          <p style={{ marginBlock: "0" }} className="p1--semibold">
            We ran into an error
          </p>
          <p
            className="p1--regular"
            style={{
              color: "var(--GREY-600)",
              marginBlock: "12px",
              textAlign: "center",
            }}
          >
            Please try reloading. If the problem persists you can try again
            later or add seats and bags after you’ve made the booking.
          </p>
          <div>
            <Button
              text="Try again"
              intent="INVISIBLE"
              onClick={() => location.reload()}
              iconBefore="autorenew"
            />
          </div>
        </NonIdealState>
      );
    }

    return this.props.children;
  }
}
