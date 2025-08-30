"use client";

import { useState, useMemo, useEffect } from "react";

import Image from "next/image";

import { DateTime } from "luxon";
import { motion, AnimatePresence } from "motion/react";

import Fuse from "fuse.js";
import axios from "axios";
import useSound from "use-sound";

import { RgbaColorPicker } from "react-colorful";

import Cursor from "@/components/cursor";

import emojis from "./emojis.json";

import styles from "./page.module.css";
import { SlidingNumber } from "@/components/sliding-number";

const fuse = new Fuse(emojis, {});

export default function Home() {
  const [playHarp] = useSound("/sounds/harp.wav", {
    interrupt: true,
  });
  const [playRain] = useSound("/sounds/rain.wav", {
    interrupt: true,
  });
  const [playDust] = useSound("/sounds/dust.wav", {
    interrupt: true,
  });
  const [playStar] = useSound("/sounds/star.wav", {
    interrupt: true,
  });
  const [playSparkle] = useSound("/sounds/sparkle.wav", {
    interrupt: true,
  });
  const [playTsHurtMyEars] = useSound("/sounds/tshurtmyears.wav", {
    interrupt: true,
  });
  const [playAww] = useSound("/sounds/aww.wav", {
    interrupt: true,
  });
  const [playFart] = useSound("/sounds/fart.wav", {
    interrupt: true,
  });
  const [playPoop] = useSound("/sounds/poop.wav", {
    interrupt: true,
  });

  const [file, setFile] = useState<File | null>(null);
  const [goatedImage, setGoatedImage] = useState<string | null>(null);

  const [quality, setQuality] = useState("20");
  const [loops, setLoops] = useState("3");
  const [subsample, setSubsample] = useState("2");
  const [posterizebits, setPosterizebits] = useState(true);
  const [brightness, setBrightness] = useState("1");
  const [contrast, setContrast] = useState("1");
  const [ghost, setGhost] = useState(true);
  const [ghostpacify, setGhostpacify] = useState("0.5");
  const [ghostshit, setGhostshit] = useState("10");
  const [font, setFont] = useState("1");
  const [message, setMessage] = useState("Hello, My Goat :red-heart:");

  const [color, setColor] = useState({
    r: 255,
    g: 255,
    b: 255,
    a: 1,
  });

  const [endTime, setEndTime] = useState<string | null>(null);
  const [timeRemaining, setTimeRemaining] = useState("5:00");

  const [searchTerm, setSearchTerm] = useState("");

  const [loading, setLoading] = useState(false);

  const [isPrincess, setIsPrincess] = useState(false);

  const [position, setPosition] = useState({
    x: 0,
    y: 0,
  });

  const imageUrl = useMemo(() => {
    if (!file) return null;
    return URL.createObjectURL(file);
  }, [file]);

  const searchResults = useMemo(() => {
    // if (searchTerm.length < 2) {
    //   return ["Search term minimum 2 characters"];
    // }

    const result = fuse.search(searchTerm);

    if (result.length === 0) {
      return emojis.slice(0, 100);
    }

    return result.slice(0, 100).map((r) => r.item);
  }, [searchTerm]);

  useEffect(() => {
    return () => {
      if (imageUrl) URL.revokeObjectURL(imageUrl);
    };
  }, [imageUrl]);

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      setPosition({ x: e.clientX + 2, y: e.clientY + 2 });
    };

    window.addEventListener("pointermove", onMove, { passive: true });

    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  // Hide the native cursor globally in princess mode
  useEffect(() => {
    if (isPrincess) {
      const prev = document.body.style.cursor;

      document.body.style.cursor = "none !important";

      return () => {
        document.body.style.cursor = prev;
      };
    }
  }, [isPrincess]);

  useEffect(() => {
    if (!endTime) {
      return;
    }

    const endDate = DateTime.fromISO(endTime);

    const interval = setInterval(() => {
      const diff = endDate.diff(DateTime.now(), ["minutes", "seconds"]);

      setTimeRemaining(`${diff.minutes}:${Math.round(diff.seconds)}`);
    }, 500);

    return () => {
      clearInterval(interval);
    };
  }, [endTime]);

  const deleteGoat = async () => {
    const goatName = goatedImage?.split("/").pop();

    try {
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/delete`,
        {
          name: goatName,
        },
      );

      console.log(res.data);
    } catch (error) {
      console.error(
        "Error deleting old goat lol it will delete on its own anyway ",
      );
    }

    setGoatedImage(null);
  };

  const previewGoat = async () => {
    if (loading) return;

    if (!file) return;

    setLoading(true);

    if (goatedImage) {
      // alert("overwrite");

      await deleteGoat();
    }

    const formData = new FormData();
    formData.append("file", file);

    formData.append("quality", quality);
    formData.append("loops", loops);
    formData.append("subsample", subsample);
    formData.append("posterizebits", posterizebits.toString());
    formData.append("brightness", brightness);
    formData.append("contrast", contrast);
    formData.append("ghost", ghost.toString());
    formData.append("ghostpacify", ghostpacify);
    formData.append("ghostshit", ghostshit);
    formData.append("font", font);
    formData.append("message", message);

    formData.append("r", color.r.toString());
    formData.append("g", color.g.toString());
    formData.append("b", color.b.toString());
    formData.append("a", Math.round(color.a * 255).toString());

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

      setGoatedImage(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/files/${encodeURIComponent(res.data.filename)}`,
      );

      if (isPrincess) {
        playStar();
        playDust();
      }

      setEndTime(DateTime.now().plus({ minutes: 5 }).toISO());
    } catch (error) {
      console.error("Error generating goated image:", error);
      alert("Failed to generate goated image. Please try again.");
    }

    setLoading(false);
  };

  return (
    <div
      className={styles.page}
      style={{
        cursor: isPrincess ? "none" : "default",
      }}
    >
      {isPrincess && <Cursor position={position} />}

      <div className={styles.header}>
        <b>The Goodnight Goat Generator</b>
      </div>

      <button
        onClick={(e) => {
          if (!isPrincess) {
            playHarp();
            playRain();
          } else {
            playFart();

            setTimeout(() => {
              playPoop();
            }, 750);
            // playPoop();
          }

          setIsPrincess(!isPrincess);
        }}
        style={{
          background: "#757575",
          padding: "4px",
          cursor: isPrincess ? "none" : "default",
        }}
      >
        {isPrincess
          ? "⚠️ poor mode (noob) 💩"
          : "💎💫princes mode (powerful)💖✨"}
      </button>

      <input
        type={"file"}
        accept={"image/*"}
        id="img"
        className={styles.fileInput}
        multiple={false}
        onInput={(e) => {
          // alert("file");
          const file = (e.target as HTMLInputElement).files?.[0];
          if (!file) return;

          setFile(file);
          deleteGoat();

          if (isPrincess) {
            playSparkle();
            playTsHurtMyEars();
            // playStar();l
          }
        }}
      />
      <label
        htmlFor={"img"}
        className={styles.chooseFile}
        style={{
          cursor: isPrincess ? "none" : "default",
        }}
      >
        click here to choose file
      </label>
      {`file chosen: ${file?.name || "no file chosen"}`}

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
              {loading
                ? "loading. plz wait"
                : "press the preview button to preview the goated image"}
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
        <div className={styles.bottombar}>
          <button
            onClick={previewGoat}
            disabled={loading}
            style={{
              cursor: isPrincess ? "none" : "default",
              background: "#757575",
              padding: "4px",
            }}
          >
            {loading
              ? "Loading, please wait..."
              : "Click to preview goated image"}
          </button>
          <p>All files expire in 5 minutes after generation</p>
          {endTime && <p>Expiry timer: {timeRemaining}</p>}

          <p className={styles.bottombartext}>
            what should each compression quality be?
          </p>
          <div className={styles.bottombaritem}>
            <SlidingNumber value={parseFloat(quality)} />
            <input
              type="range"
              min="0"
              max="100"
              step="1"
              defaultValue="20"
              onChange={(e) => setQuality(e.target.value)}
            />
          </div>

          <p className={styles.bottombartext}>
            how many times should it be compressed?
          </p>
          <div className={styles.bottombaritem}>
            <SlidingNumber value={parseFloat(loops)} />
            <input
              type="range"
              min="0"
              max="10"
              step="1"
              defaultValue="3"
              onChange={(e) => setLoops(e.target.value)}
            />
          </div>

          <p className={styles.bottombartext}>
            subsample (0=keep all colors, 1=less colors, 2=least colors):{" "}
          </p>
          <div className={styles.bottombaritem}>
            <SlidingNumber value={parseFloat(subsample)} />
            <input
              type="range"
              min="0"
              max="2"
              step="1"
              defaultValue="2"
              onChange={(e) => setSubsample(e.target.value)}
            />{" "}
          </div>

          <p className={styles.bottombartext}>
            posterize bits (off = keep all colors, on = less colors):{" "}
          </p>
          <div className={styles.bottombaritem}>
            {posterizebits ? "on" : "off"}
            <input
              type="checkbox"
              checked={posterizebits}
              onChange={(e) => setPosterizebits(e.target.checked)}
            />
          </div>

          <p className={styles.bottombartext}>brightness</p>
          <div className={styles.bottombaritem}>
            <SlidingNumber value={parseFloat(brightness)} />
            <input
              type="range"
              min="0"
              max="2"
              step="0.1"
              defaultValue="1"
              onChange={(e) => setBrightness(e.target.value)}
            />
          </div>

          <p className={styles.bottombartext}>contrast</p>
          <div className={styles.bottombaritem}>
            <SlidingNumber value={parseFloat(contrast)} />
            <input
              type="range"
              min="0"
              max="2"
              step="0.1"
              defaultValue="1"
              onChange={(e) => setContrast(e.target.value)}
            />
          </div>

          <p className={styles.bottombartext}>
            ghost (adds ghosting effect, like old VHS tapes (clone image, paste
            on top with random shift to a direction and opacity set to 0.5))
          </p>
          <div className={styles.bottombaritem}>
            {ghost ? "on" : "off"}
            <input
              type="checkbox"
              checked={ghost}
              onChange={(e) => setGhost(e.target.checked)}
            />
          </div>

          <p className={styles.bottombartext}>
            ghost opacity (how much opacity the ghost has, 0 = invisible, 1 =
            fully visible)
          </p>
          <div className={styles.bottombaritem}>
            <SlidingNumber value={parseFloat(ghostpacify)} />
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              defaultValue="0.5"
              onChange={(e) => setGhostpacify(e.target.value)}
            />
          </div>

          <p className={styles.bottombartext}>
            ghost shift (how much the ghost shifts, in pixels)
          </p>
          <div className={styles.bottombaritem}>
            <SlidingNumber value={parseFloat(ghostshit)} />
            <input
              type="range"
              min="0"
              max="50"
              step="1"
              defaultValue="10"
              onChange={(e) => setGhostshit(e.target.value)}
            />
          </div>

          <p className={styles.bottombartext}>
            font (1-4, font style to use for the message):{" "}
          </p>
          <div className={styles.bottombaritem}>
            <SlidingNumber value={parseFloat(font)} />
            <input
              type="range"
              min="1"
              max="4"
              step="1"
              defaultValue="1"
              onChange={(e) => setFont(e.target.value)}
            />
          </div>

          <p className={styles.bottombartext}>Text color</p>
          <RgbaColorPicker color={color} onChange={setColor} />

          <p className={styles.bottombartext}>message to write:</p>
          <div className={styles.bottombaritem}>
            <input
              type="text"
              value={message}
              style={{
                flex: "1",
              }}
              onChange={(e) => setMessage(e.target.value)}
            />
          </div>

          <p className={styles.bottombartext}>EMOJI SEARCH</p>
          <div className={styles.bottombaritem}>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
              }}
            >
              <input
                type="text"
                value={searchTerm}
                placeholder={"wilted-flower"}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <p>max 100 results to prevent lag</p>
            </div>

            <div className={styles.emojiCtn}>
              <AnimatePresence mode={"popLayout"}>
                {searchResults.map((r) => (
                  <motion.div
                    key={r}
                    initial={{
                      opacity: 0,
                    }}
                    animate={{
                      opacity: 1,
                    }}
                    exit={{
                      opacity: 0,
                    }}
                    transition={{
                      type: "spring",
                      stiffness: 350,
                      damping: 40,
                      opacity: {
                        ease: "linear",
                        duration: 0.2,
                      },
                    }}
                    className={styles.emojiImgCtn}
                    layout
                  >
                    <Image
                      src={`/emojis/${r}.png`}
                      alt={""}
                      className={styles.emojiImg}
                      width={25}
                      height={25}
                      loading={"lazy"}
                      decoding={"async"}
                    />
                    {r}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        </div>
      )}

      {imageUrl && (
        <div className={styles.bottombar}>
          <button
            onClick={previewGoat}
            disabled={loading}
            style={{
              cursor: isPrincess ? "none" : "default",
              background: "#757575",
              padding: "4px",
            }}
          >
            {loading
              ? "Loading, please wait..."
              : "Click to preview goated image"}
          </button>
          <p>All files expire in 5 minutes after generation</p>
          {endTime && <p>Expiry timer: {timeRemaining}</p>}
        </div>
      )}

      {file && (
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
                {loading
                  ? "loading. plz wait"
                  : "press the preview button to preview the goated image"}
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
      )}

      {file && (
        <>
          <input
            type={"file"}
            accept={"image/*"}
            id="img"
            className={styles.fileInput}
            multiple={false}
            onInput={(e) => {
              // alert("file");
              const file = (e.target as HTMLInputElement).files?.[0];
              if (!file) return;

              setFile(file);
              deleteGoat();
            }}
          />
          <label
            htmlFor={"img"}
            className={styles.chooseFile}
            style={{
              cursor: isPrincess ? "none" : "default",
            }}
          >
            click here to choose file
          </label>
          {`file chosen: ${file?.name || "no file chosen"}`}
        </>
      )}
    </div>
  );
}
