import type { CircularArray } from "./circularArray";
import type { DimensionReading, PatternV, VerticalReading, PatternH } from "./pattern";

export type Position = "STANDING" | "SQUATTING"


export function detectJump(patterns : CircularArray<PatternV>, current: PatternV): boolean {
    if (current.type !== "DOWNWARD") {return false;}

    const lasts = patterns.getLasts(3);
    if (lasts.length < 2) {return false;}
    const [last0, last1] = lasts

    let deceleration: Array<VerticalReading>;
    let aceleration: Array<VerticalReading>;
    let peak_aceleration: VerticalReading;
    let peakIndex_aceleration: number;
    if (last0.type === "STABLE" && last1.type === "UPWARD") {
        const last0_duration = last0.range.getLast().timestamp - last0.range.getFirst().timestamp;
        if (last0_duration > 100) return false;

        deceleration = current.range.getLasts().concat(last0.range.getLasts());
        aceleration = last1.range.getLasts();
        peakIndex_aceleration = last1.peak_index;
        peak_aceleration = aceleration[peakIndex_aceleration];
    } else if (last0.type === "UPWARD") {
        deceleration = current.range.getLasts();
        aceleration = last0.range.getLasts();
        peakIndex_aceleration = last0.peak_index;
        peak_aceleration = aceleration[peakIndex_aceleration];
    } else {return false;}

    if (aceleration.length < 2) {return false}
    const duration_aceleration = aceleration[0].timestamp - aceleration[aceleration.length - 1].timestamp;

    const velocityDecay = calculateVelocityChange(aceleration, peakIndex_aceleration, 0)
    const velocity = calculateVelocityChange(aceleration, aceleration.length - 1, 0)

    // console.log(peak_aceleration, velocityDecay, velocity, duration_aceleration)
    // TODO magic number
    if ( peak_aceleration.magnitud < 11
      || !velocity || !velocityDecay
      || velocityDecay < 0.15 || velocityDecay > 3
      || velocity < 1.3
      || duration_aceleration < 30
      || duration_aceleration > 300
       ) {return false;}

    // console.log("jump")

    return true;
}

export function detectDown(patterns: CircularArray<PatternV>, current: PatternV): boolean {
    if (current.type !== "UPWARD") {return false;}

    const lasts = patterns.getLasts(2);
    if (lasts.length !== 2) {return false;}

    const [last0, last1] = lasts
    let deceleration: Array<VerticalReading>;
    let aceleration: Array<VerticalReading>;
    let peakIndex_deceleration: number;
    let peak_deceleration: VerticalReading;
    if (last0.type === "STABLE" && last1.type === "DOWNWARD") {

        deceleration = last1.range.getLasts();
        aceleration = current.range.getLasts().concat(last0.range.getLasts());
        peakIndex_deceleration = last1.peak_index;
        peak_deceleration = deceleration[peakIndex_deceleration];
    } else if (last0.type === "DOWNWARD") {
        deceleration = last0.range.getLasts();
        aceleration = current.range.getLasts();
        peakIndex_deceleration = last0.peak_index;
        peak_deceleration = deceleration[peakIndex_deceleration];
    } else {return false;}


    if (deceleration.length < 2) {return false}
    const duration_deceleration = deceleration[0].timestamp - deceleration[deceleration.length - 1].timestamp;

    const velocityDecay = calculateVelocityChange(deceleration, peakIndex_deceleration, 0)
    const velocity = calculateVelocityChange(deceleration, deceleration.length - 1, 0)
    const movement = velocity === null ? -100 : velocity * duration_deceleration

    console.log(peak_deceleration.magnitud, velocityDecay, velocity, movement, duration_deceleration)
    if ( peak_deceleration.magnitud > -4 || peak_deceleration.magnitud < -18
      || !velocity || !velocityDecay
      || velocityDecay > -0.15 || velocityDecay < -1.5
      || velocity > -1 || velocity < -2.4
      || movement > -100/*-250*/ || movement < -500
      || duration_deceleration < 150
      || duration_deceleration > 400
       ) {return false}

    console.log("DOWN")

    return true;
}

export function detectStanding(patterns : CircularArray<PatternV>, current: PatternV): boolean {
    if (current.type !== "DOWNWARD") {return false;}

    const lasts = patterns.getLasts(2);
    if (lasts.length !== 2) {return false;}

    const [last0, last1] = lasts

    let deceleration: Array<VerticalReading>;
    let aceleration: Array<VerticalReading>;
    let peakIndex_aceleration: number;
    let peak_aceleration: VerticalReading;
    if (last0.type === "STABLE" && last1.type === "UPWARD") {
        const last0_duration = last1.range.getFirst().timestamp - last0.range.getLast().timestamp;
        if (last0_duration > 150) return false;

        deceleration = current.range.getLasts().concat(last0.range.getLasts());
        aceleration = last1.range.getLasts();
        peakIndex_aceleration = last1.peak_index;
        peak_aceleration = aceleration[peakIndex_aceleration];
    } else if (last0.type === "UPWARD") {
        deceleration = current.range.getLasts();
        aceleration = last0.range.getLasts();
        peakIndex_aceleration = last0.peak_index;
        peak_aceleration = aceleration[peakIndex_aceleration];
    } else {return false;}

    if (aceleration.length < 2) {return false}

    const duration_aceleration = aceleration[0].timestamp - aceleration[aceleration.length - 1].timestamp;

    const velocityDecay = calculateVelocityChange(aceleration, peakIndex_aceleration, 0) || 0;

    // console.log(peak_aceleration.magnitud, velocityDecay, duration_aceleration)
    if ( peak_aceleration.magnitud < 4 || peak_aceleration.magnitud > 12
      || velocityDecay < 0 || velocityDecay > 1
      || duration_aceleration > 300
       ) {return false;}

    // console.log("DOWN-UP")

    return true;
}

