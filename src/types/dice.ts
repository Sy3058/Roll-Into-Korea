export interface DiceProps {
  autoSpin?: boolean; // optional
  scale?: [number, number, number];
}

export interface DiceEmits {
  (e: 'roll-complete', value: number): void;
  (e: 'click', event?: Event): void;
}

// Helper to define the Rotation Map cleanly
export type RotationMap = Record<number, { x: number; y: number }>;
