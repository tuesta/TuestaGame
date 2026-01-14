import type { CircularArray } from "./circularArray";

export type VerticalReading = {
    magnitud: number, // vertical
    timestamp: number,
}

export type HorizontalReading = {
    magnitud: number,
    timestamp: number,
}

export type DimensionReading = {
    magnitud: number,
    timestamp: number,
}

export type PatternV
    = {type: "UPWARD"  , range: CircularArray<VerticalReading>, peak_index: number}
    | {type: "DOWNWARD", range: CircularArray<VerticalReading>, peak_index: number}
    | {type: "STABLE"  , range: CircularArray<VerticalReading>}

export type PatternH
    = {type: "LEFTWARD" , range: CircularArray<HorizontalReading>, peak_index: number}
    | {type: "RIGHTWARD", range: CircularArray<HorizontalReading>, peak_index: number}
    | {type: "CENTRAL"  , range: CircularArray<HorizontalReading>}
