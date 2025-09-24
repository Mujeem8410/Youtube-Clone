import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import { useState, useEffect, useRef } from "react";
import VideoList from "./components/VideoList";
import MiniPlayer from "./components/MiniPlayer";
import "./App.css";


function App() {
  const [arr, setArr] = useState([]);
  const [currentVideo, setCurrentVideo] = useState(null);
  const [isMinimized, setIsMinimized] = useState(false); // Track minimize state
  const [txt, setTxt] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [nextPage, setNextPage] = useState("");
  const [darkMode, setDarkMode] = useState(false);
  const [queue, setQueue] = useState([]);
  const [watchHistory, setWatchHistory] = useState(
    JSON.parse(localStorage.getItem("watchHistory")) || []
  );
  const [comments, setComments] = useState(
    JSON.parse(localStorage.getItem("comments")) || {}
  );
  const [newComment, setNewComment] = useState("");


  const [history, setHistory] = useState(JSON.parse(localStorage.getItem("history")) || []);
  const [trending, setTrending] = useState([]);
  const [favorites, setFavorites] = useState(JSON.parse(localStorage.getItem("favorites")) || []);

  const API_KEY = import.meta.env.VITE_API_KEY;

  const randomNames = [
    "Rahul Sharma",
    "Priya Verma",
    "Amit Singh",
    "Sneha Gupta",
    "Arjun Patel",
    "Neha Mehta",
    "Ravi Kumar",
    "Anjali Yadav",
    "Vikram Joshi",
    "Pooja Rani",
    "Kabir Khan",
    "Meera Nair"
  ];

const [reactions, setReactions] = useState(() => {
  try {
    return JSON.parse(localStorage.getItem("reactions")) || {};
  } catch {
    return {};
  }
});

useEffect(() => {
  try {
    localStorage.setItem("reactions", JSON.stringify(reactions));
  } catch {
    //ignore
  }
}, [reactions]);


// get reaction object for a video (never returns undefined)
const getReactionObj = (video) => {
  if (!video) return { reaction: null, likes: 0, dislikes: 0 };
  const vid = getVideoId(video);
  return reactions[vid] || { reaction: null, likes: 0, dislikes: 0 };
};

// toggle like (mutually exclusive with dislike)
const toggleLike = (video) => {
  if (!video) return;
  const vid = getVideoId(video);
  setReactions((prev) => {
    const curr = prev[vid] || { reaction: null, likes: 0, dislikes: 0 };
    const next = { ...curr };

    if (curr.reaction === "like") {
      // undo like
      next.reaction = null;
      next.likes = Math.max(0, (next.likes || 0) - 1);
    } else {
      // switching from dislike -> like or neutral -> like
      if (curr.reaction === "dislike") {
        next.dislikes = Math.max(0, (next.dislikes || 0) - 1);
      }
      next.reaction = "like";
      next.likes = (next.likes || 0) + 1;
    }

    return { ...prev, [vid]: next };
  });
};

// toggle dislike (mutually exclusive)
const toggleDislike = (video) => {
  if (!video) return;
  const vid = getVideoId(video);
  setReactions((prev) => {
    const curr = prev[vid] || { reaction: null, likes: 0, dislikes: 0 };
    const next = { ...curr };

    if (curr.reaction === "dislike") {
      // undo dislike
      next.reaction = null;
      next.dislikes = Math.max(0, (next.dislikes || 0) - 1);
    } else {
      // switching from like -> dislike or neutral -> dislike
      if (curr.reaction === "like") {
        next.likes = Math.max(0, (next.likes || 0) - 1);
      }
      next.reaction = "dislike";
      next.dislikes = (next.dislikes || 0) + 1;
    }

    return { ...prev, [vid]: next };
  });
};




  // Refs for containers and player
  const mainPlayerRef = useRef(null);
  const miniSlotRef = useRef(null);
  const playerRef = useRef(null);
  const ytReadyRef = useRef(false);
  const queueRef = useRef(queue);

  // Store current playback time
  const currentTimeRef = useRef(0);

  const addToQueue = (video) => {
    setQueue((prev) => [...prev, video]);
    console.log("✅ Added to queue:", video?.snippet?.title);
  };

  const addToHistory = (video) => {
    const vid = getVideoId(video);
    const newHistory = [video, ...watchHistory.filter((h) => getVideoId(h) !== vid)];
    const limited = newHistory.slice(0, 20); // max 20 items
    setWatchHistory(limited);
    localStorage.setItem("watchHistory", JSON.stringify(limited));
  };

  const addComment = () => {
    if (!newComment.trim() || !currentVideo) return;

    const vid = getVideoId(currentVideo);
    const randomName = randomNames[Math.floor(Math.random() * randomNames.length)];

    const updated = {
      ...comments,
      [vid]: [...(comments[vid] || []), { name: randomName, text: newComment.trim() }],
    };

    setComments(updated);
    localStorage.setItem("comments", JSON.stringify(updated));
    setNewComment(""); // reset box
  };


  useEffect(() => {
    queueRef.current = queue;
  }, [queue]);

  // Load YouTube API
  const loadYouTubeApi = () =>
    new Promise((resolve) => {
      if (window.YT && window.YT.Player) {
        ytReadyRef.current = true;
        return resolve(window.YT);
      }

      if (document.getElementById("youtube-iframe-api")) {
        window.onYouTubeIframeAPIReady = () => {
          ytReadyRef.current = true;
          resolve(window.YT);
        };
        return;
      }

      const tag = document.createElement("script");
      tag.id = "youtube-iframe-api";
      tag.src = "https://www.youtube.com/iframe_api";
      const firstScriptTag = document.getElementsByTagName("script")[0];
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
      window.onYouTubeIframeAPIReady = () => {
        ytReadyRef.current = true;
        resolve(window.YT);
      };
    });

  // Fetch trending on load
  useEffect(() => {
    axios
      .get("https://www.googleapis.com/youtube/v3/videos", {
        params: { part: "snippet", chart: "mostPopular", regionCode: "IN", maxResults: 9, key: API_KEY },
      })
      .then((res) => setTrending(res.data.items))
      .catch(() => console.log("⚠️ Error fetching trending videos"));
  }, []);

  // Search function
  const handleSearch = (isLoadMore = false) => {
    if (!isLoadMore && txt.trim() === "") return;
    setLoading(true);
    setError("");

    axios
      .get("https://www.googleapis.com/youtube/v3/search", {
        params: { part: "snippet", type: "video", maxResults: 9, q: txt, pageToken: isLoadMore ? nextPage : "", key: API_KEY },
      })
      .then((response) => {
        setNextPage(response.data.nextPageToken || "");
        if (isLoadMore) setArr((prev) => [...prev, ...response.data.items]);
        else setArr(response.data.items);
        setLoading(false);

        if (!isLoadMore) {
          const newHistory = [txt, ...history.filter((h) => h !== txt)];
          setHistory(newHistory.slice(0, 5));
          localStorage.setItem("history", JSON.stringify(newHistory.slice(0, 5)));
        }
      })
      .catch(() => {
        setError("⚠️ API quota exceeded or something went wrong.");
        setLoading(false);
      });
  };

  // Favorites helpers
  const getVideoId = (v) => (v?.id?.videoId ? v.id.videoId : typeof v.id === "string" ? v.id : v.id);
  const addToFavorites = (video) => {
    const vid = getVideoId(video);
    if (favorites.find((f) => getVideoId(f) === vid)) return;
    const newFavs = [video, ...favorites];
    setFavorites(newFavs);
    localStorage.setItem("favorites", JSON.stringify(newFavs));
  };
  const removeFromFavorites = (video) => {
    const vid = getVideoId(video);
    const newFavs = favorites.filter((f) => getVideoId(f) !== vid);
    setFavorites(newFavs);
    localStorage.setItem("favorites", JSON.stringify(newFavs));
  };

  // Get current playback time
  const getCurrentTime = () => {
    try {
      if (playerRef.current && typeof playerRef.current.getCurrentTime === "function") {
        return playerRef.current.getCurrentTime();
      }
    } catch {
      // intentionally empty
    }
    return 0;
  };

  // Seek to a specific time
  const seekTo = (time) => {
    try {
      if (playerRef.current && typeof playerRef.current.seekTo === "function") {
        playerRef.current.seekTo(time, true);
      }
    } catch {
      // intentionally empty
    }
  };

  // Minimize player
  const minimizeCurrent = () => {
    if (!currentVideo) return;

    // Save current time
    currentTimeRef.current = getCurrentTime();

    // Just change UI state, don't destroy player
    setIsMinimized(true);
  };

  // Expand player
  const expandMini = () => {
    if (!currentVideo) return;

    // Restore to previous time
    if (currentTimeRef.current > 0) {
      setTimeout(() => seekTo(currentTimeRef.current), 100);
    }

    // Change UI state
    setIsMinimized(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Close mini player
  const closeMini = () => {
    try {
      if (playerRef.current) {
        playerRef.current.stopVideo();
        playerRef.current.destroy();
        playerRef.current = null;
      }
    } catch {
      // ignore
    }
    setCurrentVideo(null);
    setIsMinimized(false);
  };

  // Create or update player
  const ensurePlayer = async (videoId, startTime = 0) => {
    if (!videoId) {
      console.warn("⚠️ No videoId provided");
      return;
    }

    await loadYouTubeApi();

    if (!playerRef.current) {
      console.log("🎬 Creating new player with ID:", videoId);

      const div = document.createElement("div");
      playerRef.current = new window.YT.Player(div, {
        height: "500",
        width: "100%",
        videoId: videoId,
        playerVars: {
          autoplay: 1,
          rel: 0,
          mute: 0,
        },
        events: {
          onReady: (event) => {
            console.log("✅ Player Ready");
            event.target.playVideo();
          },
          onStateChange: (event) => {
            if (event.data === window.YT.PlayerState.ENDED) {
              console.log("🎵 Video ended");
              if (queueRef.current.length > 0) {
                const next = queueRef.current[0];
                setQueue((prev) => prev.slice(1)); // remove from queue
                console.log("▶️ Playing next from queue:", next?.snippet?.title);
                handlePlay(next); // play next
              } else {
                console.log("⏹ Queue empty, nothing to play");
              }
            }
          }

        }
      });

      // Attach iframe to main player container
      setTimeout(() => {
        const iframe = playerRef.current?.getIframe();
        if (mainPlayerRef.current && iframe) {
          mainPlayerRef.current.innerHTML = "";
          mainPlayerRef.current.appendChild(iframe);
        }
      }, 500);
    } else {
      console.log("♻️ Reusing player for ID:", videoId);
      playerRef.current.loadVideoById({
        videoId: videoId,
        startSeconds: startTime
      });
    }
  };

  // Handle play video
  const handlePlay = (video) => {
    console.log("[DEBUG] handlePlay video:", video?.snippet?.title);
    const id = getVideoId(video);

    setCurrentVideo(video);
    setIsMinimized(false);
    addToHistory(video);

    // If same player exists, just load new video
    if (playerRef.current) {
      playerRef.current.loadVideoById(id, 0);
    } else {
      ensurePlayer(id, 0);
    }

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Move player between containers based on minimize state
  useEffect(() => {
    if (!playerRef.current) return;

    const iframe = playerRef.current.getIframe();
    if (!iframe) return;

    if (isMinimized && miniSlotRef.current) {
      // Move to mini player
      miniSlotRef.current.innerHTML = "";
      miniSlotRef.current.appendChild(iframe);
      iframe.style.width = "320px";
      iframe.style.height = "190px";
      console.log("[DEBUG] iframe moved to Mini");
    } else if (!isMinimized && mainPlayerRef.current) {
      // Move to main player
      mainPlayerRef.current.innerHTML = "";
      mainPlayerRef.current.appendChild(iframe);
      iframe.style.width = "100%";
      iframe.style.height = "500px";
      console.log("[DEBUG] iframe moved to Main");

      // Restore playback time if we have it
      if (currentTimeRef.current > 0) {
        setTimeout(() => seekTo(currentTimeRef.current), 100);
      }
    }
  }, [isMinimized]);

  // Render main player container
  const renderMainPlayer = () => {
    if (!currentVideo || isMinimized) return null;

    return (
      <div className="mb-4" style={{ position: "relative" }}>
        <div style={{ position: "absolute", right: 12, top: 12, zIndex: 20 }}>
          <button className="btn btn-sm btn-light me-2" onClick={minimizeCurrent} title="Minimize">
            ➖
          </button>
        </div>
        

        <div ref={mainPlayerRef} style={{ width: "100%", minHeight: 500, background: "#000" }} />
        <div className={`mt-2 ${darkMode ? "text-light" : "text-dark"}`}>
          <h5>{currentVideo.snippet.title}</h5>
          <small className="text-muted">{currentVideo.snippet.channelTitle}</small>
           <div className="d-flex align-items-center gap-2 mt-2">
      {(() => {
        const r = getReactionObj(currentVideo);
        return (
          <>
            <button
              className={r.reaction === "like" ? "btn btn-primary" : "btn btn-outline-primary"}
              onClick={() => toggleLike(currentVideo)}
            >
              👍 {r.likes || 0}
            </button>

            <button
              className={r.reaction === "dislike" ? "btn btn-danger" : "btn btn-outline-danger"}
              onClick={() => toggleDislike(currentVideo)}
            >
              👎 {r.dislikes || 0}
            </button>
          </>
        );
      })()}
    </div>
        </div>
      </div>
      
    );
  };

  return (
    <div className={darkMode ? "bg-dark text-light min-vh-100" : "bg-light text-dark min-vh-100"}>
      <div className="container">
        <h2 className="text-center mb-4" style={{ paddingTop: 20 }}>
          🎬 YouTube Video Search
        </h2>
        <div className="form-check form-switch text-end mb-3">
          <input className="form-check-input" type="checkbox" checked={darkMode} onChange={() => setDarkMode(!darkMode)} id="darkModeSwitch" />
          <label className="form-check-label" htmlFor="darkModeSwitch">
            {darkMode ? "🌙 Dark" : "☀️ Light"}
          </label>
        </div>

        {/* Input + Button */}
        <div className="input-group mb-3">
          <input type="text" className="form-control" placeholder="Search YouTube Videos..." value={txt} onChange={(e) => setTxt(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleSearch()} />
          <button className="btn btn-primary" onClick={() => handleSearch()}>
            🔍 Search
          </button>
        </div>



        {/* Recent Searches */}
        {history.length > 0 && (
          <div className="mb-3">
            <strong>Recent Searches: </strong>
            {history.map((h, i) => (
              <button key={i} className={`btn btn-outline-secondary btn-sm mx-1 ${darkMode ? "bg-light text-dark" : "bg-black text-light"}`} onClick={() => { setTxt(h); handleSearch(); }}>
                {h}
              </button>
            ))}
          </div>
        )}


        {loading && <p className="text-center">⏳ Loading...</p>}
        {error && <p className="text-center text-danger">{error}</p>}

        {/* MAIN PLAYER area */}
        {renderMainPlayer()}
        {queue.length > 0 && (
          <div className="mt-4 mb-2">
            <h5>🎶 Up Next</h5>
            <ul className="list-group">
              {queue.map((v, i) => (
                <li key={i} className="list-group-item d-flex justify-content-between">
                  {v.snippet.title}
                  <button
                    className="btn btn-sm  btn-outline-danger"
                    onClick={() => setQueue(queue.filter((_, idx) => idx !== i))}
                  >
                    ❌
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {currentVideo && (
          <div className="mt-3">
            <h5>💬 Comments</h5>

            {/* Add Comment Box */}
            <div className="d-flex align-items-start mb-3">
              <img
                src="https://www.gravatar.com/avatar/?d=mp&s=40"
                alt="avatar"
                className="rounded-circle me-2"
              />
              <input
                type="text"
                className={`form-control comment-input ${darkMode ? "bg-dark text-light" : "bg-white text-dark"
                  }`}
                placeholder="Add a comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addComment()}
              />
              <button className="btn btn-primary ms-2" onClick={addComment}>
                ➕
              </button>
            </div>

            {/* Show Comments */}
            <ul className="list-unstyled">
              {(comments[getVideoId(currentVideo)] || []).map((c, i) => (
                <li key={i} className="d-flex align-items-start mb-3">
                  <img
                    src="https://www.gravatar.com/avatar/?d=mp&s=40"
                    alt="avatar"
                    className="rounded-circle me-2 color-border"
                  />
                  <div>
                    <strong>{c.name}</strong>
                    <p
                      className={`mb-1 ${darkMode ? "text-light" : "text-dark"}`}
                      style={{ whiteSpace: "pre-line" }}
                    >
                      {c.text}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}


        {/* Search Results */}

        {arr.length > 0 && (
          <>
            <h3 className="mb-3">🔎 Search Results</h3>
            <VideoList videos={arr} onPlay={handlePlay} onFavorite={addToFavorites} darkMode={darkMode} onQueue={addToQueue} />
            {nextPage && (
              <div className="text-center my-3">
                <button className="btn btn-outline-primary" onClick={() => handleSearch(true)}>
                  ⏭️ Load More
                </button>
              </div>
            )}
          </>
        )}

        {/* Trending */}
        {arr.length === 0 && (
          <>
            <h3 className="mb-3">🔥 Trending in India</h3>
            <VideoList videos={trending} onPlay={handlePlay} onFavorite={addToFavorites} darkMode={darkMode} onQueue={addToQueue} />
          </>
        )}

        {/* Favorites */}
        {favorites.length > 0 && (
          <>
            <h3 className="mb-3">⭐ Favorites</h3>
            <VideoList videos={favorites} onPlay={handlePlay} onRemove={removeFromFavorites} isFavorite darkMode={darkMode} onQueue={addToQueue} />
          </>
        )}
        {/* Watch History */}
        {watchHistory.length > 0 && (
          <>
            <h3 className="mb-3">📜 Watch History</h3>
            <VideoList
              videos={watchHistory}
              onPlay={handlePlay}
              onFavorite={addToFavorites}
              darkMode={darkMode}
            />
          </>
        )}

      </div>

      {/* MINI PLAYER */}
      <MiniPlayer
        video={isMinimized ? currentVideo : null}
        slotRef={miniSlotRef}
        onClose={closeMini}
        onExpand={expandMini}
      />
    </div>
  );
}

export default App;