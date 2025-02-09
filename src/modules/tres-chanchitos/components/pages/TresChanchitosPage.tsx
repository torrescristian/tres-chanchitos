import { useEffect, useRef } from "react";
import { Application, Assets, Spritesheet } from "pixi.js";

import { BlockTypes } from "../molecules/Block";
import { MATCH_SIZE, SPRITE_SIZE } from "../../../common/libs/consts";
import Match3 from "../organisms/Match3";

export default function TresChanchitosPage() {
  const appRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    (async () => {
      if (appRef.current) {
        const app = new Application();

        await app.init({
          width: appRef.current.clientWidth,
          height: appRef.current.clientHeight,
          backgroundColor: 0x1099bb,
          antialias: true,
        });

        // Cargar el JSON del spritesheet con el nuevo sistema de Assets
        const spritesheet = await Assets.load<Spritesheet>("/spritesheet.json");

        const game = new Match3({
          app,
          spritesheet,
          size: MATCH_SIZE,
          blocks: BlockTypes as any,
        });

        if (!appRef.current.children[0]) {
          appRef.current.appendChild(app.canvas);
        }

        app.ticker.add(() => {
          game.render();
        });

        return () => app.destroy();
      }
    })();
  }, []);

  const SIZE = MATCH_SIZE * SPRITE_SIZE;

  return (
    <main
      ref={appRef}
      style={{
        width: SIZE,
        height: SIZE,
      }}
    ></main>
  );
}
