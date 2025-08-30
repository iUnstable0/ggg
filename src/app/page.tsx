"use client";

import { useState, useMemo } from "react";

import axios from "axios";

import styles from "./page.module.css";
import Image from "next/image";

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [goatedImage, setGoatedImage] = useState<string | null>(null);

  const imageUrl = useMemo(() => {
    if (!file) return null;
    return URL.createObjectURL(file);
  }, [file]);

  const previewGoat = async () => {
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("message", "Hello, My Goat :red-heart:");
    formData.append("brightness", "0.8");

    try {
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/upload`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );

      console.log(res.data);

      // setGoatedImage(url);
    } catch (error) {
      console.error("Error generating goated image:", error);
      alert("Failed to generate goated image. Please try again.");
    }
  };

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

      <div className={styles.previewGroup}>
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
        {"=>"}

        <div className={styles.previewCtn}>
          {!goatedImage && (
            <div className={styles.noImage}>
              press the preview button to preview the goated image!
            </div>
          )}
          {goatedImage && (
            <Image
              src={goatedImage}
              alt={"Goat preview"}
              width={100}
              height={100}
              className={styles.image}
            />
          )}
        </div>
      </div>

      {imageUrl && (
        <button onClick={previewGoat}>Click to preview goated image!</button>
      )}
    </div>
  );
}
