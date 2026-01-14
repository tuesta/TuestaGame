type SensorReadings = {
    x: number,
    y: number,
    z: number,
    timestamp: number,
}

export class LinearAccelerationSensorManager {
    private sensor: any;
    private isRunning: boolean;
    private frequency: number;

    private onReadingCallback?: (info: SensorReadings) => void
    private onErrorCallback?: (err: any) => void
    private lastReadings: SensorReadings

    constructor(options: {frequency?: number, onReading?: (info: SensorReadings) => void, onError?: (err: any) => void} = {}) {
        this.sensor = null;
        this.isRunning = false;
        this.frequency = options.frequency || 200;
        this.onReadingCallback = options.onReading;
        this.onErrorCallback = options.onError;

        this.lastReadings = {
            x: 0,
            y: 0,
            z: 0,
            timestamp: 0
        };
    }

    private async init() {
        if (!('LinearAccelerationSensor' in window)) {
            throw new Error('LinearAccelerationSensor no disponible');
        }

        await (window.navigator as any).permissions.query({ name: "accelerometer" }).then((result) => {
            if (result.state === "denied") {
                throw new Error('Permisos denegados');
            }

            try {
                this.sensor = new (window as any).LinearAccelerationSensor({ 
                    frequency: this.frequency
                });
            } catch {
                alert("hola")
            }

            this.sensor.addEventListener('reading', () => {
                this.handleReading();
            });

            this.sensor.addEventListener('error', (event: any) => {
                this.handleError(event.error);
            });

            console.log('LinearAccelerationSensorManager inicializado');
        });
    }

    public async start() {
        if (!this.sensor) {
            await this.init();
        }
        if (this.isRunning) {
            return;
        }

        await this.sensor.start();
        this.isRunning = true;
        console.log('Sensor iniciado');
    }

    public stop() {
        if (this.sensor && this.isRunning) {
            this.sensor.stop();
            this.isRunning = false;
            console.log('Sensor detenido');
        }
    }

    private handleReading() {
        if (!this.sensor) return;

        this.lastReadings = {
            x: this.sensor.x || 0,
            y: this.sensor.y || 0,
            z: this.sensor.z || 0,
            timestamp: Date.now()
        };

        if (this.onReadingCallback) {
            this.onReadingCallback(this.lastReadings);
        }
    }

    private handleError(error: any) {
        console.error('Error del sensor:', error);

        if (this.onErrorCallback) {
            this.onErrorCallback(error);
        }
    }

    getAxis(axis: 'x' | 'y' | 'z' | 'timestamp') {
        return this.lastReadings[axis] || 0;
    }

    cleanup() {
        this.stop();
        this.sensor = null;
        this.isRunning = false;
        console.log('Sensor limpiado');
    }
}
