"use client";

import { useEffect, useRef, useState } from "react";
import { EyeBall, Pupil } from "./animated-eyes";
import { cn } from "@/lib/utils";

// ─────────────────────────────────────────────────────
// CharacterState interface
// ─────────────────────────────────────────────────────
export interface CharacterState {
  curiosity: boolean;      // First/last name typing/focus
  inquisitive: boolean;    // Email focused
  coversEyes: boolean;     // Password focused
  worried: boolean;        // Weak password
  happy: boolean;          // Strong password
  nodding: boolean;        // Role selected
  thumbsUp: boolean;       // Terms checked
  cheering: boolean;       // Form complete
  celebrating: boolean;    // Registration success
}

interface AnimatedCharactersProps {
  state: CharacterState;
  mouseX?: number;
  mouseY?: number;
  isTyping?: boolean;
}

// ─── Character position/tracking helper ─────────────────────
function useCharacterPosition(
  ref: React.RefObject<HTMLDivElement | null>,
  mouseX: number,
  mouseY: number
) {
  const [pos, setPos] = useState({ faceX: 0, faceY: 0, bodySkew: 0 });

  useEffect(() => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 3;
    const dx = mouseX - cx;
    const dy = mouseY - cy;
    setPos({
      faceX: Math.max(-15, Math.min(15, dx / 20)),
      faceY: Math.max(-10, Math.min(10, dy / 30)),
      bodySkew: Math.max(-6, Math.min(6, -dx / 120)),
    });
  }, [mouseX, mouseY, ref]);

  return pos;
}

