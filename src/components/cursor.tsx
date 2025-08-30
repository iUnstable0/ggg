"use client";

import { useState, useEffect } from "react";

import Image from "next/image";

import styles from "./cursor.module.css";

export default function Cursor({
  position,
}: {
  position: {
    x: number;
    y: number;
  };
}) {
  const [isPointer, setIsPointer] = useState(true);

  const handleMouseMove = (e: any) => {
    const target = e.target;
    const tagName = target.tagName.toLowerCase();

    if (["label", "button", "input"].includes(tagName)) {
      setIsPointer(true);
    } else {
      setIsPointer(false);
    }
  };

  useEffect(() => {
    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  return (
    <Image
      src={"/wand.png"}
      alt={"wand"}
      className={styles.wand}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        transform: isPointer ? "rotate(-10deg)" : "none",
      }}
      width={100}
      height={100}
    />
  );
}
