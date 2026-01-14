import * as B from "@babylonjs/core";
import { Obstacle } from "./obstacle";

function randomIntFromInterval(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

const timer = document.getElementById('timer') as HTMLElement;

export class Section extends B.TransformNode {
    private scene: B.Scene;
    private obstacle_material: B.StandardMaterial;
    private counter = 0;
    private counter_show = false;
    private isPlaying: boolean = false;

    private grounds: {
        _1: B.Mesh,
        _2: B.Mesh,
    };
    public obstacles: {
        _1: Obstacle,
        _2: Obstacle,
    };
    private allObstacles: Array<Obstacle> = new Array(13);

    private sectionLength: number;
    private sectionWidth: number;

    public SPEED : number = 0;
    private static readonly GAP: number = 30;

    constructor(scene: B.Scene) {
        super("section", scene);

        this.scene = scene;
        this.sectionLength = 35;
        this.sectionWidth = 3;

        this.position.z = -this.sectionLength;

        this.obstacle_material = new B.StandardMaterial("obstacle_material", this.scene);
        this.obstacle_material.diffuseColor = new B.Color3(0.05, 0, 0);
        this.obstacle_material.emissiveColor = new B.Color3(3, 0.3, 0.3);
        this.obstacle_material.specularColor = new B.Color3(0, 0, 0);
        this.obstacle_material.specularPower = 1;
        this.obstacle_material.disableLighting = false;
        this.obstacle_material.useEmissiveAsIllumination = true;

        this.grounds = {
            _1: this.createGround(),
            _2: this.createGround(),
        }
        this.grounds._2.position.z *= -1;

        for (let i = 0; i <= 12; i++) {
            this.allObstacles[i] = new Obstacle(scene, this.obstacle_material, i);
        }

        const _1 = this.nextObstacle();
        const _2 = this.nextObstacle(_1)
        this.obstacles = {_1, _2}

        this.obstacles._1.obstaclePosition(-Section.GAP);
        this.obstacles._2.obstaclePosition(-Section.GAP * 2);
    }

    private nextObstacle(_1?: Obstacle): Obstacle {
        let i1 = _1 !== undefined ? _1.ix : (this.obstacles && this.obstacles._1.ix) || -1;
        let i2 = (this.obstacles && this.obstacles._2.ix) || -1;

        let i;
        let r;
        while (!i) {
            r = randomIntFromInterval(0, 12);
            if (r !== i1 && r !== i2) {
                i = r;
            }
        }

        return this.allObstacles[i];
    }

    private createGround(): B.Mesh {
        const ground = B.MeshBuilder.CreateGround("ground", {
            width: this.sectionWidth,
            height: this.sectionLength,
            subdivisionsX: 3,
            subdivisionsY: 35,
        }, this.scene);

        ground.parent = this;
        ground.checkCollisions = false;

        ground.material = new B.StandardMaterial("groundMat", this.scene);
        if (ground.material instanceof B.StandardMaterial) {
            ground.material.diffuseColor = new B.Color3(1, 1, 1);
            ground.material.wireframe = true;
            ground.material.emissiveColor = new B.Color3(0, 0, 0);
            ground.material.specularColor = new B.Color3(0, 0, 0);
        }
        ground.material.backFaceCulling = false;

        ground.position = new B.Vector3(0, 0, this.sectionLength/2);

        return ground;
    }

    public updateAnimation(deltaTime: number) {
        if (this.counter > 0) {
            this.counter -= deltaTime;
            timer.style.display = "flex"
            timer.textContent = "" + Math.max(Math.ceil(this.counter), 1);
            (<any>window).isPlaying = false;
        } else {
            if (this.counter_show) {
                timer.style.display = "none"
                this.counter_show = false;
                (<any>window).isPlaying = true;
                this.scene.getEngine().getRenderingCanvas()?.focus();
            }
            this.position.z += deltaTime * this.SPEED;
            this.obstacles._1.position.z += deltaTime * this.SPEED;
            this.obstacles._2.position.z += deltaTime * this.SPEED;
            this.checkForRecycling();
        }
    }

    private checkForRecycling(): void {
        if (this.obstacles._1.position.z > 4) {
            const newO = this.nextObstacle();
            this.obstacles._1.hiddenPosition();
            this.obstacles._1 = this.obstacles._2;
            this.obstacles._2 = newO;

            this.obstacles._2.obstaclePosition(-Section.GAP * 2)
        }

        if (this.position.z > 0) {
            this.position.z = -this.sectionLength;
        }
    }

    public resetLevel() {
        this.counter = 5;
        this.counter_show = true;
        this.allObstacles.forEach(o => o.hiddenPosition())

        const _1 = this.nextObstacle();
        const _2 = this.nextObstacle(_1)
        this.obstacles = {_1, _2}

        this.obstacles._1.obstaclePosition(-Section.GAP);
        this.obstacles._2.obstaclePosition(-Section.GAP * 2);
        this.position.z = -this.sectionLength;


        this.SPEED = 7;
    }

    public speedUp() {this.SPEED += 1;}

    public speedDown() {this.SPEED -= 1;}
}
