import * as B from "@babylonjs/core";

type Movement
    = {type: "left"}
    | {type: "right"}
    | {type: "up"}
    | {type: "down"}

function clamp(min: number, max: number, value: number): number {
    return min > value ? min : (max < value ? max : value);
}

function closer(delta: number, origin: number, target: number): { direction: number, position: number } {
    const direction = Math.sign(target - origin);
    const newOrigin = (direction * delta) + origin;

    let position;
    switch (direction) {
        case -1:
            position = Math.max(target, newOrigin);
            break;
        case 1:
            position = Math.min(target, newOrigin);
            break;
        default:
            position = target;
            break;
    }
    
    return { direction, position };
}

export class PlayerFPCamera extends B.TransformNode {
    public camera: B.TargetCamera;
    public collider : B.Mesh;

    private static readonly HEIGHT: number = 1.6
    private static readonly WIDTH: number = 0.8
    private static readonly LATERALSPEED: number = 3

    private positionTarget: B.Vector3 = new B.Vector3(0, PlayerFPCamera.HEIGHT/2, 0);
    private duckingTarget: number = PlayerFPCamera.HEIGHT/2;
    private isDucking: boolean = false;
    private jumping: { isRising: boolean, isFalling: boolean} =
        { isRising: false
        , isFalling: false
        }
    private blockMovement: boolean = false;

    constructor(scene: B.Scene) {
        super("plaeryFPC", scene);

        this.position = new B.Vector3(0, PlayerFPCamera.HEIGHT/2, 0);

        this.camera = new B.TargetCamera(
            "playerCamera",
            new B.Vector3(0, PlayerFPCamera.HEIGHT/2, 0),
            scene
        );
        this.camera.parent = this;
        this.camera.minZ = 0.05;
        this.camera.maxZ = 50;
        this.camera.setTarget(new B.Vector3(0, PlayerFPCamera.HEIGHT - 4, -10));
        scene.activeCamera = this.camera;

        this.collider = B.MeshBuilder.CreateCapsule(
            "playerCollider",
            { height: PlayerFPCamera.HEIGHT
            , radius: PlayerFPCamera.WIDTH/2
            , orientation: B.Vector3.Up()
            },
            scene
        );
        this.collider.parent = this;
        this.collider.isVisible = false;
        this.collider.checkCollisions = true;
    }

    public handleMovement(mv: Movement) {
        switch (mv.type) {
            case "left":
                this.positionTarget.x = clamp(-1, 1, this.positionTarget.x + 1);
                return;
            case "right":
                this.positionTarget.x = clamp(-1, 1, this.positionTarget.x - 1);
                return;
            case "up":
                if (this.position.y === PlayerFPCamera.HEIGHT/2) {
                    this.positionTarget.y = clamp(PlayerFPCamera.HEIGHT/2, 3.5 + PlayerFPCamera.HEIGHT/2, this.positionTarget.y + 3.5);
                    this.collider.setAbsolutePosition(this.positionTarget)
                    this.collider.position.x = 0;
                    this.jumping.isRising = true;
                    return;
                } else {
                    this.duckingTarget = PlayerFPCamera.HEIGHT/2;
                    this.collider.scaling.y = 1;
                    this.isDucking = true;
                    return;
                }
            case "down":
                this.duckingTarget = (PlayerFPCamera.HEIGHT - 1) / 2;
                this.collider.scaling.y = (PlayerFPCamera.HEIGHT - 1) / PlayerFPCamera.HEIGHT;
                this.isDucking = true;
                return;
        }
    }

    public updateAnimation(deltaTime: number) {
        if (this.positionTarget.x !== this.position.x || this.jumping.isFalling || this.jumping.isRising || this.isDucking) {
            this.blockMovement = true;
        } else {
            this.blockMovement = false;
        }

        if (this.isDucking) {
            let cameraDucking = closer(PlayerFPCamera.LATERALSPEED * deltaTime, this.position.y, this.duckingTarget);
            this.position.y = cameraDucking.position
            this.camera.position.y = cameraDucking.position

            if (cameraDucking.direction === 0) {this.isDucking = false;}
        }

        if (!this.blockMovement) {return;}

        const forceLateral = (0.1 + Math.abs(this.position.x - this.positionTarget.x)) * 12
        const sliding = closer(forceLateral* deltaTime, this.position.x, this.positionTarget.x);
        this.position.x = sliding.position;
        if (sliding.direction === 0) {this.collider.position.y = 0;}
        else {
            this.collider.setAbsolutePosition(this.positionTarget)
            this.collider.position.y = 0;
        }

        if (this.jumping.isRising) {
            const forceUp = ((0.7 + this.positionTarget.y - this.position.y) / 3.5) * 15
            const rising = closer(forceUp * deltaTime, this.position.y, this.positionTarget.y);
            if (rising.direction === 0) {
                this.jumping.isRising = false;
                this.jumping.isFalling = true;
                this.positionTarget.y = PlayerFPCamera.HEIGHT/2;
                this.position.y = rising.position;
                this.collider.position.y = 0
            } else {
                this.collider.setAbsolutePosition(this.positionTarget)
                this.collider.position.x = 0
            }
            this.position.y = rising.position;
        } else if (this.jumping.isFalling) {
            const gravity = (1.3 - (this.position.y - this.positionTarget.y) / 3.5) * 13
            let falling = closer(gravity * deltaTime, this.position.y, this.positionTarget.y);
            if (falling.direction === 0) {
                this.jumping.isFalling = false;
            }
            this.position.y = falling.position;
        }
    }

    public updateMovement(kbInfo: B.KeyboardInfo) {
        if (kbInfo.type !== B.KeyboardEventTypes.KEYDOWN || this.blockMovement) {return;}

        switch (kbInfo.event.key.toLowerCase()) {
            case 'arrowleft':
            case 'a':
                this.handleMovement({type: "left"})
                break;
            case 'arrowright':
            case 'd':
                this.handleMovement({type: "right"})
                break;
            case 'arrowup':
            case 'w':
                this.handleMovement({type: "up"})
                break;
            case 'arrowdown':
            case 's':
                this.handleMovement({type: "down"})
                break;
        }
    }

    public checkCollisionWithObstacles(obstacles: B.Mesh[]): boolean {
        for (const obstacle of obstacles) {
            if (this.collider.intersectsMesh(obstacle, false)) {
                console.log("died");
                return true;
            }
        }
        return false;
    }
}
