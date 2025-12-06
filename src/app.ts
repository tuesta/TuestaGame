import "@babylonjs/core/Debug/debugLayer";
import "@babylonjs/inspector";
import "@babylonjs/loaders/glTF";
import * as B from "@babylonjs/core";
import { PlayerFPCamera } from "./playerFPCamera";
import { Section } from "./section";

function createCanvas(): HTMLCanvasElement {
  //create the canvas html element and attach it to the webpage
  const canvas = document.createElement("canvas");
  canvas.style.width = "100%";
  canvas.style.height = "100%";
  canvas.id = "gameCanvas";
  document.body.appendChild(canvas);

  return canvas;
}

function homogeneousLight(scene: B.Scene) : B.HemisphericLight {
    const light = new B.HemisphericLight("light", new B.Vector3(0, 1, 0), scene);
    light.intensity = 1.0;
    light.diffuse = new B.Color3(1, 1, 1);
    light.specular = new B.Color3(0, 0, 0); // Elimina brillos
    light.groundColor = new B.Color3(1, 1, 1); // Igual que diffuse
    return light;
}

function simpleBox(scene: B.Scene) : B.Mesh {
    const box = B.Mesh.CreateBox("crate", 1, scene);
    box.material = new B.StandardMaterial("Mat", scene);
    if (box.material instanceof B.StandardMaterial) {
        box.material.diffuseColor = new B.Color3(1,0,0);
    }
    box.position = new B.Vector3(0, 0.5, -5.5);
    return box;
}

function cameraRotationFixed(scene: B.Scene) : B.FreeCamera {
    // Need a free camera for collisions
    const camera = new B.FreeCamera("FreeCamera", new B.Vector3(0, 1.5, 0), scene);
    camera.setTarget(new B.Vector3(0, 0, 25));
    //Set the ellipsoid around the camera (e.g. your player's size)
    camera.ellipsoid = new B.Vector3(0.4, 0.75, 0.4);
    // camera.ellipsoidOffset = new B.Vector3(0, 0.75 - camera.position.y, 0);
    camera.minZ = 0.45;

    // Configurar límites de cámara
    camera.minZ = 0.1;
    camera.maxZ = 200;

    camera.speed = 0.5;

    return camera;
}

const mkScene = (move: Move) => {
    const canvas = createCanvas();
    const engine = new B.Engine(canvas, true);
    const scene = new B.Scene(engine);
    scene.clearColor = new B.Color4(0, 0, 0, 1); // Negro completamente opaco

    homogeneousLight(scene);

    scene.fogMode = B.Scene.FOGMODE_EXP2;
    scene.fogDensity = 0.05;  // Densidad de la niebla (ajustable)
    scene.fogColor = new B.Color3(0, 0, 0);

    // const ground = groundWithSubdivisions(scene);
    const section1 = new Section(scene, -50);
    // const box = simpleBox(scene);

    const player = new PlayerFPCamera(scene);
    const camera = new B.FreeCamera("debug", new B.Vector3(27, 1.5, -0.3), scene);
    camera.setTarget(new B.Vector3(2.8, 0.69, -0.3));

    scene.collisionsEnabled = true;
    scene.gravity = new B.Vector3(0, -0.8, 0);
    // box.checkCollisions = true;

    scene.onKeyboardObservable.add(kbInfo => {
        player.updateMovement(kbInfo);
    })

    scene.onBeforeRenderObservable.add(() => {
        const deltaTime = engine.getDeltaTime() / 1000;
        player.updateAnimation(deltaTime);
        section1.updateAnimation(deltaTime);

        player.checkCollisionWithObstacles(section1.obstacles)
    })

    //resize if the screen is resized/rotated
    window.addEventListener('resize', () => {
      engine.resize();
    });
    
    return { engine, scene };
}

type Move = {
  left: boolean;
  right: boolean;
  up: boolean;
  down: boolean;
};

const main = () => {
    const move: Move = {
        left: false,
        right: false,
        up: false,
        down: false,
    }

    const {engine, scene} = mkScene(move)

    engine.runRenderLoop(() => {
        scene.render();
    });

    // hide/show the Inspector
    window.addEventListener("keydown", ev => {
        console.log("event");
        // Shift+Ctrl+Alt+I
        if (ev.shiftKey && ev.ctrlKey && ev.altKey && (ev.key === "I" || ev.key === "i")) {
            if (scene.debugLayer.isVisible()) {
                scene.debugLayer.hide();
            } else {
                scene.debugLayer.show();
            }
        }
    });
}

main();
