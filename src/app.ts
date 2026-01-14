import "@babylonjs/core/Debug/debugLayer";
import "@babylonjs/inspector";
import "@babylonjs/loaders/glTF";
import * as B from "@babylonjs/core";
import { PlayerFPCamera } from "./playerFPCamera";
import { Section } from "./section";

import { setupHandleInput } from "./handleInput";

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

function setupNeonEffect(scene: B.Scene, camera: B.Camera): void {
    const pipeline = new B.DefaultRenderingPipeline(
        "neonPipeline",
        true,
        scene,
        [camera]
    );

    pipeline.bloomEnabled = true;
    pipeline.bloomThreshold = 0.0;         // 0 = todo brilla, 1 = nada brilla
    pipeline.bloomWeight = 4.0;            // Muy alto
    pipeline.bloomKernel = 64;             // Glow grande
    pipeline.bloomScale = 1.0;             // Máxima escala

    pipeline.imageProcessingEnabled = true;
    pipeline.imageProcessing.contrast = 1.3;
    pipeline.imageProcessing.exposure = 1.5;
}

const menu = document.getElementById("menu_t") as HTMLElement;
const ranking = document.getElementById("ranking") as HTMLElement;
const button = document.getElementById("play") as HTMLElement;
const inputName = document.getElementById("name") as HTMLInputElement;
let start: number | null
let name: string | null
let menuActive = false;

let justOne = false;

button.addEventListener("click", () => {
    menu.style.display = "none"
    document.body.style.cursor = "none"

    name = inputName.value.trim();
    start = Date.now();
    menuActive = false;

    const section = (<any>window).section as Section;

    if (section) {section.resetLevel();}
})
const handleMenu= () => {
    menuActive = true;
    ranking.innerHTML = "";

    if (start && name) {
        const pts = Date.now() - start - 5000;
        const ptsPrev = parseInt(localStorage.getItem(name) || "0")
        localStorage.setItem(name, "" + Math.max(pts, ptsPrev))
        start = null;
        name = null;
    }

    const ls = { ...localStorage }
    const rankMap = new Map();

    for (const name in ls) {
        const pts = parseInt(ls[name])
        if (Number.isNaN(pts)) {
            localStorage.removeItem(name);
        } else {
            rankMap.set(name, pts)
        }
    }

    const rankOrdered = Array.from(rankMap).sort((a, b) => b[1] - a[1]);

    for (let i = 0; i < 9 && i < rankOrdered.length; i++) {
        const namePts = rankOrdered[i];
        const li = document.createElement("li");
        li.innerHTML = `<span>${i + 1}. ${namePts[0]}</span><span>${namePts[1]}pts</span>`;
        ranking.appendChild(li);
    }

    menu.style.display = "flex";
    document.body.style.cursor = "auto";
    (<any>window).section.SPEED = 0;
}


const mkScene = () => {
    const canvas = createCanvas();
    const engine = new B.Engine(canvas, true);
    const scene = new B.Scene(engine);
    scene.clearColor = new B.Color4(0, 0, 0, 1); // Negro completamente opaco

    const player = new PlayerFPCamera(scene);
    const camera = new B.FreeCamera("debug", new B.Vector3(-0.95, 0.6, -8.8), scene);
    camera.setTarget(new B.Vector3(2.8, 0.69, -0.3));

    setupNeonEffect(scene, player.camera)

    homogeneousLight(scene);

    scene.fogMode = B.Scene.FOGMODE_EXP2;
    scene.fogDensity = 0.05;  // Densidad de la niebla (ajustable)
    scene.fogColor = new B.Color3(0, 0, 0);

    const section = new Section(scene);
    (<any>window).section = section;

    scene.collisionsEnabled = true;
    scene.gravity = new B.Vector3(0, -0.8, 0);
    // box.checkCollisions = true;

    scene.onKeyboardObservable.add(kbInfo => {
        if (menuActive) {return}
        if (kbInfo.event.key.toLowerCase() === "+") {
            section.speedUp();
        } else if (kbInfo.event.key.toLowerCase() === "-") {
            section.speedDown();
        }
        player.updateMovement(kbInfo);
    })

    scene.onBeforeRenderObservable.add(() => {
        const deltaTime = engine.getDeltaTime() / 1000;
        player.updateAnimation(deltaTime);
        section.updateAnimation(deltaTime);

        const died = player.checkCollisionWithObstacles(section.obstacles._1.collisions)
        if (!died) {justOne = false;}
        if (died && !justOne) {
            (<any>window).isPlaying = false;
            player.restartPosition();
            justOne = true;
            handleMenu()
        }
    })

    //resize if the screen is resized/rotated
    window.addEventListener('resize', () => {
      engine.resize();
    });

    handleMenu();
    
    return { engine, scene, player };
}

const main = () => {
    const {engine, scene, player} = mkScene()

    setupHandleInput(player.updateMovementMobile);

    engine.runRenderLoop(() => {
        scene.render();
    });

    // hide/show the Inspector
    // window.addEventListener("keydown", ev => {
    //     // Shift+Ctrl+Alt+I
    //     if (ev.shiftKey && ev.ctrlKey && ev.altKey && (ev.key === "I" || ev.key === "i")) {
    //         if (scene.debugLayer.isVisible()) {
    //             scene.debugLayer.hide();
    //         } else {
    //             scene.debugLayer.show();
    //         }
    //     }
    // });
}

main();
