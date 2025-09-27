import { motion } from "motion/react";
import { useMemo } from "react";

export default function Sparkle({
  top,
  left,
  duration,
  delay,
  onAnimationComplete,
  direction = "up",
}: {
  top: string;
  left: string;
  duration: number;
  delay: number;
  onAnimationComplete?: () => void;
  direction?: "left" | "right" | "up" | "down" | "center";
}) {
  const { targetX, targetY } = useMemo(() => {
    let finalX, finalY;
    const distance = Math.random() * 75 + 50;

    switch (direction) {
      case "center":
        const angle = Math.random() * 2 * Math.PI;

        finalX = Math.cos(angle) * distance;
        finalY = Math.sin(angle) * distance;

        break;
      case "up":
        finalY = -distance;
        finalX = (Math.random() - 0.5) * distance;

        break;
      case "down":
        finalY = distance;
        finalX = (Math.random() - 0.5) * distance;

        break;
      case "left":
        finalX = -distance;
        finalY = (Math.random() - 0.5) * distance;

        break;
      case "right":
        finalX = distance;
        finalY = (Math.random() - 0.5) * distance;

        break;
      default:
        finalY = -distance;
        finalX = (Math.random() - 0.5) * distance;
    }

    return {
      targetY: [0, finalY / 2, finalY],
      targetX: [0, finalX / 2, finalX],
    };
  }, [direction]);

  return (
    <motion.div
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
