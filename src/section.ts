import * as B from "@babylonjs/core";

const stairLevel = [
    [[0, 0], [0, 0], [0, 0]],
    [[0, 0], [0, 0], [0, 0]],
    [[0, 0], [0, 0], [0, 0]],
    [[0, 1], [1, 0], [0, 1]],
    [[0, 0], [0, 0], [0, 0]],
    [[0, 0], [0, 0], [0, 0]],
];

export class Section extends B.TransformNode {
    private scene: B.Scene;

    public obstacles: B.TransformNode[];
    private ground: B.Mesh;
    private sectionLength: number;
    private sectionWidth: number;

    private static readonly SPEED : number = 7;
    private static readonly GRID = {
        xPositions: [-1, 0, 1],
        yHeights: [0.5, 1.5],
    };
    
    constructor(scene: B.Scene, zPosition: number) {
        super("section", scene);

        this.scene = scene;
        this.sectionLength = 50;
        this.sectionWidth = 3;
        this.obstacles = [];

        this.position.z = zPosition;

        this.ground = this.createGround();
        this.generateFromArray(stairLevel);
    }

    private createGround(): B.Mesh {
        const ground = B.MeshBuilder.CreateGround("ground", {
            width: this.sectionWidth,
            height: this.sectionLength,
            subdivisionsX: 3,
            subdivisionsY: 50
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
        this.position.z += deltaTime * Section.SPEED;
        this.checkForRecycling();
    }

    private checkForRecycling(): void {
        if (this.position.z > 0) {
            this.recycle();
        }
    }

    private recycle() {
        this.position.z = -this.sectionLength;
    }

    private generateFromArray(levelArray: number[][][]): void {
        for (let z = 0; z < levelArray.length; z++) {
            for (let x = 0; x < levelArray[z].length; x++) {
                for (let y = 0; y < levelArray[z][x].length; y++) {
                    if (levelArray[z][x][y] === 1) {
                        this.createObstacle(
                            { x: Section.GRID.xPositions[x]
                            , y: Section.GRID.yHeights[y]
                            , z: z + 1
                            });
                    }
                }
            }
        }
    }

    private createObstacle(positions: {x:number, y: number, z: number}): void {
        const {x, y, z} = positions;
        const obstacle = B.MeshBuilder.CreateBox(
            `obstacle_${x}_${y}_${z}`,
            {size: 1},
            this.scene
        );
        obstacle.parent = this;

        obstacle.position = new B.Vector3(x, y, z);

        obstacle.material = new B.StandardMaterial(`obstacle_mat_${x}_${y}_${z}`, this.scene);
        if (obstacle.material instanceof B.StandardMaterial) {
            obstacle.material.diffuseColor = new B.Color3(1,0,0);
            obstacle.material.specularColor = new B.Color3(0, 0, 0); // Sin brillo
        }

        obstacle.checkCollisions = true;
        this.obstacles.push(obstacle);
    }
}
