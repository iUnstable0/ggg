"use client";

import { useState, useMemo, useEffect, useRef, useCallback } from "react";

import Image from "next/image";

import { DateTime } from "luxon";
import { motion, AnimatePresence } from "motion/react";

import clsx from "clsx";

import Snowfall from "react-snowfall";

import { useDropzone } from "react-dropzone";

import { Stage, Layer, Line, Text } from "react-konva";

import toast, { Toaster } from "react-hot-toast";

import { Spoiler } from "spoiled";

import Fuse from "fuse.js";
import axios from "axios";
import useSound from "use-sound";

import { RgbaColorPicker } from "react-colorful";

import Cursor from "@/components/cursor";

import emojis from "./emojis.json";
import Sparkle from "@/components/sparkles";

import styles from "./page.module.css";
import { SlidingNumber } from "@/components/sliding-number";
import BlurText from "@/components/blur-text";
import { GlowEffect } from "@/components/glow-effect";

import { BorderTrail } from "@/components/border";

const fuse = new Fuse(emojis, {});

const VID_LIMIT = 20;

function FilePreviewButton({
  handlePreview,
  loading,
  isPrincess,
  endTime,
  timeRemaining,
}: {
  handlePreview: () => Promise<void>;
  loading: boolean;
  isPrincess: boolean;
  endTime: string | null;
  timeRemaining: string;
}) {
  return (
    <>
      <button
        onClick={handlePreview}
        disabled={loading}
        style={{
          cursor: isPrincess ? "none" : "default",
          background: "#757575",
          padding: "4px",
        }}
      >
        {loading
          ? "Loading, please wait..."
          : "Click to preview goated image/gif"}
      </button>
      <p>All files expire in 5 minutes after generation</p>
      {endTime && <p>Expiry timer: {timeRemaining}</p>}
    </>
  );
}

function FileSelection({
  onFileInput,
  isPrincess,
  file,
  isDragActive,
}: {
  onFileInput: (e: any) => Promise<void>;
  isPrincess: boolean;
  file: File;
  isDragActive: boolean;
}) {
  return (
    <>
      {isDragActive ? (
        <p>Drop the files here ...</p>
      ) : (
        <p>You can also drag and drop files here!</p>
      )}
      <input
        style={{
          cursor: isPrincess ? "none" : "default",
        }}
        type={"file"}
        accept={"image/*,video/*"}
        id="img"
        className={styles.fileInput}
        multiple={false}
        onChange={onFileInput}
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
  );
}

function FilePreview({
  show,
  fileUrl,
  fileType,
  goatedImage,
  loading,
  uploadPg,
  isPrincess,
}: {
  show: boolean;
  fileUrl: string | null;
  fileType: string | null;
  goatedImage: string | null;
  loading: boolean;
  uploadPg: number;
  isPrincess: boolean;
}) {
  const handleDownload = async () => {
    if (!goatedImage) {
      toast.error("No image to download.");
      return;
    }

    try {
      toast.loading("Preparing download...", { id: "download-toast" });

      const response = await fetch(goatedImage);
      if (!response.ok) {
        throw new Error(`Network response was not ok: ${response.statusText}`);
      }
      const blob = await response.blob();

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;

      const filename = goatedImage.split("/").pop() || "goated-image";
      link.setAttribute("download", filename);

      document.body.appendChild(link);
      link.click();

      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success("Download started!", { id: "download-toast" });
    } catch (error) {
      console.error("Download error:", error);
      toast.error("Failed to download the image.", { id: "download-toast" });
    }
  };

  return (
    show && (
      <div className={styles.previewGroup}>
        <div className={styles.previewCtn}>
          {!fileUrl && (
            <div className={styles.noImage}>
              selected image will be shown here
            </div>
          )}

          {fileUrl &&
            (fileType == "image" ? (
              <Image
                src={fileUrl}
                alt={"Image preview"}
                width={100}
                height={100}
                className={styles.image}
              />
            ) : fileType == "video" ? (
              <video
                key={fileUrl}
                width="320"
                height="240"
                controls
                preload="none"
              >
                <source src={fileUrl} type="video/mp4" />
                Your browser does not support the video tag
              </video>
            ) : (
              <p>Unknown error</p>
            ))}
        </div>

        {"=>"}

        <div className={styles.previewCtn}>
          {!goatedImage && (
            <div className={styles.noImage}>
              {loading
                ? Math.round(uploadPg * 100) == 100
                  ? "processing, this might take a while please wait."
                  : `loading. plz wait ${Math.round(uploadPg * 100)}%`
                : "press the preview button to preview the goated image/gif"}
            </div>
          )}
          {goatedImage && (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "10px",
              }}
            >
              <Image
                src={goatedImage}
                alt={"Goat preview"}
                width={100}
                height={100}
                className={styles.image}
              />
              <button
                onClick={handleDownload}
                style={{
                  cursor: isPrincess ? "none" : "default",
                  background: "#757575",
                  padding: "4px",
                }}
              >
                Download Original File
              </button>
            </div>
          )}
        </div>
      </div>
    )
  );
}

