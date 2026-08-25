import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';

import { protectTelemetryEvent } from './telemetryPrivacy';

export const FlowboardTelemetry = () => (
  <>
    <Analytics beforeSend={protectTelemetryEvent} />
    <SpeedInsights beforeSend={protectTelemetryEvent} />
  </>
);

export default FlowboardTelemetry;
