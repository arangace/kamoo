import { KaboomCtx } from "kaboom";
import { scaleFactor } from "../constants";
import { BoundaryProps, EntityType } from "../types";
import { setCamScale } from "../utils/set-camscale";
import { MovePlayerKeyboard } from "../playerMovement";
import { playerCharacter } from "../kaboomCtx";

const forestScene = (kaboomContext: KaboomCtx) => {
  const player = playerCharacter;
  // Scene logic starts here..
  kaboomContext.scene("forest", async (spawnPoints) => {
    console.log("in the forest..");
    const mapData = await (await fetch("/assets/map/forest.json")).json();
    const layers = mapData.layers;

    const map = kaboomContext.add([
      kaboomContext.sprite("forest"),
      kaboomContext.pos(0),
      kaboomContext.scale(scaleFactor),
    ]);

    for (const layer of layers) {
      if (layer.name === "boundaries") {
        for (const boundary in layer.objects) {
          const currentBoundary: BoundaryProps = layer.objects[boundary];
          map.add([
            kaboomContext.area({
              shape: new kaboomContext.Rect(
                kaboomContext.vec2(0),
                currentBoundary.width,
                currentBoundary.height
              ),
            }),
            kaboomContext.body({ isStatic: true }),
            kaboomContext.pos(currentBoundary.x, currentBoundary.y),
            currentBoundary.name,
          ]);
        }
        continue;
      }
      if (layer.name === "spawnpoints") {
        layer.objects.forEach((entity: EntityType) => {
          if (entity.name === spawnPoints) {
            player.pos = kaboomContext.vec2(
              (map.pos.x + entity.x) * scaleFactor,
              (map.pos.y + entity.y) * scaleFactor
            );
            kaboomContext.add(player);
          }
        });
      }
      if (layer.name === "transitions") {
        for (const transitions in layer.objects) {
          const currentBoundary: BoundaryProps = layer.objects[transitions];
          map.add([
            kaboomContext.area({
              shape: new kaboomContext.Rect(
                kaboomContext.vec2(0),
                currentBoundary.width,
                currentBoundary.height
              ),
            }),
            kaboomContext.body({ isStatic: true }),
            kaboomContext.pos(currentBoundary.x, currentBoundary.y),
            currentBoundary.name,
          ]);
          // Commented out boundary dialogue code
          if (currentBoundary.name) {
            player.onCollide(currentBoundary.name, () => {
              console.log("transitioning..");
              kaboomContext.go("town", "forest");
            });
          }
        }
        continue;
      }
    }

    kaboomContext.onResize(() => {
      setCamScale(kaboomContext);
    });
    // Camera movement
    kaboomContext.onUpdate(() => {
      kaboomContext.camPos(player.pos.x, player.pos.y + 100);
    });

    // Player movement
    // Mouse movement
    // kaboomContext.onMouseDown((mouseBtn) => MovePlayer(mouseBtn, player));
    // Left
    // kaboomContext.onKeyDown("left", () => MovePlayerKeyboard("left", player));
    kaboomContext.onKeyDown("a", () => MovePlayerKeyboard("left", player));
    // Right
    // kaboomContext.onKeyDown("right", () => MovePlayerKeyboard("right", player));
    kaboomContext.onKeyDown("d", () => MovePlayerKeyboard("right", player));
    // Up
    // kaboomContext.onKeyDown("up", () => MovePlayerKeyboard("up", player));
    kaboomContext.onKeyDown("w", () => MovePlayerKeyboard("up", player));
    // Down
    // kaboomContext.onKeyDown("down", () => MovePlayerKeyboard("down", player));
    kaboomContext.onKeyDown("s", () => MovePlayerKeyboard("down", player));

    function stopAnims() {
      if (player.direction === "down") {
        player.play("idle-down");
        return;
      }
      if (player.direction === "up") {
        player.play("idle-up");
        return;
      }

      player.play("idle-side");
    }

    kaboomContext.onMouseRelease(stopAnims);
    kaboomContext.onKeyRelease(() => {
      stopAnims();
    });
  });
};
export default forestScene;
