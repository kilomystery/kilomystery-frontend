export type PrizeType = "ZERO" | "HALF" | "ONE" | "TWO" | "RESPIN" | "X2";

export type Segment = {
  type: PrizeType;
  label: string;       // Testo nello spicchio
  valueKg?: number;    // Solo per premi in kg
};

// 16 spicchi: 0×6, 0.5×3, +1spin×2, ×2×2, 1×2, 2×1
export const SEGMENTS: Segment[] = [
  { type: "ZERO",  label: "0" },
  { type: "ZERO",  label: "0" },
  { type: "ZERO",  label: "0" },
  { type: "ZERO",  label: "0" },
  { type: "ZERO",  label: "0" },
  { type: "ZERO",  label: "0" },

  { type: "HALF",  label: "+0.5", valueKg: 0.5 },
  { type: "HALF",  label: "+0.5", valueKg: 0.5 },
  { type: "HALF",  label: "+0.5", valueKg: 0.5 },

  { type: "RESPIN",label: "+1 spin" },
  { type: "RESPIN",label: "+1 spin" },

  { type: "X2",    label: "×2" },
  { type: "X2",    label: "×2" },

  { type: "ONE",   label: "+1", valueKg: 1 },
  { type: "ONE",   label: "+1", valueKg: 1 },

  { type: "TWO",   label: +"+2", valueKg: 2 },
];

export const SEGMENT_ANGLE = 360 / SEGMENTS.length; // 22.5°