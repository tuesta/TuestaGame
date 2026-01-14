import { CircularArray } from "./circularArray";
import { detectDown, detectJump, detectLeft, detectRight, detectStanding, type Position } from "./detector";
import type { PatternV, PatternH, VerticalReading, HorizontalReading } from "./pattern";

import * as API from "./../apiType"

function between(x: number, min: number, max: number) {
    return x >= min && x <= max;
}

type SensorReadings = {
    x: number, // vertical
    y: number, // horizontal
    z: number,
    timestamp: number,
}

// Law: Contiguous patterns are different
// forall (cl :: Classifier) (i :: Int).
//   0 <= i < cl.patterns.length() - 1 =>
//     cl.patterns[i].type /== cl.patterns[i + 1].type
export class Classifier {
    private position: Position;

    private currentPatternV: PatternV;
    private patternsV: CircularArray<PatternV>;
    private cooldown_jump: {lastJump: number, timer_standing: number} = {
        lastJump: Number.MIN_SAFE_INTEGER,
        timer_standing: 1000,
    }
    private cooldown_down: {lastDown: number, timer_stand: number} = {
        lastDown: Number.MIN_SAFE_INTEGER,
        timer_stand: 700,
    }
    private cooldown_stand: {lastStand: number, timer_jump: number, timer_down: number} = {
        lastStand: Number.MIN_SAFE_INTEGER,
        timer_jump : 400,
        timer_down: 1000,
    }
    private static readonly THRESHOLD_V = {
        POSITIVE: 5,
        NEGATIVE: -3,
    }
    private cooldown_horizontal: {lastHorizontal: number, timer_horizontal: number} = {
        lastHorizontal: Number.MIN_SAFE_INTEGER,
        timer_horizontal: 400,
    }

    private currentPatternH: PatternH;
    private patternsH: CircularArray<PatternH>;
    private static readonly THRESHOLD_H = {
        POSITIVE: 2,
        NEGATIVE: -2,
    }

    constructor() {
        this.patternsV = new CircularArray(20);
        this.position = "STANDING";
        this.currentPatternV = {type: "STABLE", range: new CircularArray(20)};

        this.patternsH = new CircularArray(20);
        this.currentPatternH = {type: "CENTRAL", range: new CircularArray(20)};
    }

    public classifier(readings: SensorReadings): API.MobileMessage | null{
        const v_reading: VerticalReading = {magnitud: readings.x, timestamp: readings.timestamp};
        const h_reading: VerticalReading = {magnitud: readings.y, timestamp: readings.timestamp};

        this.classifier_vertical(v_reading);
        this.classifier_horizantal(h_reading);

        switch (this.position) {
            case "STANDING":
                if (v_reading.timestamp - this.cooldown_jump.lastJump <= this.cooldown_jump.timer_standing) {return null;}

                if (v_reading.timestamp - this.cooldown_stand.lastStand > this.cooldown_stand.timer_down) {
                    if (h_reading.timestamp - this.cooldown_horizontal.lastHorizontal > this.cooldown_horizontal.timer_horizontal) {
                        const isLeft = detectLeft(this.patternsH, this.currentPatternH);
                        const isRight = detectRight(this.patternsH, this.currentPatternH);

                        if (isLeft || isRight) {
                            this.cooldown_horizontal.lastHorizontal = h_reading.timestamp;
                            return isLeft ? API.MobileMessage.Left : API.MobileMessage.Right;
                        }
                    }

                    const isJumping = detectJump(this.patternsV, this.currentPatternV);
                    if (isJumping) {
                        this.cooldown_jump.lastJump = v_reading.timestamp;
                        return API.MobileMessage.Up;
                    }
                }

                if (v_reading.timestamp - this.cooldown_stand.lastStand > this.cooldown_stand.timer_down) {
                    const isSquatting = detectDown(this.patternsV, this.currentPatternV);
                    if (isSquatting) {
                        this.position = "SQUATTING"
                        this.cooldown_down.lastDown = v_reading.timestamp;
                        return API.MobileMessage.Down;
                    }
                }

                break;
            case "SQUATTING":
                if (v_reading.timestamp - this.cooldown_down.lastDown > this.cooldown_down.timer_stand) {
                    const isStanding = detectStanding(this.patternsV, this.currentPatternV);
                    if (isStanding) {
                        this.position = "STANDING"
                        this.cooldown_stand.lastStand = v_reading.timestamp;
                        return API.MobileMessage.Up;
                    }
                }
                break;
        }

        return null;
    }