export function AnimatedCharacters({ state, mouseX = 0, mouseY = 0, isTyping = false }: AnimatedCharactersProps) {
  // Blinking states
  const [isPurpleBlinking, setIsPurpleBlinking] = useState(false);
  const [isBlackBlinking, setIsBlackBlinking] = useState(false);

  // Look at each other transition
  const [isLookingAtEachOther, setIsLookingAtEachOther] = useState(false);

  const purpleRef = useRef<HTMLDivElement>(null);
  const blackRef = useRef<HTMLDivElement>(null);
  const orangeRef = useRef<HTMLDivElement>(null);
  const yellowRef = useRef<HTMLDivElement>(null);

  const purplePos = useCharacterPosition(purpleRef, mouseX, mouseY);
  const blackPos = useCharacterPosition(blackRef, mouseX, mouseY);
  const orangePos = useCharacterPosition(orangeRef, mouseX, mouseY);
  const yellowPos = useCharacterPosition(yellowRef, mouseX, mouseY);

  // Purple blinking loop
  useEffect(() => {
    const schedule = () => {
      const t = setTimeout(() => {
        setIsPurpleBlinking(true);
        setTimeout(() => {
          setIsPurpleBlinking(false);
          schedule();
        }, 150);
      }, Math.random() * 4000 + 3000);
      return t;
    };
    const t = schedule();
    return () => clearTimeout(t);
  }, []);

  // Black blinking loop
  useEffect(() => {
    const schedule = () => {
      const t = setTimeout(() => {
        setIsBlackBlinking(true);
        setTimeout(() => {
          setIsBlackBlinking(false);
          schedule();
        }, 150);
      }, Math.random() * 4000 + 3000);
      return t;
    };
    const t = schedule();
    return () => clearTimeout(t);
  }, []);

  // Look at each other triggers
  useEffect(() => {
    if (!isTyping) {
      setIsLookingAtEachOther(false);
      return;
    }
    setIsLookingAtEachOther(true);
    const t = setTimeout(() => setIsLookingAtEachOther(false), 800);
    return () => clearTimeout(t);
  }, [isTyping]);

  // Purple covers eyes / peeking
  const coversEyes = state.coversEyes;
  const isWorried = state.worried;
  const isHappy = state.happy;
  const isCurious = state.curiosity;
  const isInquisitive = state.inquisitive;
  const isNodding = state.nodding;
  const isThumbsUp = state.thumbsUp;
  const isCheering = state.cheering;
  const isCelebrating = state.celebrating;

  // Determine look offsets based on states
  let purpleForceX: number | undefined = undefined;
  let purpleForceY: number | undefined = undefined;
  let blackForceX: number | undefined = undefined;
  let blackForceY: number | undefined = undefined;
  let pupilForceX: number | undefined = undefined;
  let pupilForceY: number | undefined = undefined;

  if (isLookingAtEachOther) {
    purpleForceX = 3;
    purpleForceY = 4;
    blackForceX = 0;
    blackForceY = -4;
  } else if (isWorried) {
    // Worried: look downward
    purpleForceY = 6;
    blackForceY = 5;
    pupilForceY = 4;
  } else if (isInquisitive) {
    // Inquisitive: look slightly up/left
    purpleForceX = -4;
    purpleForceY = -3;
    blackForceX = -3;
    blackForceY = -2;
    pupilForceX = -3;
  }

  // Base bounce / animations
  const bounceClass = isCelebrating
    ? "animate-[bounce_0.5s_infinite]"
    : isCheering || isHappy
    ? "animate-[bounce_1s_infinite]"
    : "";

  return (
    <div className="relative z-20 flex items-end justify-center" style={{ height: "500px" }}>
      <div className={cn("relative transition-all duration-500", bounceClass)} style={{ width: "550px", height: "400px" }}>
        
        {/* Purple — Back layer */}
        <div
          ref={purpleRef}
          className={cn(
            "absolute bottom-0 transition-all duration-700 ease-in-out",
            isNodding && "animate-[bounce_0.6s_ease-in-out]"
          )}
          style={{
            left: "70px",
            width: "180px",
            height: isCurious || isTyping ? "440px" : "400px",
            backgroundColor: "#6C3FF5",
            borderRadius: "10px 10px 0 0",
            zIndex: 1,
            transform: coversEyes
              ? "skewX(-5deg) translateY(20px)"
              : isThumbsUp
              ? "skewX(-8deg)"
              : isInquisitive
              ? "rotate(-5deg) translateY(-10px)"
              : isCurious || isTyping
              ? `skewX(${(purplePos.bodySkew || 0) - 12}deg) translateX(40px)`
              : `skewX(${purplePos.bodySkew || 0}deg)`,
            transformOrigin: "bottom center",
          }}
        >
          {/* Cover eyes / Sleepy X_X Eyes if coversEyes is active */}
          {coversEyes ? (
            <div className="absolute flex gap-8 left-[45px] top-[50px] transition-all duration-300">
              {/* Left X Eye */}
              <div className="relative w-[22px] h-[22px] flex items-center justify-center">
                <div className="absolute w-[22px] h-1 bg-white rotate-45 rounded" />
                <div className="absolute w-[22px] h-1 bg-white -rotate-45 rounded" />
              </div>
              {/* Right X Eye */}
              <div className="relative w-[22px] h-[22px] flex items-center justify-center">
                <div className="absolute w-[22px] h-1 bg-white rotate-45 rounded" />
                <div className="absolute w-[22px] h-1 bg-white -rotate-45 rounded" />
              </div>
            </div>
          ) : (
            <div
              className="absolute flex gap-8 transition-all duration-700 ease-in-out"
              style={{
                left: isLookingAtEachOther ? "55px" : `${45 + purplePos.faceX}px`,
                top: isLookingAtEachOther ? "65px" : `${40 + (isCurious ? -10 : 0) + purplePos.faceY}px`,
              }}
            >
              <EyeBall
                size={18}
                pupilSize={7}
                maxDistance={5}
                eyeColor="white"
                pupilColor="#1a1a2e"
                isBlinking={isPurpleBlinking}
                forceLookX={purpleForceX}
                forceLookY={purpleForceY}
              />
              <EyeBall
                size={18}
                pupilSize={7}
                maxDistance={5}
                eyeColor="white"
                pupilColor="#1a1a2e"
                isBlinking={isPurpleBlinking}
                forceLookX={purpleForceX}
                forceLookY={purpleForceY}
              />
            </div>
          )}

          {/* Sparkles / Celebration effect overlay */}
          {isCelebrating && (
            <div className="absolute -top-10 left-1/2 -translate-x-1/2 text-2xl animate-ping">✨</div>
          )}
        </div>

        {/* Black — Middle layer */}
        <div
          ref={blackRef}
          className="absolute bottom-0 transition-all duration-700 ease-in-out"
          style={{
            left: "240px",
            width: "120px",
            height: "310px",
            backgroundColor: "#1a1a2e",
            borderRadius: "8px 8px 0 0",
            zIndex: 2,
            transform: coversEyes
              ? "skewX(4deg)"
              : isThumbsUp
              ? "skewX(6deg) translateY(-5px)"
              : isInquisitive
              ? "rotate(5deg) translateY(5px)"
              : isLookingAtEachOther
              ? `skewX(${(blackPos.bodySkew || 0) * 1.5 + 10}deg) translateX(20px)`
              : isCurious || isTyping
              ? `skewX(${(blackPos.bodySkew || 0) * 1.5}deg)`
              : `skewX(${blackPos.bodySkew || 0}deg)`,
            transformOrigin: "bottom center",
          }}
        >
          <div
            className="absolute flex gap-6 transition-all duration-700 ease-in-out"
            style={{
              left: isLookingAtEachOther ? "32px" : `${26 + blackPos.faceX}px`,
              top: isLookingAtEachOther ? "12px" : `${32 + (isCurious ? -8 : 0) + blackPos.faceY}px`,
            }}
          >
            <EyeBall
              size={16}
              pupilSize={6}
              maxDistance={4}
              eyeColor="white"
              pupilColor="#1a1a2e"
              isBlinking={isBlackBlinking}
              forceLookX={blackForceX}
              forceLookY={blackForceY}
            />
            <EyeBall
              size={16}
              pupilSize={6}
              maxDistance={4}
              eyeColor="white"
              pupilColor="#1a1a2e"
              isBlinking={isBlackBlinking}
              forceLookX={blackForceX}
              forceLookY={blackForceY}
            />
          </div>
        </div>

        {/* Orange — Front left semi-circle */}
        <div
          ref={orangeRef}
          className="absolute bottom-0 transition-all duration-700 ease-in-out"
          style={{
            left: "0px",
            width: "240px",
            height: "200px",
            backgroundColor: "#FF9B6B",
            borderRadius: "120px 120px 0 0",
            zIndex: 3,
            transform: isThumbsUp
              ? "skewX(-4deg) scaleY(1.05)"
              : `skewX(${orangePos.bodySkew || 0}deg)`,
            transformOrigin: "bottom center",
          }}
        >
          <div
            className="absolute flex gap-8 transition-all duration-200 ease-out"
            style={{
              left: `${82 + orangePos.faceX}px`,
              top: `${90 + (isCurious ? -6 : 0) + orangePos.faceY}px`,
            }}
          >
            <Pupil size={12} maxDistance={5} pupilColor="#1a1a2e" forceLookX={pupilForceX} forceLookY={pupilForceY} />
            <Pupil size={12} maxDistance={5} pupilColor="#1a1a2e" forceLookX={pupilForceX} forceLookY={pupilForceY} />
          </div>
        </div>

        {/* Yellow — Front right capsule */}
        <div
          ref={yellowRef}
          className="absolute bottom-0 transition-all duration-700 ease-in-out"
          style={{
            left: "310px",
            width: "140px",
            height: "230px",
            backgroundColor: "#E8D754",
            borderRadius: "70px 70px 0 0",
            zIndex: 4,
            transform: isThumbsUp
              ? "skewX(-6deg) scale(1.02)"
              : `skewX(${yellowPos.bodySkew || 0}deg)`,
            transformOrigin: "bottom center",
          }}
        >
          <div
            className="absolute flex gap-6 transition-all duration-200 ease-out"
            style={{
              left: `${52 + yellowPos.faceX}px`,
              top: `${40 + (isCurious ? -12 : 0) + yellowPos.faceY}px`,
            }}
          >
            <Pupil size={12} maxDistance={5} pupilColor="#1a1a2e" forceLookX={pupilForceX} forceLookY={pupilForceY} />
            <Pupil size={12} maxDistance={5} pupilColor="#1a1a2e" forceLookX={pupilForceX} forceLookY={pupilForceY} />
          </div>
          {/* Mouth — Reacts to happy/worried/celebrating */}
          <div
            className={cn(
              "absolute rounded-full transition-all duration-200 ease-out",
              isHappy || isCelebrating || isCheering
                ? "w-8 h-8 bg-[#1a1a2e] rounded-b-full rounded-t-none"
                : isWorried
                ? "w-6 h-6 border-t-2 border-[#1a1a2e] rounded-t-full rounded-b-none bg-transparent"
                : "w-[52px] h-[4px] bg-[#1a1a2e]"
            )}
            style={{
              left: isHappy || isCelebrating || isCheering ? "54px" : `${44 + yellowPos.faceX}px`,
              top: isHappy || isCelebrating || isCheering ? "78px" : `${88 + yellowPos.faceY}px`,
            }}
          />
        </div>

      </div>
    </div>
  );
}
