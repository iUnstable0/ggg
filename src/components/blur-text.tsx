"use client";
import { motion, Transition, Easing } from "motion/react";
import { useEffect, useRef, useState, useMemo } from "react";

type SparkleData = {
  id: number;
  top: string;
  left: string;
  duration: number;
  delay: number;
};

const Sparkle: React.FC<Omit<SparkleData, "id">> = ({
  top,
  left,
  duration,
  delay,
}) => {
  return (
    <motion.div
      style={{
        position: "absolute",
        top,
        left,
        width: "5px",
        height: "5px",
        zIndex: 1,
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
        y: [0, -50, -100],
        x: [0, 10, 20],
        opacity: [0, 1, 0.5, 0],
        scale: [0, 1.1, 0.8, 0],
      }}
      transition={{
        delay,
        duration,
        ease: "linear",
        times: [0, 0.2, 0.7, 1],
      }}
    />
  );
};

type BlurTextProps = {
  text?: string;
  delay?: number;
  className?: string;
  animateBy?: "words" | "letters";
  threshold?: number;
  rootMargin?: string;
  animationFrom?: Record<string, string | number>;
  animationTo?: Array<Record<string, string | number>>;
  easing?: Easing | Easing[];
  onAnimationComplete?: () => void;
  stepDuration?: number;
};

const buildKeyframes = (
  from: Record<string, string | number>,
  steps: Array<Record<string, string | number>>,
): Record<string, Array<string | number>> => {
  const keys = new Set<string>([
    ...Object.keys(from),
    ...steps.flatMap((s) => Object.keys(s)),
  ]);
  const keyframes: Record<string, Array<string | number>> = {};
  keys.forEach((k) => {
    keyframes[k] = [from[k], ...steps.map((s) => s[k])];
  });
  return keyframes;
};

const BlurText: React.FC<BlurTextProps> = ({
  text = "",
  delay = 50,
  className = "",
  animateBy = "words",
  threshold = 0.1,
  rootMargin = "0px",
  animationFrom,
  animationTo,
  easing = (t: number) => t,
  onAnimationComplete,
  stepDuration = 0.25,
}) => {
  const elements = animateBy === "words" ? text.split(" ") : text.split("");
  const [inView, setInView] = useState(false);
  const ref = useRef<HTMLParagraphElement>(null);
  const [sparkles, setSparkles] = useState<SparkleData[]>([]);

  const defaultFrom = {
    filter: "blur(10px)",
    opacity: 0,
    x: -12,
  };

  const defaultTo = [
    {
      filter: "blur(2px)",
      opacity: 0.8,
      x: -2,
    },
    {
      filter: "blur(0px)",
      opacity: 1,
      x: 0,
    },
  ];

  const fromSnapshot = animationFrom ?? defaultFrom;
  const toSnapshots = animationTo ?? defaultTo;
  const stepCount = toSnapshots.length + 1;
  const totalDuration = stepDuration * (stepCount - 1);

  const totalTextAnimationDuration = useMemo(() => {
    const stagger = (elements.length - 1) * (delay / 1000);
    const lastWordAnim = stepDuration * toSnapshots.length;
    return stagger + lastWordAnim;
  }, [elements.length, delay, stepDuration, toSnapshots.length]);

  useEffect(() => {
    if (!ref.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.unobserve(ref.current as Element);
        }
      },
      { threshold, rootMargin },
    );
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [threshold, rootMargin]);

  useEffect(() => {
    if (inView && ref.current) {
      const { offsetWidth, offsetHeight } = ref.current;
      const amount = 200;

      const newSparkles = Array.from({ length: amount }).map(() => {
        const spawnTime = Math.random() * totalTextAnimationDuration;
        const spawnX =
          (spawnTime / totalTextAnimationDuration) * offsetWidth +
          (Math.random() - 0.5) * 20;
        const spawnY = Math.random() * offsetHeight;

        return {
          id: Math.random(),
          top: `${spawnY}px`,
          left: `${spawnX}px`,
          duration: Math.random() * 0.6 + 0.6,
          delay: spawnTime,
        };
      });
      setSparkles(newSparkles);
    }
  }, [inView, totalTextAnimationDuration]);

  return (
    <p
      ref={ref}
      className={`blur-text ${className} flex flex-wrap`}
      style={{ position: "relative" }}
    >
      {elements.map((segment, index) => {
        const animateKeyframes = buildKeyframes(fromSnapshot, toSnapshots);
        const baseDelay = (index * delay) / 1000;
        const spanTransition: Transition = {
          duration: totalDuration,
          times: Array.from(
            { length: stepCount },
            (_, i) => i / (stepCount - 1),
          ),
          delay: baseDelay,
          ease: easing,
        };

        return (
          <motion.span
            key={index}
            initial={fromSnapshot}
            animate={inView ? animateKeyframes : fromSnapshot}
            transition={spanTransition}
            onAnimationComplete={
              index === elements.length - 1 ? onAnimationComplete : undefined
            }
            style={{
              display: "inline-block",
              willChange: "transform, filter, opacity",
            }}
          >
            {segment === " " ? "\u00A0" : segment}
            {animateBy === "words" && index < elements.length - 1 && "\u00A0"}
          </motion.span>
        );
      })}
      {sparkles.map(({ id, ...props }) => (
        <Sparkle key={id} {...props} />
      ))}
    </p>
  );
};

export default BlurText;