    public classifier_vertical(v_reading: VerticalReading) {
        switch (this.currentPatternV.type) {
            case "STABLE":
                if (!between(v_reading.magnitud, Classifier.THRESHOLD_V.NEGATIVE, Classifier.THRESHOLD_V.POSITIVE)) {
                    this.patternsV.insert(this.currentPatternV)

                    this.currentPatternV
                        = v_reading.magnitud < Classifier.THRESHOLD_V.NEGATIVE
                        ? {type: "DOWNWARD", range: new CircularArray(20, v_reading), peak_index: 0}
                        : {type: "UPWARD"  , range: new CircularArray(20, v_reading), peak_index: 0}
                } else {
                    this.currentPatternV.range.insert(v_reading);
                }
                break;
            case "UPWARD":
                if (v_reading.magnitud <= Classifier.THRESHOLD_V.POSITIVE) {
                    this.patternsV.insert(this.currentPatternV)

                    this.currentPatternV
                        = v_reading.magnitud <= Classifier.THRESHOLD_V.NEGATIVE
                        ? {type: "DOWNWARD", range: new CircularArray(20, v_reading), peak_index: 0}
                        : {type: "STABLE", range: new CircularArray(20, v_reading)}
                } else {
                    const peak = this.currentPatternV.range.getAt(this.currentPatternV.peak_index).magnitud

                    if (peak < v_reading.magnitud) {
                        this.currentPatternV.peak_index = this.currentPatternV.range.length() - 1;
                    }

                    this.currentPatternV.range.insert(v_reading);
                }
                break;
            case "DOWNWARD":
                if (v_reading.magnitud >= Classifier.THRESHOLD_V.NEGATIVE) {
                    this.patternsV.insert(this.currentPatternV)

                    this.currentPatternV
                        = v_reading.magnitud >= Classifier.THRESHOLD_V.POSITIVE
                        ? {type: "UPWARD"  , range: new CircularArray(20, v_reading), peak_index: 0}
                        : {type: "STABLE", range: new CircularArray(20, v_reading)}
                } else {
                    const peak = this.currentPatternV.range.getAt(this.currentPatternV.peak_index).magnitud

                    if (peak > v_reading.magnitud) {
                        this.currentPatternV.peak_index = this.currentPatternV.range.length() - 1;
                    }

                    this.currentPatternV.range.insert(v_reading);
                }
                break;
        }

    }

    // Derecha negativo
    // izquierda positivo
    public classifier_horizantal(h_reading: HorizontalReading) {
        switch (this.currentPatternH.type) {
            case "CENTRAL":
                if (!between(h_reading.magnitud, Classifier.THRESHOLD_H.NEGATIVE, Classifier.THRESHOLD_H.POSITIVE)) {
                    this.patternsH.insert(this.currentPatternH)

                    this.currentPatternH
                    = h_reading.magnitud <= Classifier.THRESHOLD_H.NEGATIVE
                    ? {type: "RIGHTWARD", range: new CircularArray(20, h_reading), peak_index: 0}
                    : {type: "LEFTWARD" , range: new CircularArray(20, h_reading), peak_index: 0}
                } else {
                    this.currentPatternH.range.insert(h_reading)
                }
                break;
            case "LEFTWARD":
                if (h_reading.magnitud <= Classifier.THRESHOLD_H.POSITIVE) {
                    this.patternsH.insert(this.currentPatternH)

                    this.currentPatternH
                        = h_reading.magnitud <= Classifier.THRESHOLD_V.NEGATIVE
                        ? {type: "RIGHTWARD", range: new CircularArray(20, h_reading), peak_index: 0}
                        : {type: "CENTRAL"  , range: new CircularArray(20, h_reading)}
                } else {
                    const peak = this.currentPatternH.range.getAt(this.currentPatternH.peak_index).magnitud;

                    if (peak < h_reading.magnitud) {
                        this.currentPatternH.peak_index = this.currentPatternH.range.length() - 1;
                    }

                    this.currentPatternH.range.insert(h_reading);
                }
                break;
            case "RIGHTWARD":
                if (h_reading.magnitud >= Classifier.THRESHOLD_H.NEGATIVE) {
                    this.patternsH.insert(this.currentPatternH)

                    this.currentPatternH
                        = h_reading.magnitud >= Classifier.THRESHOLD_V.POSITIVE
                        ? {type: "LEFTWARD", range: new CircularArray(20, h_reading), peak_index: 0}
                        : {type: "CENTRAL"  , range: new CircularArray(20, h_reading)}
                } else {
                    const peak = this.currentPatternH.range.getAt(this.currentPatternH.peak_index).magnitud;

                    if (peak > h_reading.magnitud) {
                        this.currentPatternH.peak_index = this.currentPatternH.range.length() - 1;
                    }

                    this.currentPatternH.range.insert(h_reading);
                }
                break;
        }
    }
}
