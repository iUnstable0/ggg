"use client";

import { useState, useMemo, useEffect, useRef, useCallback } from "react";

import Image from "next/image";

import { DateTime } from "luxon";
import { motion, AnimatePresence } from "motion/react";

import { Stage, Layer, Line, Text } from "react-konva";

import toast, { Toaster } from "react-hot-toast";

import Fuse from "fuse.js";
import axios from "axios";
import useSound from "use-sound";

import { RgbaColorPicker } from "react-colorful";

import Cursor from "@/components/cursor";

import emojis from "./emojis.json";

import styles from "./page.module.css";
import { SlidingNumber } from "@/components/sliding-number";

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
}: {
  onFileInput: (e) => Promise<void>;
  isPrincess: boolean;
  file: File;
}) {
  return (
    <>
      <input
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
}: {
  show: boolean;
  fileUrl: string | null;
  fileType: string | null;
  goatedImage: string | null;
  loading: boolean;
  uploadPg: number;
}) {
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
    )
  );
}

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
  const [playMuhehe] = useSound("/sounds/muhehe.wav", {
    interrupt: true,
  });

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

  const [endTime, setEndTime] = useState<string | null>(null);
  const [timeRemaining, setTimeRemaining] = useState("5:00");

  const [searchTerm, setSearchTerm] = useState<string>("");

  const [loading, setLoading] = useState<boolean>(false);

  const [uploadPg, setUploadPg] = useState<number>(0);

  const [isPrincess, setIsPrincess] = useState<boolean>(false);
  const [princessConfirmation, setPrincessConfirmation] =
    useState<boolean>(false);

  const [princessPlaying, setPrincessPlaying] = useState<boolean>(false);

  const [position, setPosition] = useState({
    x: 0,
    y: 0,
  });

  const [playPrincess, { stop: stopPrincess }] = useSound("/sounds/poop.wav", {
    interrupt: true,
    onplay: () => setPrincessPlaying(true),
    onend: () => setPrincessPlaying(false),
  });

  const handleMouseDown = (e) => {
    isDrawing.current = true;
    const pos = e.target.getStage().getPointerPosition();
    setLines([...lines, { tool, points: [pos.x, pos.y] }]);
  };

  const handleMouseMove = (e) => {
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

  const onFileInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (!file) return;

    if (file.type.startsWith("video")) {
      if (await videoValid(file)) {
        toast.error(`Video too long max ${VID_LIMIT} secs`);

        e.target.value = "";

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
        },
      );

      setGoatedImage(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/files/${res.data.filename}`,
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

  const previewGoatImage = async (formData) => {
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
        },
      );

      setGoatedImage(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/files/${res.data.filename}`,
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

  return (
    <div
      className={styles.page}
      style={{
        cursor: isPrincess ? "none" : "default",
      }}
    >
      <Toaster />
      {isPrincess && <Cursor position={position} />}

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
            <div className={styles.sigBox}>
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
                  {lines.map((line, i) => (
                    <Line
                      key={i}
                      points={line.points}
                      stroke="#df4b26"
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
                onClick={() => {
                  setLines([]);
                  setPrincessConfirmation(false);
                  setIsPrincess(false);
                  stopPrincess();

                  playFart();

                  setTimeout(() => {
                    playPoop();
                  }, 750);
                }}
              >
                Confirm
              </button>
              <button
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
            setIsPrincess(true);
            playPrincess();
          } else {
            setPrincessConfirmation(true);
            playFart();
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
        file={file}
      />

      <FilePreview
        show={true}
        fileUrl={fileUrl}
        fileType={fileType}
        goatedImage={goatedImage}
        loading={loading}
        uploadPg={uploadPg}
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
                type="text"
                value={searchTerm}
                placeholder={"wilted-flower"}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <p>max 100 results to prevent lag</p>
              <p>click to copy the emoji name!</p>
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
                  </motion.div>
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
      />

      {file && (
        <FileSelection
          onFileInput={onFileInput}
          isPrincess={isPrincess}
          file={file}
        />
      )}
    </div>
  );
}
