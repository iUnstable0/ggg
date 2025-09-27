import { motion } from "motion/react";

export default function Sparkle({
  key,
  top,
  left,
  duration,
  delay,
  onAnimationComplete,
  direction = "up",
}: {
  key: number;
  top: string;
  left: string;
  duration: number;
  delay: number;
  onAnimationComplete?: () => void;
  direction?: "left" | "right" | "up" | "down" | "center";
}) {
  let targetY;
  let targetX;

  switch (direction) {
    case "up":
      targetY = [0, -50, -100];
      targetX = [0, 10, 20];
      break;
    case "down":
      targetY = [0, 50, 100];
      targetX = [0, 10, 20];
      break;
    case "left":
      targetY = [0, 10, 20];
      targetX = [0, -50, -100];
      break;
    case "right":
      targetY = [0, 10, 20];
      targetX = [0, 50, 100];
      break;
    case "center":
      targetY = [0, 100];
      targetX = [0, 100];
      break;
    default:
      targetY = [0, -50, -100];
      targetX = [0, 10, 20];
  }
  return (
    <motion.div
      key={key}
      style={{
        position: "absolute",
        top,
        left,
        width: "5px",
        height: "5px",
        zIndex: 2,
      }}
      initial={{
        opacity: 0,
        scale: 0,
        y: 0,
        x: 0,
        background:
          "radial-gradient(circle, rgba(255,223,0,0.8) 0%, rgba(255,223,0,0) 70%)",
      }}
      animate={{
        // y: [0, -50, -100],
        // x: [0, 10, 20],
        y: targetY,
        x: targetX,
        opacity: [0, 1, 0.5, 0],
        scale: [0, 1.1, 0.8, 0],
      }}
      transition={{
        delay,
        duration,
        ease: "linear",
        times: [0, 0.2, 0.7, 1],
      }}
      onAnimationComplete={onAnimationComplete}
    />
  );
}
