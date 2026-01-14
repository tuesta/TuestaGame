import * as B from "@babylonjs/core";

export class Obstacle extends B.TransformNode {
    public ix: number;
    public collisions: B.Mesh[] = [];

    constructor(scene: B.Scene, material: B.StandardMaterial, i: number) {
        super(`obstacle_${i}`, scene);
        this.ix = i;

        this.createObstacle(scene, material, i);
        this.hiddenPosition();
    }

    public obstaclePosition(z: number) {
        this.position = new B.Vector3(0, 0, z);
    }

    public hiddenPosition() {
        this.position = new B.Vector3(0, -50, 0);
    }

    public createObstacle(scene: B.Scene, material: B.StandardMaterial, i: number) {
        switch (i) {
            case 0:
                const obstacle_0_0 = B.MeshBuilder.CreateBox(
                    "obstacle_0_0",
                    {size: 1},
                    scene
                );
                obstacle_0_0.scaling = new B.Vector3(2,1,1);
                obstacle_0_0.position = new B.Vector3(0.5, 0.5, -0.5);
                obstacle_0_0.material = material
                obstacle_0_0.parent = this;

                const obstacle_0_1 = B.MeshBuilder.CreateBox(
                    "obstacle_0_1",
                    {size: 1},
                    scene
                );
                obstacle_0_1.scaling = new B.Vector3(2,1,1);
                obstacle_0_1.position = new B.Vector3(-0.5, 1.5, -0.5);
                obstacle_0_1.material = material
                obstacle_0_1.parent = this;

                this.collisions = [obstacle_0_0, obstacle_0_1]
                break;
            case 1:
                const obstacle_1_0 = B.MeshBuilder.CreateBox(
                    "obstacle_1_0",
                    {size: 1},
                    scene
                );
                obstacle_1_0.scaling = new B.Vector3(3,1,1);
                obstacle_1_0.position = new B.Vector3(0, 1.5, -0.5);
                obstacle_1_0.material = material
                obstacle_1_0.parent = this;

                const obstacle_1_1 = B.MeshBuilder.CreateBox(
                    "obstacle_1_1",
                    {size: 1},
                    scene
                );
                obstacle_1_1.position = new B.Vector3(0, 0.5, -0.5);
                obstacle_1_1.material = material
                obstacle_1_1.parent = this;

                this.collisions = [obstacle_1_0, obstacle_1_1]
                break;
            case 2:
                const obstacle_2_0 = B.MeshBuilder.CreateBox(
                    "obstacle_2_0",
                    {size: 1},
                    scene
                );
                obstacle_2_0.scaling = new B.Vector3(3,1,1);
                obstacle_2_0.position = new B.Vector3(0, 0.5, -0.5);
                obstacle_2_0.material = material
                obstacle_2_0.parent = this;

                const obstacle_2_1 = B.MeshBuilder.CreateBox(
                    "obstacle_2_1",
                    {size: 1},
                    scene
                );
                obstacle_2_1.position = new B.Vector3(0, 1.5, -0.5);
                obstacle_2_1.material = material
                obstacle_2_1.parent = this;

                this.collisions = [obstacle_2_0, obstacle_2_1]
                break;
            case 3:
                const obstacle_3 = B.MeshBuilder.CreateBox(
                    "obstacle_3",
                    {size: 1},
                    scene
                );
                obstacle_3.scaling = new B.Vector3(1,2,3);
                obstacle_3.position = new B.Vector3(0, 1, -1.5);
                obstacle_3.material = material
                obstacle_3.parent = this;

                this.collisions = [obstacle_3]
                break;
            case 4:
                const obstacle_4 = B.MeshBuilder.CreateBox(
                    "obstacle_4",
                    {size: 1},
                    scene
                );
                obstacle_4.scaling = new B.Vector3(2,2,3);
                obstacle_4.position = new B.Vector3(0.5, 1, -1.5);
                obstacle_4.material = material
                obstacle_4.parent = this;

                this.collisions = [obstacle_4]
                break;
            case 5:
                const obstacle_5 = B.MeshBuilder.CreateBox(
                    "obstacle_5",
                    {size: 1},
                    scene
                );
                obstacle_5.scaling = new B.Vector3(2,2,3);
                obstacle_5.position = new B.Vector3(-0.5, 1, -1.5);
                obstacle_5.material = material
                obstacle_5.parent = this;

                this.collisions = [obstacle_5]
                break;
            case 6:
                const obstacle_6_0 = B.MeshBuilder.CreateBox(
                    "obstacle_6_0",
                    {size: 1},
                    scene
                );
                obstacle_6_0.scaling = new B.Vector3(1,2,3);
                obstacle_6_0.position = new B.Vector3(-1, 1, -1.5);
                obstacle_6_0.material = material
                obstacle_6_0.parent = this;

                const obstacle_6_1 = B.MeshBuilder.CreateBox(
                    "obstacle_6_1",
                    {size: 1},
                    scene
                );
                obstacle_6_1.scaling = new B.Vector3(1,2,3);
                obstacle_6_1.position = new B.Vector3(1, 1, -1.5);
                obstacle_6_1.material = material
                obstacle_6_1.parent = this;

                this.collisions = [obstacle_6_0, obstacle_6_1]
                break;
            case 7:
                const obstacle_7_0 = B.MeshBuilder.CreateBox(
                    "obstacle_7_0",
                    {size: 1},
                    scene
                );
                obstacle_7_0.scaling = new B.Vector3(1,2,1);
                obstacle_7_0.position = new B.Vector3(-1, 1, -0.5);
                obstacle_7_0.material = material
                obstacle_7_0.parent = this;

                const obstacle_7_1 = B.MeshBuilder.CreateBox(
                    "obstacle_7_1",
                    {size: 1},
                    scene
                );
                obstacle_7_1.scaling = new B.Vector3(1,2,1);
                obstacle_7_1.position = new B.Vector3(1, 1, -0.5);
                obstacle_7_1.material = material
                obstacle_7_1.parent = this;

                const obstacle_7_2 = B.MeshBuilder.CreateBox(
                    "obstacle_7_2",
                    {size: 1},
                    scene
                );
                obstacle_7_2.position = new B.Vector3(0, 1.5, -0.5);
                obstacle_7_2.material = material
                obstacle_7_2.parent = this;

                this.collisions = [obstacle_7_0, obstacle_7_1, obstacle_7_2]
                break;
            case 8:
                const obstacle_8_0 = B.MeshBuilder.CreateBox(
                    "obstacle_8_0",
                    {size: 1},
                    scene
                );
                obstacle_8_0.scaling = new B.Vector3(1,2,1);
                obstacle_8_0.position = new B.Vector3(-1, 1, -0.5);
                obstacle_8_0.material = material
                obstacle_8_0.parent = this;

                const obstacle_8_1 = B.MeshBuilder.CreateBox(
                    "obstacle_8_1",
                    {size: 1},
                    scene
                );
                obstacle_8_1.scaling = new B.Vector3(1,2,1);
                obstacle_8_1.position = new B.Vector3(1, 1, -0.5);
                obstacle_8_1.material = material
                obstacle_8_1.parent = this;

                const obstacle_8_2 = B.MeshBuilder.CreateBox(
                    "obstacle_8_2",
                    {size: 1},
                    scene
                );
                obstacle_8_2.position = new B.Vector3(0, 0.5, -0.5);
                obstacle_8_2.material = material
                obstacle_8_2.parent = this;

                this.collisions = [obstacle_8_0, obstacle_8_1, obstacle_8_2]
                break;
            case 9:
                const obstacle_9 = B.MeshBuilder.CreateBox(
                    "obstacle_9",
                    {size: 1},
                    scene
                );
                obstacle_9.scaling = new B.Vector3(3, 1, 1);
                obstacle_9.position = new B.Vector3(0, 1.5, -0.5);
                obstacle_9.material = material
                obstacle_9.parent = this;

                this.collisions = [obstacle_9]
                break;
            case 10:
                const obstacle_10 = B.MeshBuilder.CreateBox(
                    "obstacle_10",
                    {size: 1},
                    scene
                );
                obstacle_10.scaling = new B.Vector3(3, 1, 1);
                obstacle_10.position = new B.Vector3(0, 0.5, -0.5);
                obstacle_10.material = material
                obstacle_10.parent = this;

                this.collisions = [obstacle_10]
                break;
            case 11:
                 const obstacle_11_0 = B.MeshBuilder.CreateBox(
                    "obstacle_11_0",
                    {size: 1},
                    scene
                );
                obstacle_11_0.position = new B.Vector3(0, 0.5, -0.5);
                obstacle_11_0.material = material
                obstacle_11_0.parent = this;

                const obstacle_11_1 = B.MeshBuilder.CreateBox(
                    "obstacle_11_1",
                    {size: 1},
                    scene
                );
                obstacle_11_1.position = new B.Vector3(1, 1.5, -0.5);
                obstacle_11_1.material = material
                obstacle_11_1.parent = this;

                const obstacle_11_2 = B.MeshBuilder.CreateBox(
                    "obstacle_11_2",
                    {size: 1},
                    scene
                );
                obstacle_11_2.position = new B.Vector3(-1, 1.5, -0.5);
                obstacle_11_2.material = material
                obstacle_11_2.parent = this;

                this.collisions = [obstacle_11_0, obstacle_11_1, obstacle_11_2]
                break;

            case 12:
                 const obstacle_12_0 = B.MeshBuilder.CreateBox(
                    "obstacle_12_0",
                    {size: 1},
                    scene
                );
                obstacle_12_0.position = new B.Vector3(0, 1.5, -0.5);
                obstacle_12_0.material = material
                obstacle_12_0.parent = this;

                const obstacle_12_1 = B.MeshBuilder.CreateBox(
                    "obstacle_12_1",
                    {size: 1},
                    scene
                );
                obstacle_12_1.position = new B.Vector3(1, 0.5, -0.5);
                obstacle_12_1.material = material
                obstacle_12_1.parent = this;

                const obstacle_12_2 = B.MeshBuilder.CreateBox(
                    "obstacle_12_2",
                    {size: 1},
                    scene
                );
                obstacle_12_2.position = new B.Vector3(-1, 0.5, -0.5);
                obstacle_12_2.material = material
                obstacle_12_2.parent = this;

                this.collisions = [obstacle_12_0, obstacle_12_1, obstacle_12_2];
                break;
        }
    }
}
