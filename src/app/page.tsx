"use client";

import { useState, useMemo } from "react";

import axios from "axios";

import styles from "./page.module.css";
import Image from "next/image";

export default function Home() {
  const [file, setFile] = useState<File | null>(null);

  const imageUrl = useMemo(() => {
    if (!file) return null;
    return URL.createObjectURL(file);
  }, [file]);

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <b>The Goodnight Goat Generator</b>
      </div>

      <input
        type={"file"}
        accept={"image/*"}
        className={styles.fileInput}
        multiple={false}
        onInput={(e) => {
          // alert("file");
          const file = (e.target as HTMLInputElement).files?.[0];
          if (!file) return;

          setFile(file);
        }}
      />

      <div className={styles.previewCtn}>
        {!imageUrl && (
          <div className={styles.noImage}>
            selected image will be shown here
          </div>
        )}
        {imageUrl && (
          <Image
            src={imageUrl}
            alt={"Image preview"}
            width={100}
            height={100}
            className={styles.image}
          />
        )}
      </div>
    </div>
  );
}