export default function Home() {
  const [playHarp] = useSound("/sounds/harp.mp3", {
    interrupt: true,
  });
  const [playRain] = useSound("/sounds/rain.mp3", {
    interrupt: true,
  });
  const [playDust] = useSound("/sounds/dust.mp3", {
    interrupt: true,
  });
  const [playStar] = useSound("/sounds/star.mp3", {
    interrupt: true,
  });
  const [playSparkle] = useSound("/sounds/sparkle.mp3", {
    interrupt: true,
  });
  const [playTsHurtMyEars] = useSound("/sounds/tshurtmyears.mp3", {
    interrupt: true,
  });
  const [playAww] = useSound("/sounds/aww.mp3", {
    interrupt: true,
  });
  const [playFart] = useSound("/sounds/fart.mp3", {
    interrupt: true,
  });
  const [playPoop] = useSound("/sounds/poop.mp3", {
    interrupt: true,
  });
  const [playMuhehe] = useSound("/sounds/muhehe.mp3", {
    interrupt: true,
  });

  // const [duration, setDuration] = useState(0);
  // const [musicPos, setMusicPos] = useState(0);

  type T_SparkleData = {
    id: number;
    top: string;
    left: string;
    duration: number;
    delay: number;
  }[];

  const onDrop = useCallback((acceptedFiles: any) => {
    const file = acceptedFiles[0];

    // 	if file not video or image
    if (!file.type.startsWith("image") && !file.type.startsWith("video")) {
      toast.error("Only image and video files are supported.");
      return;
    }

    void parseFile(file);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: false,
    noClick: true,
    accept: {
      "image/*": [],
      "video/*": [],
    },
  });

  const imgCtnRef = useRef(null);
  const [sparkles, setSparkles] = useState<T_SparkleData>([]);

  const [tool, setTool] = useState("pen");
  const [lines, setLines] = useState<any>([]);
  const isDrawing = useRef(false);

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

  const [fps, setFps] = useState("10");

  const [color, setColor] = useState({
    r: 255,
    g: 255,
    b: 255,
    a: 1,
  });

  const [musicSelection, setMusicSelection] = useState<number>(0);

  const [endTime, setEndTime] = useState<string | null>(null);
  const [timeRemaining, setTimeRemaining] = useState("5:00");

  const [searchTerm, setSearchTerm] = useState<string>("");

  const [loading, setLoading] = useState<boolean>(false);

  const [uploadPg, setUploadPg] = useState<number>(0);

  const [isPrincess, setIsPrincess] = useState<boolean>(false);
  const [princessConfirmation, setPrincessConfirmation] =
    useState<boolean>(false);

  const [princessPlaying, setPrincessPlaying] = useState<number>(-1);
  const [firstPrincess, setFirstPrincess] = useState<boolean>(true);
  const [princessLore, setPrincessLore] = useState<boolean>(false);
  const [lorePos, setLorePos] = useState<number>(-1);
  const [loreDirection, setLoreDirection] = useState<"next" | "prev">("next");

  const [position, setPosition] = useState({
    x: 0,
    y: 0,
  });

  const loreImgVariants = {
    animate: {
      transform: "scale(1)",
      opacity: 1,
      filter: "blur(0px) grayscale(0%)",
    },
    initial: (direction: "next" | "prev") => ({
      transform: `scale(${direction === "next" ? 1.2 : 0.8})`,
      filter: "blur(20px) grayscale(100%)",
      opacity: 0,
    }),
    exit: (direction: "next" | "prev") => ({
      transform: `scale(${direction === "next" ? 0.8 : 1.2})`,
      filter: "blur(20px) grayscale(100%)",
      opacity: 0,
    }),
  };

  const [volume, setVolume] = useState(0.5);
  const [princessPause, setPrincessPause] = useState(false);

  const [royalOptions, setRoyalOptions] = useState(false);

  const [playPrincess, { stop: stopPrincess, pause: pausePrincess }] = useSound(
    "/sounds/princess.mp3",
    {
      interrupt: true,
      onplay: () => setPrincessPlaying(0),
      onend: () => setMusicSelection(1),
      volume,
      html5: true,
    }
  );

  const [playWhirl, { stop: stopWhirl, pause: pauseWhirl }] = useSound(
    "/sounds/whirl.mp3",
    {
      interrupt: true,
      onplay: () => setPrincessPlaying(1),
      onend: () => setMusicSelection(2),
      volume,
      html5: true,
    }
  );

  const [playRoyal1, { stop: stopRoyal1, pause: pauseRoyal1 }] = useSound(
    "/sounds/royal1.mp3",
    {
      interrupt: true,
      onplay: () => setPrincessPlaying(2),
      onend: () => setMusicSelection(3),
      volume,
      html5: true,
    }
  );

  const [playRoyal2, { stop: stopRoyal2, pause: pauseRoyal2 }] = useSound(
    "/sounds/royal2.mp3",
    {
      interrupt: true,
      onplay: () => setPrincessPlaying(3),
      onend: () => setMusicSelection(4),
      volume,
      html5: true,
    }
  );

  const [playRoyal3, { stop: stopRoyal3, pause: pauseRoyal3 }] = useSound(
    "/sounds/royal3.mp3",
    {
      interrupt: true,
      onplay: () => setPrincessPlaying(4),
      onend: () => setMusicSelection(5),
      volume,
      html5: true,
    }
  );

  const [playChristmas, { stop: stopChristmas, pause: pauseChristmas }] =
    useSound("/sounds/christmas.mp3", {
      interrupt: true,
      onplay: () => setPrincessPlaying(5),
      onend: () => setMusicSelection(0),
      volume,
      html5: true,
    });

  const [playBack, { stop: stopBack }] = useSound("/sounds/lore_back.mp3", {
    interrupt: true,
  });

  const [playNext, { stop: stopNext }] = useSound("/sounds/lore_next.mp3", {
    interrupt: true,
  });

  const [playPrincessModeActivation, { stop: stopPrincessModeActivation }] =
    useSound("/sounds/princessmodeactivated.mp3", {
      interrupt: true,
    });

  const [playLore1, { stop: stopLore1 }] = useSound(
    "/sounds/goodnightgoatloreaudio_1.mp3",
    { interrupt: true, loop: true }
  );
  const [playLore2, { stop: stopLore2 }] = useSound(
    "/sounds/goodnightgoatloreaudio_2.mp3",
    { interrupt: true, loop: true }
  );
  const [playLore3, { stop: stopLore3 }] = useSound(
    "/sounds/goodnightgoatloreaudio_3.mp3",
    { interrupt: true, loop: true }
  );
  const [playLore4, { stop: stopLore4 }] = useSound(
    "/sounds/goodnightgoatloreaudio_4.mp3",
    { interrupt: true, loop: true }
  );
  const [playLore5, { stop: stopLore5 }] = useSound(
    "/sounds/goodnightgoatloreaudio_5.mp3",
    { interrupt: true, loop: true }
  );
  const [playLore6, { stop: stopLore6 }] = useSound(
    "/sounds/goodnightgoatloreaudio_6.mp3",
    { interrupt: true, loop: true }
  );
  const [playLore7, { stop: stopLore7 }] = useSound(
    "/sounds/goodnightgoatloreaudio_7.mp3",
    { interrupt: true, loop: true }
  );
  const [playLore8, { stop: stopLore8 }] = useSound(
    "/sounds/goodnightgoatloreaudio_8.mp3",
    { interrupt: true, loop: true }
  );
  const [playLore9, { stop: stopLore9 }] = useSound(
    "/sounds/goodnightgoatloreaudio_9.mp3",
    { interrupt: true, loop: true }
  );
  const [playLore10, { stop: stopLore10 }] = useSound(
    "/sounds/goodnightgoatloreaudio_10.mp3",
    { interrupt: true, loop: true }
  );
  const [playLore11, { stop: stopLore11 }] = useSound(
    "/sounds/goodnightgoatloreaudio_11.mp3",
    { interrupt: true, loop: true }
  );
  const [playLore12, { stop: stopLore12 }] = useSound(
    "/sounds/goodnightgoatloreaudio_12.mp3",
    { interrupt: true, loop: true }
  );
  const [playLore13, { stop: stopLore13 }] = useSound(
    "/sounds/goodnightgoatloreaudio_13.mp3",
    { interrupt: true, loop: true }
  );
  const [playLore14, { stop: stopLore14 }] = useSound(
    "/sounds/goodnightgoatloreaudio_14.mp3",
    { interrupt: true, loop: true }
  );

  const loreAudio = [
    { stop: stopLore1, play: playLore1 },
    { stop: stopLore2, play: playLore2 },
    { stop: stopLore3, play: playLore3 },
    { stop: stopLore4, play: playLore4 },
    { stop: stopLore5, play: playLore5 },
    { stop: stopLore6, play: playLore6 },
    { stop: stopLore7, play: playLore7 },
    { stop: stopLore8, play: playLore8 },
    { stop: stopLore9, play: playLore9 },
    { stop: stopLore10, play: playLore10 },
    { stop: stopLore11, play: playLore11 },
    { stop: stopLore12, play: playLore12 },
    { stop: stopLore13, play: playLore13 },
    { stop: stopLore14, play: playLore14 },
  ];

  useEffect(() => {
    loreAudio.forEach((audio) => audio.stop());

    if (princessLore && lorePos > 0 && lorePos <= 14) {
      loreAudio[lorePos - 1].play();
    }

    return () => {
      loreAudio.forEach((audio) => audio.stop());
    };
  }, [lorePos, princessLore]);

  const queue = [
    [playPrincess, stopPrincess, pausePrincess],
    [playWhirl, stopWhirl, pauseWhirl],
    [playRoyal1, stopRoyal1, pauseRoyal1],
    [playRoyal2, stopRoyal2, pauseRoyal2],
    [playRoyal3, stopRoyal3, pauseRoyal3],
    [playChristmas, stopChristmas, pauseChristmas],
  ];

  const handleMouseDown = (e: any) => {
    isDrawing.current = true;
    const pos = e.target.getStage().getPointerPosition();
    setLines([...lines, { tool, points: [pos.x, pos.y] }]);
  };

  const handleMouseMove = (e: any) => {
    if (!isDrawing.current) {
      return;
    }
    const stage = e.target.getStage();
    const point = stage.getPointerPosition();
    let lastLine = lines[lines.length - 1];

    lastLine.points = lastLine.points.concat([point.x, point.y]);

    lines.splice(lines.length - 1, 1, lastLine);
    setLines(lines.concat());
  };

  const handleMouseUp = () => {
    isDrawing.current = false;
  };

  const fileUrl = useMemo(() => {
    if (!file) return null;
    console.log("file changed!");
    return URL.createObjectURL(file);
  }, [file]);

  const fileType = useMemo(() => {
    if (!file) return null;

    if (file.type.startsWith("image")) return "image";
    if (file.type.startsWith("video")) return "video";

    return null;
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
      if (fileUrl) URL.revokeObjectURL(fileUrl);
    };
  }, [fileUrl]);

  useEffect(() => {
    const [play, stop] = queue[musicSelection];

    // if music not playing
    if (princessPlaying === -1) {
      if (isPrincess) {
        play();
      }
      //  if music palying
    } else {
      if (!isPrincess) {
        stop();
        setPrincessPlaying(-1);
      }

      if (princessPlaying !== musicSelection) {
        queue[princessPlaying][1]();
        // setPrincessPlaying(musicSelection);
        play();
      }
    }
  }, [princessPlaying, isPrincess, musicSelection]);

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
      playPrincessModeActivation();

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

      if (diff.minutes <= 0 && diff.seconds <= 0) {
        setTimeRemaining(`0:00 (EXPIRED)`);
      } else {
        setTimeRemaining(`${diff.minutes}:${Math.round(diff.seconds)}`);
      }
    }, 500);

    return () => {
      clearInterval(interval);
    };
  }, [endTime]);

  const deleteGoat = async () => {
    if (!goatedImage) {
      console.log("no goat");
      return;
    }

    const goatName = goatedImage?.split("/").pop();

    try {
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/delete`,
        {
          name: goatName,
        }
      );

      console.log(res.data);
    } catch (error) {
      console.error(
        "Error deleting old goat lol it will delete on its own anyway "
      );
    }

    setGoatedImage(null);
  };

  const videoValid = (file: File): Promise<boolean> => {
    return new Promise((resolve) => {
      const url = URL.createObjectURL(file);
      const video = document.createElement("video");

      video.preload = "metadata";
      video.src = url;
      video.onloadedmetadata = () => {
        const duration = Number.isFinite(video.duration) ? video.duration : 0;
        URL.revokeObjectURL(url);
        resolve(duration > VID_LIMIT);
      };
      video.onerror = () => {
        URL.revokeObjectURL(url);
        resolve(false);
      };
    });
  };

  const parseFile = async (file: File, e?: any) => {
    if (file.type.startsWith("video")) {
      if (await videoValid(file)) {
        toast.error(`Video too long max ${VID_LIMIT} secs`);

        if (e) e.target.value = "";

        return;
      }
    }

    setFile(file);
    deleteGoat();

    if (isPrincess) {
      playSparkle();
      playTsHurtMyEars();
    }
  };

  const onFileInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (!file) return;

    void parseFile(file, e);
  };

  const previewGoatVideo = async (formData: FormData) => {
    formData.append("fps", fps);

    try {
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/upload-video`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          onUploadProgress: (pg) => {
            setUploadPg(pg.progress || 0);
          },
        }
      );

      setGoatedImage(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/files/${res.data.filename}`
      );

      if (isPrincess) {
        playStar();
        playDust();
      }

      setEndTime(DateTime.now().plus({ minutes: 5 }).toISO());
    } catch (error) {
      console.error("Error generating goated gif:", error);
      alert("Failed to generate goated gif. Please try again.");
    }

    setLoading(false);
  };

  const previewGoatImage = async (formData: FormData) => {
    try {
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/upload`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          onUploadProgress: (pg) => {
            setUploadPg(pg.progress || 0);
          },
        }
      );

      setGoatedImage(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/files/${res.data.filename}`
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

  const handlePreview = async () => {
    if (loading) return;

    if (!file) return;

    setLoading(true);

    // if (goatedImage) {
    // alert("overwrite");

    // it alr does a check inside the function
    await deleteGoat();

    const formData = new FormData();
    formData.append("file", file);

    formData.append("font", font);
    formData.append("message", message);

    formData.append("r", color.r.toString());
    formData.append("g", color.g.toString());
    formData.append("b", color.b.toString());
    formData.append("a", Math.round(color.a * 255).toString());

    formData.append("quality", quality);
    formData.append("loops", loops);
    formData.append("subsample", subsample);
    formData.append("posterizebits", posterizebits.toString());
    formData.append("brightness", brightness);
    formData.append("contrast", contrast);
    formData.append("ghost", ghost.toString());
    formData.append("ghostpacify", ghostpacify);
    formData.append("ghostshit", ghostshit);

    if (fileType === "image") return previewGoatImage(formData);
    if (fileType === "video") return previewGoatVideo(formData);

    toast.error("how did you get here?");
  };

  const [snowflakes, setSnowflakes] = useState<HTMLImageElement[] | null>(null);

  useEffect(() => {
    // guard for safety
    if (typeof window === "undefined" || typeof document === "undefined")
      return;

    const make = (src: string) => {
      const img = document.createElement("img");
      img.src = src;
      return img;
    };

    setSnowflakes([
      make("/cherry1.png"),
      make("/cherry2.png"),
      make("/cherry3.png"),
      make("/cherry4.png"),
    ]);
  }, []);

  const handleSparkleComplete = useCallback((id: any) => {
    setSparkles((prevSparkles) =>
      prevSparkles.filter((sparkle) => sparkle.id !== id)
    );
  }, []);

  useEffect(() => {
    if (lorePos > 0 && princessLore && imgCtnRef.current) {
      const generateSparkle = () => {
        if (!imgCtnRef.current) return;

        const { offsetWidth, offsetHeight } = imgCtnRef.current;
        const side = Math.floor(Math.random() * 4);

        let spawnX, spawnY;

        if (side === 0) {
          spawnX = Math.random() * offsetWidth;
          spawnY = -5;
        } else if (side === 1) {
          spawnX = offsetWidth + 5;
          spawnY = Math.random() * offsetHeight;
        } else if (side === 2) {
          spawnX = Math.random() * offsetWidth;
          spawnY = offsetHeight + 5;
        } else {
          spawnX = -5;
          spawnY = Math.random() * offsetHeight;
        }

        const newSparkle = {
          id: Date.now() + Math.random(),
          top: `${spawnY}px`,
          left: `${spawnX}px`,
          duration: lorePos === 12 ? Math.random() : Math.random() + 2.7,
          delay: 0,
        };

        setSparkles((prevSparkles) => [...prevSparkles, newSparkle]);
      };

      const interval = setInterval(
        () => {
          generateSparkle();
          generateSparkle();

          if (lorePos === 12) {
            for (let i = 0; i < 12; i++) {
              generateSparkle();
            }
          }
        },
        lorePos === 12 ? 1 : 5
      );

      return () => clearInterval(interval);
    }
  }, [lorePos, princessLore]);

  return (
    <div
      className={styles.page}
      style={{
        cursor: isPrincess ? "none" : "default",
      }}
      {...getRootProps()}
    >
      {/*<div {...getRootProps()} className={styles.dropZone}>*/}
      <input {...getInputProps()} />
      {/*</div>*/}

      {isPrincess && snowflakes && (
        <div className={styles.snowDiv}>
          <Snowfall
            images={[snowflakes[0]]}
            snowflakeCount={20}
            radius={[12, 26]}
            speed={[0.4, 1.2]}
            wind={[-0.4, 0.4]}
            // rotationSpeed={[0.002, 0.01]}
            style={{
              opacity: 0.5,
              position: "fixed",
              inset: 0,
              pointerEvents: "none",
              zIndex: 9999,
            }}
          />
          <Snowfall
            images={[snowflakes[1]]}
            snowflakeCount={20}
            radius={[12, 26]}
            speed={[0.4, 1.2]}
            wind={[-0.4, 0.4]}
            // rotationSpeed={[0.002, 0.01]}
            style={{
              opacity: 0.6,
              position: "fixed",
              inset: 0,
              pointerEvents: "none",
              zIndex: 9999,
            }}
          />
          <Snowfall
            images={[snowflakes[2]]}
            snowflakeCount={20}
            radius={[12, 26]}
            speed={[0.4, 1.2]}
            wind={[-0.4, 0.4]}
            // rotationSpeed={[0.002, 0.01]}
            style={{
              opacity: 0.7,
              position: "fixed",
              inset: 0,
              pointerEvents: "none",
              zIndex: 9999,
            }}
          />
          <Snowfall
            images={[snowflakes[3]]}
            snowflakeCount={20}
            radius={[12, 26]}
            speed={[0.4, 1.2]}
            wind={[-0.4, 0.4]}
            // rotationSpeed={[0.002, 0.01]}
            style={{
              opacity: 0.8,
              position: "fixed",
              inset: 0,
              pointerEvents: "none",
              zIndex: 9999,
            }}
          />
        </div>
      )}

      <AnimatePresence>
        {princessLore && (
          <motion.div
            className={styles.lore}
            initial={{ opacity: 0, transform: "scale(0.95)" }}
            animate={{ opacity: 1, transform: "scale(1)" }}
            exit={{ opacity: 0, transform: "scale(0.95)" }}
            transition={{
              type: "spring",
              damping: 25,
              stiffness: 120,
              opacity: {
                duration: 0.2,
              },
            }}
          >
            <div style={{ display: "none" }}>
              {Array.from({ length: 14 }, (_, i) => i + 1).map((num) => (
                <Image
                  key={`preload-${num}`}
                  src={`/lore/goodnightgoatlore_${num}.png`}
                  alt=""
                  width={1920}
                  height={1080}
                  priority={true}
                />
              ))}
            </div>

            {lorePos === -1 && (
              <div className={styles.titleGoat}>
                <BlurText
                  text="The Goodnight Goat Lore"
                  delay={75}
                  animateBy="letters"
                  className="text-4xl font-bold text-center max-w-4xl"
                  onAnimationComplete={() => {
                    setTimeout(() => {
                      setLorePos(1);
                    }, 1000);
                  }}
                />
              </div>
            )}

            {/*{lorePos < 14 && (*/}
            {/* <button*/}
            {/* onClick={() => {*/}
            {/* setPrincessLore(false);*/}
            {/* setIsPrincess(true);*/}
            {/* }}*/}
            {/* >*/}
            {/* Skip story*/}
            {/* </button>*/}
            {/*)}*/}

            <AnimatePresence>
              {lorePos > 0 && (
                <motion.div
                  className={styles.loreCtn}
                  initial={{ opacity: 0, transform: "scale(0.95)" }}
                  animate={{ opacity: 1, transform: "scale(1)" }}
                  exit={{ opacity: 0, transform: "scale(0.95)" }}
                  transition={{
                    type: "spring",
                    damping: 25,
                    stiffness: 120,
                    opacity: {
                      duration: 0.2,
                    },
                  }}
                >
                  <div className={styles.imgCtn} ref={imgCtnRef}>
                    <div className={styles.glowCtn}>
                      <GlowEffect
                        colors={
                          lorePos === 12
                            ? [
                                "#0894FF",
                                "#C959DD",
                                "#FF2E54",
                                "#FF9004",
                                "#0894FF",
                                "#C959DD",
                                "#FF2E54",
                                "#FF9004",
                                "#0894FF",
                                "#C959DD",
                                "#FF2E54",
                                "#FF9004",
                              ]
                            : ["#0894FF", "#C959DD", "#FF2E54", "#FF9004"]
                        }
                        mode={lorePos === 12 ? "rotate" : "colorShift"}
                        blur="medium"
                        duration={lorePos === 12 ? 2 : 4}
                      />
                    </div>

                    <div className={styles.controls}>
                      <motion.button
                        className={styles.loreBtn}
                        initial={{
                          transform: "scale(1.5)",
                          filter: "blur(0px) brightness(1)",
                          opacity: 0,
                        }}
                        animate={{
                          transform: lorePos > 1 ? "scale(1)" : "scale(1.5)",
                          filter:
                            lorePos > 1
                              ? "blur(0px) brightness(1)"
                              : "blur(4px) brightness(0.6)",
                          opacity: lorePos > 1 ? 1 : 0,
                        }}
                        exit={{
                          transform: "scale(1.5)",
                          filter: "blur(4px) brightness(0.6)",
                          opacity: 0,
                        }}
                        transition={{
                          type: "spring",
                          damping: 20,
                          stiffness: 120,
                          opacity: { duration: 0.2 },
                        }}
                        whileHover={{
                          transform: "scale(1.1)",
                        }}
                        whileTap={{
                          transform: "scale(0.9)",
                        }}
                        disabled={lorePos <= 1}
                        onClick={() => {
                          playBack();

                          setLoreDirection("prev");

                          if (lorePos > 1) {
                            setLorePos(lorePos - 1);
                          }
                        }}
                      >
                        <BorderTrail
                          style={{
                            boxShadow:
                              "0px 0px 60px 30px rgb(255 255 255 / 50%), 0 0 100px 60px rgb(0 0 0 / 50%), 0 0 140px 90px rgb(0 0 0 / 50%)",
                          }}
                          size={20}
                        />
                        {"<"}
                      </motion.button>
                      <motion.button
                        className={styles.loreBtn}
                        initial={{
                          transform: "scale(1.5)",
                          filter: "blur(0px), brightness(1)",
                          opacity: 0,
                        }}
                        animate={{
                          transform: "scale(1)",
                          filter: "blur(0px) brightness(1)",
                          opacity: 1,
                        }}
                        exit={{
                          transform: "scale(1.5)",
                          filter: "blur(4px), brightness(0.6)",
                          opacity: 0,
                        }}
                        transition={{
                          type: "spring",
                          damping: 20,
                          stiffness: 120,
                          opacity: { duration: 0.2 },
                        }}
                        whileHover={{
                          transform: "scale(1.1)",
                        }}
                        whileTap={{
                          transform: "scale(0.9)",
                        }}
                        onClick={() => {
                          if (lorePos === 14) {
                            setPrincessLore(false);
                            setIsPrincess(true);
                            return;
                          }

                          playNext();

                          setLoreDirection("next");

                          if (lorePos < 14) {
                            setLorePos(lorePos + 1);
                          }
                        }}
                      >
                        <BorderTrail
                          style={{
                            boxShadow:
                              "0px 0px 60px 30px rgb(255 255 255 / 50%), 0 0 100px 60px rgb(0 0 0 / 50%), 0 0 140px 90px rgb(0 0 0 / 50%)",
                          }}
                          size={20}
                        />
                        {`${lorePos == 14 ? "x" : ">"}`}
                      </motion.button>
                    </div>

                    <AnimatePresence mode="popLayout" custom={loreDirection}>
                      {lorePos > 0 && (
                        <motion.div
                          key={lorePos}
                          className={styles.loreImgWrapper}
                          custom={loreDirection}
                          variants={loreImgVariants}
                          initial="initial"
                          animate="animate"
                          exit="exit"
                          transition={{
                            type: "spring",
                            damping: 20,
                            stiffness: 120,
                            opacity: { duration: 0.2 },
                            filter: {
                              duration: 0.2,
                            },
                          }}
                        >
                          <Image
                            src={`/lore/goodnightgoatlore_${lorePos}.png`}
                            alt={"lore"}
                            width={1920}
                            height={1080}
                            className={styles.loreImg}
                            loading={"eager"}
                            decoding={"async"}
                            priority={true}
                          />
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {sparkles.map(
                      ({
                        id,
                        ...props
                      }: {
                        id: number;
                        top: string;
                        left: string;
                        duration: number;
                        delay: number;
                      }) => (
                        <Sparkle
                          key={id}
                          direction="center"
                          {...props}
                          onAnimationComplete={() => handleSparkleComplete(id)}
                        />
                      )
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>

      <Toaster />
      {isPrincess && <Cursor position={position} />}

      {isPrincess && (
        <div className={styles.princessmusicselection}>
          <div className={styles.musicbar}>
            <div>
              <div>Royal FM 443 + 732 KHz</div>
              {/* {duration} */}
              <button
                onClick={() => {
                  setRoyalOptions(!royalOptions);
                }}
              >
                click to toggle options
              </button>
            </div>
            {queue.map((song, idx) => (
              <button
                style={{
                  cursor: isPrincess ? "none" : "default",
                }}
                key={idx}
                className={clsx(
                  styles.selection,
                  musicSelection === idx && styles.selected
                )}
                onClick={(e) => {
                  setMusicSelection(idx);
                }}
              >
                {idx}
              </button>
            ))}
          </div>

          {royalOptions && (
            <div className={styles.musicbar}>
              <div
                style={{
                  padding: "8px 16px",
                }}
              >
                <button
                  onClick={() => {
                    // 	resume pr pause the song
                    if (princessPause) {
                      queue[musicSelection][0]();
                      setPrincessPause(false);
                    } else {
                      queue[princessPlaying][2]();
                      setPrincessPause(true);
                      // setPrincessPlaying(-1);
                    }
                  }}
                >
                  {princessPause ? "Play" : "Stop"}
                </button>
              </div>

              <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
                Volume
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.01}
                  value={volume}
                  onChange={(e) => setVolume(Number(e.target.value))}
                />
                <span>{Math.round(volume * 100)}%</span>
              </label>
            </div>
          )}
        </div>
      )}

      {princessConfirmation && (
        <div className={styles.princessConfirmation}>
          <div className={styles.princessCtn}>
            <div className={styles.princessTitle}>
              <Image
                src={"/emojis/dizzy.png"}
                alt={"royal emoji"}
                width={30}
                height={30}
              />
              <Image
                src={"/emojis/gem-stone.png"}
                alt={"royal emoji"}
                width={30}
                height={30}
              />
              <h1>Royal Confirmation</h1>
              <Image
                src={"/emojis/sparkles.png"}
                alt={"royal emoji"}
                width={30}
                height={30}
              />
              <Image
                src={"/emojis/sparkling-heart.png"}
                alt={"royal emoji"}
                width={30}
                height={30}
              />
            </div>
            Are you sure you want to renounce your title and go back to TRIGGER
            WARNING:
            <Spoiler tagName={"div"} theme="dark" density={0.5}>
              <span className={styles.confirmtxt}>
                <Image
                  src={"/emojis/pile-of-poo.png"}
                  alt={"royal emoji"}
                  width={30}
                  height={30}
                  className={styles.confirmicon}
                />
                <Image
                  src={"/emojis/pile-of-poo.png"}
                  alt={"royal emoji"}
                  width={30}
                  height={30}
                  className={styles.confirmicon}
                />
                poor mode (noob)
                <Image
                  src={"/emojis/pile-of-poo.png"}
                  alt={"royal emoji"}
                  width={30}
                  height={30}
                  className={styles.confirmicon}
                />
                <Image
                  src={"/emojis/pile-of-poo.png"}
                  alt={"royal emoji"}
                  width={30}
                  height={30}
                  className={styles.confirmicon}
                />
              </span>
            </Spoiler>
            You will also lose these royal benefits
            <div className={styles.benefitsctn}>
              <ul>
                <li>💎💫 early premium royal bug fixes</li>
                <li>💎💫 exclusive magical princess wand mouse cursor</li>
                <li>
                  💎💫 royal sound effects to soothe you as you use the website
                  (princess energy 1111 manifest 443 + 732 KHz healing frequency
                  powerful - use with caution and i swear one time at my old job
                  someone did not use with caution and everyone lost their minds
                  over it like genuinely i cannot believe grown adults act this
                  way it was literally the dumbest scenario imaginable because
                  apparently dave from compliance decided to microwave fish in
                  the office kitchen during quarterly reviews and then somehow
                  claire tripped on the power cord of the projector while
                  gagging at the smell and spilled coffee all over the server
                  logs and everyone acted like it was the meltdown of the
                  century even though it was just decaf.
                </li>
              </ul>
            </div>
            <span>Your signature:</span>
            <div
              className={styles.sigBox}
              style={{
                cursor: isPrincess ? "none" : "default",
              }}
            >
              <Stage
                width={250}
                height={75}
                onMouseDown={handleMouseDown}
                onMousemove={handleMouseMove}
                onMouseup={handleMouseUp}
                onTouchStart={handleMouseDown}
                onTouchMove={handleMouseMove}
                onTouchEnd={handleMouseUp}
              >
                <Layer>
                  {/*<Text text="Just start drawing" x={5} y={30} />*/}
                  {lines.map((line: any, i: any) => (
                    <Line
                      key={i}
                      points={line.points}
                      stroke="#ff4646"
                      strokeWidth={5}
                      tension={0.5}
                      lineCap="round"
                      lineJoin="round"
                      globalCompositeOperation={
                        line.tool === "eraser"
                          ? "destination-out"
                          : "source-over"
                      }
                    />
                  ))}
                </Layer>
              </Stage>
            </div>
            <div
              style={{
                display: "flex",
                gap: "32px",
              }}
            >
              <button
                style={{
                  cursor: isPrincess ? "none" : "default",
                }}
                onClick={() => {
                  if (lines.length === 0) {
                    return toast.error("YOU MUST SIGN");
                  }
                  setLines([]);
                  setPrincessConfirmation(false);
                  setIsPrincess(false);

                  playFart();

                  setTimeout(() => {
                    playPoop();
                  }, 750);
                }}
              >
                Confirm
              </button>
              <button
                style={{
                  cursor: isPrincess ? "none" : "default",
                }}
                onClick={() => {
                  setLines([]);
                  playMuhehe();
                  setPrincessConfirmation(false);
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <div className={styles.header}>
        <b>The Goodnight Goat Generator</b>
      </div>

      <button
        onClick={() => {
          if (!isPrincess) {
            playHarp();
            playRain();

            if (firstPrincess) {
              setFirstPrincess(false);
              setPrincessLore(true);
            } else {
              setIsPrincess(true);
            }
            // playPrincess();
          } else {
            setPrincessConfirmation(true);
            playRain();
            playSparkle();
          }
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

      <FileSelection
        onFileInput={onFileInput}
        isPrincess={isPrincess}
        file={file!}
        isDragActive={isDragActive}
      />

      <FilePreview
        show={true}
        fileUrl={fileUrl}
        fileType={fileType}
        goatedImage={goatedImage}
        loading={loading}
        uploadPg={uploadPg}
        isPrincess={isPrincess}
      />

      {fileUrl && (
        <div className={styles.bottombar}>
          <FilePreviewButton
            handlePreview={handlePreview}
            loading={loading}
            isPrincess={isPrincess}
            endTime={endTime}
            timeRemaining={timeRemaining}
          />

          {fileType === "video" && (
            <>
              <p className={styles.bottombartext}>
                what should the fps of the gif be?
              </p>
              <div className={styles.bottombaritem}>
                <SlidingNumber value={parseFloat(fps)} />
                <input
                  style={{
                    cursor: isPrincess ? "none" : "default",
                  }}
                  type="range"
                  min="5"
                  max="15"
                  step="1"
                  defaultValue="10"
                  onChange={(e) => setFps(e.target.value)}
                />
              </div>
            </>
          )}

          <p className={styles.bottombartext}>
            what should each compression quality be?
          </p>
          <div className={styles.bottombaritem}>
            <SlidingNumber value={parseFloat(quality)} />
            <input
              style={{
                cursor: isPrincess ? "none" : "default",
              }}
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
              style={{
                cursor: isPrincess ? "none" : "default",
              }}
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
              style={{
                cursor: isPrincess ? "none" : "default",
              }}
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
              style={{
                cursor: isPrincess ? "none" : "default",
              }}
              type="checkbox"
              checked={posterizebits}
              onChange={(e) => setPosterizebits(e.target.checked)}
            />
          </div>

          <p className={styles.bottombartext}>brightness</p>
          <div className={styles.bottombaritem}>
            <SlidingNumber value={parseFloat(brightness)} />
            <input
              style={{
                cursor: isPrincess ? "none" : "default",
              }}
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
              style={{
                cursor: isPrincess ? "none" : "default",
              }}
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
              style={{
                cursor: isPrincess ? "none" : "default",
              }}
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
              style={{
                cursor: isPrincess ? "none" : "default",
              }}
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
              style={{
                cursor: isPrincess ? "none" : "default",
              }}
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
              style={{
                cursor: isPrincess ? "none" : "default",
              }}
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
                cursor: isPrincess ? "none" : "default",
              }}
              placeholder={"Hello, My Goat :red-heart:"}
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
                style={{
                  cursor: isPrincess ? "none" : "default",
                }}
                type="text"
                value={searchTerm}
                placeholder={"wilted-flower"}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <p>max 100 results to prevent lag</p>
              <p>click to copy the emoji name!</p>
            </div>

            <div className={styles.emojiCtn}>
              <AnimatePresence mode="popLayout">
                {searchResults.map((r) => (
                  <motion.button
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
                    style={{
                      cursor: isPrincess ? "none" : "default",
                    }}
                    onClick={() => {
                      const txt = `:${r}:`;
                      navigator.clipboard.writeText(txt);
                      // toast.success("Copied to clipboard!", {
                      //   id: "copyclipboard",
                      // });
                      console.log("i miss my friends bruh");
                      toast.success("Copied to clipboard!");
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
                  </motion.button>
                ))}
              </AnimatePresence>
            </div>
          </div>
        </div>
      )}

      {fileUrl && (
        <div className={styles.bottombar}>
          <FilePreviewButton
            handlePreview={handlePreview}
            loading={loading}
            isPrincess={isPrincess}
            endTime={endTime}
            timeRemaining={timeRemaining}
          />
        </div>
      )}

      <FilePreview
        show={!!file}
        fileUrl={fileUrl}
        fileType={fileType}
        goatedImage={goatedImage}
        loading={loading}
        uploadPg={uploadPg}
        isPrincess={isPrincess}
      />

      {file && (
        <FileSelection
          onFileInput={onFileInput}
          isPrincess={isPrincess}
          file={file}
          isDragActive={isDragActive}
        />
      )}

      <br />
      <br />
      <br />
      <br />
      <br />
      <br />
      <br />
    </div>
  );
}