export function detectLeft(patterns: CircularArray<PatternH>, current: PatternH): boolean {
    if (current.type !== "RIGHTWARD") {return false;}

    const lasts = patterns.getLasts(3);
    if (lasts.length < 2) {return false;}
    const [last0, last1] = lasts

    let deceleration: Array<VerticalReading>;
    let aceleration: Array<VerticalReading>;
    let peak_aceleration: VerticalReading;
    let peakIndex_aceleration: number;
    if (last0.type === "CENTRAL" && last1.type === "LEFTWARD") {
        const last0_duration = last0.range.getLast().timestamp - last0.range.getFirst().timestamp;
        if (last0_duration > 50) {return false};

        deceleration = current.range.getLasts().concat(last0.range.getLasts());
        aceleration = last1.range.getLasts();
        peakIndex_aceleration = last1.peak_index;
        peak_aceleration = aceleration[peakIndex_aceleration];
    } else if (last0.type === "RIGHTWARD") {
        deceleration = current.range.getLasts();
        aceleration = last0.range.getLasts();
        peakIndex_aceleration = last0.peak_index;
        peak_aceleration = aceleration[peakIndex_aceleration];
    } else {return false;}

    if (aceleration.length < 2) {return false}
    const duration_aceleration = aceleration[0].timestamp - aceleration[aceleration.length - 1].timestamp;
    const velocity = calculateVelocityChange(aceleration, aceleration.length - 1, 0)

    let total = 0;
    aceleration.forEach(a => {
        total += a.magnitud;
    })
    const avg_aceleration = total/aceleration.length

    if (velocity === null) {return false; }

    // console.log(velocity, velocity * duration_aceleration, duration_aceleration, avg_aceleration)
    if ( velocity > 2 || velocity < 0.3
      || velocity * duration_aceleration >= 350 || velocity * duration_aceleration <= 0 
      || duration_aceleration < 30 || duration_aceleration > 350
      || avg_aceleration < 2 || avg_aceleration > 10
       ) {return false;}
    // console.log("LEFT")

    return true;
}

export function detectRight(patterns: CircularArray<PatternH>, current: PatternH): boolean {
    if (current.type !== "LEFTWARD") {return false;}

    const lasts = patterns.getLasts(3);
    if (lasts.length < 2) {return false;}
    const [last0, last1, last2] = lasts

    let deceleration: Array<VerticalReading>;
    let aceleration: Array<VerticalReading>;
    let peak_deceleration: VerticalReading;
    let peakIndex_deceleration: number;
    if (last0.type === "CENTRAL" && last1.type === "RIGHTWARD") {
        const last0_duration = last0.range.getLast().timestamp - last0.range.getFirst().timestamp;
        if (last0_duration > 50) {return false};

        deceleration = last1.range.getLasts();
        aceleration = current.range.getLasts().concat(last0.range.getLasts());
        peakIndex_deceleration = last1.peak_index;
        peak_deceleration = deceleration[peakIndex_deceleration];
    } else if (last0.type === "RIGHTWARD") {
        deceleration = last0.range.getLasts();
        aceleration = current.range.getLasts();
        peakIndex_deceleration = last0.peak_index;
        peak_deceleration = deceleration[peakIndex_deceleration];
    } else {return false;}

    if (deceleration.length < 2) {return false}
    const duration_deceleration = deceleration[0].timestamp - deceleration[deceleration.length - 1].timestamp;
    const velocity = calculateVelocityChange(deceleration, deceleration.length - 1, 0)

    let total = 0;
    deceleration.forEach(a => {
        total += a.magnitud;
    })
    const avg_deceleration = total/deceleration.length

    if (velocity === null) { return false; }
    // console.log(velocity, velocity * duration_deceleration, duration_deceleration, avg_deceleration)
    if ( velocity < -2 || velocity > -0.3
      || velocity * duration_deceleration <= -350 || velocity * duration_deceleration >= 0
      || duration_deceleration < 30 || duration_deceleration > 350
      || avg_deceleration > -2 || avg_deceleration < -10
       ) {return false;}
    // console.log("RIGHT")

    return true;
}

function calculateVelocityChange(pattern: Array<DimensionReading>, start: number, end: number): number | null {
    if ( start - end < 1
      || start > pattern.length - 1
      || end < 0
       ) { return null; };

    let velocityChange = 0;
    
    for (let i = start; i > end; i--) {
        const dt = (pattern[i - 1].timestamp - pattern[i].timestamp) / 1000;
        const avgAcceleration = (pattern[i].magnitud + pattern[i-1].magnitud) / 2;
        velocityChange += avgAcceleration * dt;
    }

    return velocityChange;
}
