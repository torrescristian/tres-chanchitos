import { useEffect, useRef, useState } from "react";
import { Application, Assets, Spritesheet } from "pixi.js";

import { BlockTypes } from "../../../tres-chanchitos/components/molecules/Block";
import { MATCH_SIZE, SPRITE_SIZE } from "../../../common/libs/consts";
import Match3 from "../../../tres-chanchitos/components/organisms/Match3";

export default function GameLandingPage() {
  const appRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<Match3 | null>(null);
  const pixiAppRef = useRef<Application | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [gameError, setGameError] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [lastMatch, setLastMatch] = useState<{
    type: string;
    points: number;
  } | null>(null);

  useEffect(() => {
    let mounted = true;
    const currentAppRef = appRef.current;

    (async () => {
      try {
        if (!currentAppRef || !mounted) return;

        // Limpiar cualquier aplicación existente
        if (pixiAppRef.current) {
          pixiAppRef.current.destroy(true);
          pixiAppRef.current = null;
        }

        const app = new Application();
        pixiAppRef.current = app;

        await app.init({
          width: MATCH_SIZE * SPRITE_SIZE,
          height: MATCH_SIZE * SPRITE_SIZE,
          backgroundColor: 0x1099bb,
          antialias: true,
        });

        if (!mounted) {
          app.destroy(true);
          return;
        }

        // Verificar que el spritesheet existe antes de cargarlo
        try {
          const spritesheet = await Assets.load<Spritesheet>(
            "/spritesheet.json"
          );

          if (!mounted) {
            app.destroy(true);
            return;
          }

          const game = new Match3({
            app,
            spritesheet,
            size: MATCH_SIZE,
            blocks: [...BlockTypes],
          });

          gameRef.current = game;

          // Configurar el callback de puntaje
          game.setScoreCallback((newScore, event) => {
            if (mounted) {
              setScore(newScore);
              setCombo(event.combo);
              setLastMatch({
                type: event.type,
                points: event.points,
              });
            }
          });

          if (currentAppRef && !currentAppRef.children.length && mounted) {
            currentAppRef.appendChild(app.canvas);
          }

          app.ticker.add(() => {
            if (gameRef.current && mounted) {
              gameRef.current.render();
            }
          });

          if (mounted) {
            setIsLoading(false);
          }
        } catch (assetError) {
          console.error("Error cargando assets:", assetError);
          if (mounted) {
            setGameError(
              "Error al cargar los recursos del juego. Verifica que los archivos estén disponibles."
            );
            setIsLoading(false);
          }
          app.destroy(true);
        }
      } catch (error) {
        console.error("Error inicializando el juego:", error);
        if (mounted) {
          setGameError(
            "Error al inicializar el juego. Por favor, recarga la página."
          );
          setIsLoading(false);
        }
      }
    })();

    return () => {
      mounted = false;

      // Limpiar el juego primero
      if (gameRef.current) {
        try {
          gameRef.current.destroy();
        } catch (error) {
          console.warn("Error al destruir el juego:", error);
        }
        gameRef.current = null;
      }

      // Luego limpiar la aplicación PIXI
      if (pixiAppRef.current) {
        try {
          pixiAppRef.current.destroy(true);
        } catch (error) {
          console.warn("Error al destruir la aplicación PIXI:", error);
        }
        pixiAppRef.current = null;
      }

      // Limpiar el DOM usando la variable capturada
      if (currentAppRef) {
        currentAppRef.innerHTML = "";
      }
    };
  }, []);

  const SIZE = MATCH_SIZE * SPRITE_SIZE;

  const getAnimalEmoji = (type: string) => {
    const emojis: { [key: string]: string } = {
      chick: "🐣",
      pig: "🐷",
      parrot: "🦜",
      crocodile: "🐊",
    };
    return emojis[type] || "🐾";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-800 flex flex-col items-center justify-center p-4">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-5xl md:text-6xl font-bold text-white mb-4 drop-shadow-lg">
          🐷 Tres Chanchitos
        </h1>
        <p className="text-xl md:text-2xl text-blue-100 mb-2 max-w-2xl mx-auto">
          ¡Arrastra y conecta 3 o más bloques del mismo tipo para ganar puntos!
        </p>
        <p className="text-lg text-blue-200 max-w-2xl mx-auto">
          Un juego de puzzle divertido y adictivo inspirado en los clásicos
          juegos de match-3
        </p>
      </div>

      {/* Score Display */}
      {!isLoading && !gameError && (
        <div className="mb-6 grid grid-cols-3 gap-4 max-w-2xl mx-auto">
          <div className="bg-white/20 backdrop-blur-sm rounded-xl px-6 py-3 border border-white/30">
            <div className="text-center">
              <p className="text-white/80 text-sm font-medium">PUNTOS</p>
              <p className="text-white text-2xl font-bold">
                {score.toLocaleString()}
              </p>
            </div>
          </div>

          <div
            className={`backdrop-blur-sm rounded-xl px-6 py-3 border transition-all duration-300 ${
              combo > 1
                ? "bg-yellow-500/30 border-yellow-300/50 animate-pulse opacity-100"
                : "bg-white/10 border-white/20 opacity-50"
            }`}
          >
            <div className="text-center">
              <p
                className={`text-sm font-medium ${
                  combo > 1 ? "text-yellow-100" : "text-white/60"
                }`}
              >
                COMBO
              </p>
              <p className="text-white text-2xl font-bold">
                {combo > 1 ? `x${combo}` : "x1"}
              </p>
            </div>
          </div>

          <div
            className={`backdrop-blur-sm rounded-xl px-6 py-3 border transition-all duration-300 ${
              lastMatch
                ? "bg-green-500/30 border-green-300/50 opacity-100"
                : "bg-white/10 border-white/20 opacity-50"
            }`}
          >
            <div className="text-center">
              <p
                className={`text-sm font-medium ${
                  lastMatch ? "text-green-100" : "text-white/60"
                }`}
              >
                ÚLTIMO MATCH
              </p>
              <p className="text-white text-xl font-bold">
                {lastMatch
                  ? `${getAnimalEmoji(lastMatch.type)} +${lastMatch.points}`
                  : "🐾 +0"}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Game Container */}
      <div className="relative">
        {isLoading && (
          <div
            className="flex items-center justify-center bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20"
            style={{ width: SIZE, height: SIZE }}
          >
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-white border-t-transparent mx-auto mb-4"></div>
              <p className="text-white text-lg">Cargando juego...</p>
            </div>
          </div>
        )}

        {gameError && (
          <div
            className="flex items-center justify-center bg-red-500/20 backdrop-blur-sm rounded-2xl border border-red-300/30"
            style={{ width: SIZE, height: SIZE }}
          >
            <div className="text-center text-white p-6">
              <p className="text-lg mb-4">😔 {gameError}</p>
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
              >
                Reintentar
              </button>
            </div>
          </div>
        )}

        <div
          ref={appRef}
          className={`rounded-2xl overflow-hidden shadow-2xl border-4 border-white/20 ${
            isLoading || gameError ? "hidden" : ""
          }`}
          style={{
            width: SIZE,
            height: SIZE,
          }}
        />
      </div>

      {/* Instructions & Scoring System */}
      <div className="mt-8 max-w-4xl text-center space-y-6">
        {/* Cómo Jugar */}
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
          <h3 className="text-2xl font-semibold text-white mb-4">
            🎮 Cómo Jugar
          </h3>
          <div className="grid md:grid-cols-2 gap-6 text-blue-100">
            <div className="text-left">
              <p className="mb-3">
                • <strong>Arrastra</strong> un bloque hacia un bloque adyacente
                para intercambiarlos
              </p>
              <p className="mb-3">
                • <strong>Conecta 3+</strong> bloques del mismo tipo en línea
                horizontal o vertical
              </p>
            </div>
            <div className="text-left">
              <p className="mb-3">
                • <strong>Combos</strong> te dan puntos extra por matches
                consecutivos
              </p>
              <p className="mb-3">
                • <strong>Diferentes animales</strong> valen diferentes puntos
                base
              </p>
            </div>
          </div>
        </div>

        {/* Scoring System */}
        <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 backdrop-blur-sm rounded-xl p-6 border border-yellow-300/30">
          <h3 className="text-2xl font-semibold text-white mb-6">
            🏆 Valores de los Animales
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
            <div className="text-center bg-white/10 rounded-lg p-4">
              <p className="text-4xl mb-2">🐣</p>
              <p className="text-white font-bold text-lg">Pollito</p>
              <p className="text-yellow-200 text-xl font-bold">10 pts</p>
            </div>
            <div className="text-center bg-white/10 rounded-lg p-4">
              <p className="text-4xl mb-2">🐷</p>
              <p className="text-white font-bold text-lg">Chanchito</p>
              <p className="text-yellow-200 text-xl font-bold">15 pts</p>
            </div>
            <div className="text-center bg-white/10 rounded-lg p-4">
              <p className="text-4xl mb-2">🦜</p>
              <p className="text-white font-bold text-lg">Loro</p>
              <p className="text-yellow-200 text-xl font-bold">20 pts</p>
            </div>
            <div className="text-center bg-white/10 rounded-lg p-4">
              <p className="text-4xl mb-2">🐊</p>
              <p className="text-white font-bold text-lg">Cocodrilo</p>
              <p className="text-yellow-200 text-xl font-bold">25 pts</p>
            </div>
          </div>

          <div className="bg-white/5 rounded-lg p-4">
            <h4 className="text-lg font-semibold text-white mb-3">
              💥 Multiplicadores
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-blue-100 text-sm">
              <div className="text-center">
                <p className="font-bold text-white">3-4 bloques</p>
                <p>x1 multiplicador</p>
              </div>
              <div className="text-center">
                <p className="font-bold text-white">5-6 bloques</p>
                <p>x2 multiplicador</p>
              </div>
              <div className="text-center">
                <p className="font-bold text-white">7-8 bloques</p>
                <p>x3 multiplicador</p>
              </div>
              <div className="text-center">
                <p className="font-bold text-white">9+ bloques</p>
                <p>x5 multiplicador</p>
              </div>
            </div>
            <p className="text-center text-yellow-200 font-semibold mt-3">
              🔥 Combo bonus: +50% puntos base por cada combo consecutivo
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-8 text-center text-blue-200">
        <p className="text-sm">
          Hecho con ❤️ usando React, TypeScript y PIXI.js
        </p>
      </footer>
    </div>
  );
}
