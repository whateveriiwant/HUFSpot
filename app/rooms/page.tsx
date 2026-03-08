'use client';

import { useState } from 'react';
import { RoomFinderWidget } from '@/widgets/room-finder/ui/RoomFinderWidget';
import { DevTimePanel } from '@/features/dev-time-control/ui/DevTimePanel';
import type { DevOverride } from '@/entities/schedule/model/types';

const isDev = process.env.NODE_ENV !== 'production';

export default function RoomsPage() {
  const [devOverride, setDevOverride] = useState<DevOverride | null>(null);

  return (
    <main>
      <RoomFinderWidget devOverride={devOverride} />
      {isDev && (
        <DevTimePanel
          devOverride={devOverride}
          setDevOverride={setDevOverride}
        />
      )}
    </main>
  );
}
