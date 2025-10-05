import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import { useState, useEffect, useRef } from "react";
import VideoList from "./components/VideoList";
import MiniPlayer from "./components/MiniPlayer";
import "./App.css";
import searchImage from './assets/search.png'; 
import toast from "react-hot-toast";
function App() {
  const [arr, setArr] = useState([]);
  const [currentVideo, setCurrentVideo] = useState(null);
  const [isMinimized, setIsMinimized] = useState(false);
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
  const [activeTab, setActiveTab] = useState("trending");

  const API_KEY = import.meta.env.VITE_API_KEY;

  const randomNames = [
    "Rahul Sharma", "Priya Verma", "Amit Singh", "Sneha Gupta", 
    "Arjun Patel", "Neha Mehta", "Ravi Kumar", "Anjali Yadav", 
    "Vikram Joshi", "Pooja Rani", "Kabir Khan", "Meera Nair"
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
      // ignore
    }
  }, [reactions]);

  const getReactionObj = (video) => {
    if (!video) return { reaction: null, likes: 0, dislikes: 0 };
    const vid = getVideoId(video);
    return reactions[vid] || { reaction: null, likes: 0, dislikes: 0 };
  };

  const toggleLike = (video) => {
    if (!video) return;
    const vid = getVideoId(video);
    setReactions((prev) => {
      const curr = prev[vid] || { reaction: null, likes: 0, dislikes: 0 };
      const next = { ...curr };

      if (curr.reaction === "like") {
        next.reaction = null;
        next.likes = Math.max(0, (next.likes || 0) - 1);
      } else {
        if (curr.reaction === "dislike") {
          next.dislikes = Math.max(0, (next.dislikes || 0) - 1);
        }
        next.reaction = "like";
        next.likes = (next.likes || 0) + 1;
      }

      return { ...prev, [vid]: next };
    });
  };
  
const handleShare = (video) => {
  if (!video) return;


  const videoId = video?.id?.videoId || video?.id;
  const link = `https://www.youtube.com/watch?v=${videoId}`;

  
  navigator.clipboard
    .writeText(link)
    .then(() => {
      toast.success("Link copied to clipboard!");
    })
    .catch(() => {
      toast.error("Failed to copy link!");
    });
};
 


  const toggleDislike = (video) => {
    if (!video) return;
    const vid = getVideoId(video);
    setReactions((prev) => {
      const curr = prev[vid] || { reaction: null, likes: 0, dislikes: 0 };
      const next = { ...curr };

      if (curr.reaction === "dislike") {
        next.reaction = null;
        next.dislikes = Math.max(0, (next.dislikes || 0) - 1);
      } else {
        if (curr.reaction === "like") {
          next.likes = Math.max(0, (next.likes || 0) - 1);
        }
        next.reaction = "dislike";
        next.dislikes = (next.dislikes || 0) + 1;
      }

      return { ...prev, [vid]: next };
    });
  };

  const mainPlayerRef = useRef(null);
  const miniSlotRef = useRef(null);
  const playerRef = useRef(null);
  const ytReadyRef = useRef(false);
  const queueRef = useRef(queue);
  const currentTimeRef = useRef(0);

  const addToQueue = (video) => {
    setQueue((prev) => [...prev, video]);
  };

  const addToHistory = (video) => {
    const vid = getVideoId(video);
    const newHistory = [video, ...watchHistory.filter((h) => getVideoId(h) !== vid)];
    const limited = newHistory.slice(0, 20);
    setWatchHistory(limited);
    localStorage.setItem("watchHistory", JSON.stringify(limited));
  };

  const addComment = () => {
    if (!newComment.trim() || !currentVideo) return;

    const vid = getVideoId(currentVideo);
    const randomName = randomNames[Math.floor(Math.random() * randomNames.length)];

    const updated = {
      ...comments,
      [vid]: [...(comments[vid] || []), { 
        name: randomName, 
        text: newComment.trim(),
        timestamp: new Date().toLocaleString()
      }],
    };

    setComments(updated);
    localStorage.setItem("comments", JSON.stringify(updated));
    setNewComment("");
  };

  useEffect(() => {
    queueRef.current = queue;
  }, [queue]);

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

  useEffect(() => {
    axios
      .get("https://www.googleapis.com/youtube/v3/videos", {
        params: { 
          part: "snippet", 
          chart: "mostPopular", 
          regionCode: "IN", 
          maxResults: 9, 
          key: API_KEY 
        },
      })
      .then((res) => setTrending(res.data.items))
      .catch(() => console.log("⚠️ Error fetching trending videos"));
  }, []);

  const handleSearch = (isLoadMore = false) => {
    if (!isLoadMore && txt.trim() === "") return;
    setLoading(true);
    setError("");

    axios
      .get("https://www.googleapis.com/youtube/v3/search", {
        params: { 
          part: "snippet", 
          type: "video", 
          maxResults: 9, 
          q: txt, 
          pageToken: isLoadMore ? nextPage : "", 
          key: API_KEY 
        },
      })
      .then((response) => {
        setNextPage(response.data.nextPageToken || "");
        if (isLoadMore) setArr((prev) => [...prev, ...response.data.items]);
        else setArr(response.data.items);
        setLoading(false);
        setActiveTab("search");

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

  const seekTo = (time) => {
    try {
      if (playerRef.current && typeof playerRef.current.seekTo === "function") {
        playerRef.current.seekTo(time, true);
      }
    } catch {
      // intentionally empty
    }
  };

  const minimizeCurrent = () => {
    if (!currentVideo) return;
    currentTimeRef.current = getCurrentTime();
    setIsMinimized(true);
  };

  const expandMini = () => {
    if (!currentVideo) return;
    if (currentTimeRef.current > 0) {
      setTimeout(() => seekTo(currentTimeRef.current), 100);
    }
    setIsMinimized(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

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
                setQueue((prev) => prev.slice(1));
                console.log("▶️ Playing next from queue:", next?.snippet?.title);
                handlePlay(next);
              } else {
                console.log("⏹ Queue empty, nothing to play");
              }
            }
          }
        }
      });

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

  const handlePlay = (video) => {
    console.log("[DEBUG] handlePlay video:", video?.snippet?.title);
    const id = getVideoId(video);

    setCurrentVideo(video);
    setIsMinimized(false);
    addToHistory(video);

    if (playerRef.current) {
      playerRef.current.loadVideoById(id, 0);
    } else {
      ensurePlayer(id, 0);
    }

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  useEffect(() => {
    if (!playerRef.current) return;

    const iframe = playerRef.current.getIframe();
    if (!iframe) return;

    if (isMinimized && miniSlotRef.current) {
      miniSlotRef.current.innerHTML = "";
      miniSlotRef.current.appendChild(iframe);
      iframe.style.width = "320px";
      iframe.style.height = "190px";
      console.log("[DEBUG] iframe moved to Mini");
    } else if (!isMinimized && mainPlayerRef.current) {
      mainPlayerRef.current.innerHTML = "";
      mainPlayerRef.current.appendChild(iframe);
      iframe.style.width = "100%";
      iframe.style.height = "500px";
      console.log("[DEBUG] iframe moved to Main");

      if (currentTimeRef.current > 0) {
        setTimeout(() => seekTo(currentTimeRef.current), 100);
      }
    }
  }, [isMinimized]);

  const renderMainPlayer = () => {
    if (!currentVideo || isMinimized) return null;

    const reactionObj = getReactionObj(currentVideo);

    return (
      <div className="main-player-container mb-4">
        <div className="player-header">
          <h4 className="player-title">
            <i className="bi bi-play-circle-fill me-2"></i>
            Now Playing
          </h4>
          <button className="btn btn-outline-light btn-sm minimize-btn" onClick={minimizeCurrent} title="Minimize">
            <i className="bi bi-dash-lg"></i> Minimize
          </button>
        </div>
        
        <div ref={mainPlayerRef} className="video-player" />
        
        <div className="video-info mt-3">
          <h5 className="video-title">{currentVideo.snippet.title}</h5>
          <p className="channel-name text-muted">
            <i className="bi bi-person-circle me-1"></i>
            {currentVideo.snippet.channelTitle}
          </p>
          
          <div className="reactions-section">
            <button
              className={`btn reaction-btn ${reactionObj.reaction === "like" ? "btn-primary" : "btn-outline-primary"}`}
              onClick={() => toggleLike(currentVideo)}
            >
              <i className="bi bi-hand-thumbs-up"></i> Like {reactionObj.likes || 0}
            </button>

            <button
              className={`btn reaction-btn ${reactionObj.reaction === "dislike" ? "btn-danger" : "btn-outline-danger"}`}
              onClick={() => toggleDislike(currentVideo)}
            >
              <i className="bi bi-hand-thumbs-down"></i> Dislike {reactionObj.dislikes || 0}
            </button>

            <button className="btn btn-outline-secondary" onClick={() => handleShare(currentVideo)}>
              <i className="bi bi-share"></i> Share
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderContent = () => {
    switch (activeTab) {
      case "search":
        return arr.length > 0 ? (
          <VideoList 
            videos={arr} 
            onPlay={handlePlay} 
            onFavorite={addToFavorites} 
            darkMode={darkMode} 
            onQueue={addToQueue} 
          />
        ) : (
          <div className="empty-state text-center py-5">
            <i className="bi bi-search display-1 text-muted"></i>
            <h4>No videos found</h4>
            <p className="text-muted">Try searching for something else</p>
          </div>
        );
      
      case "favorites":
        return favorites.length > 0 ? (
          <VideoList 
            videos={favorites} 
            onPlay={handlePlay} 
            onRemove={removeFromFavorites} 
            isFavorite 
            darkMode={darkMode} 
            onQueue={addToQueue} 
          />
        ) : (
          <div className="empty-state text-center py-5">
            <i className="bi bi-star display-1 text-muted"></i>
            <h4>No favorites yet</h4>
            <p className="text-muted">Start adding videos to your favorites</p>
          </div>
        );
      
      case "history":
        return watchHistory.length > 0 ? (
          <VideoList 
            videos={watchHistory}
            onPlay={handlePlay}
            onFavorite={addToFavorites}
            darkMode={darkMode}
          />
        ) : (
          <div className="empty-state text-center py-5">
            <i className="bi bi-clock-history display-1 text-muted"></i>
            <h4>No watch history</h4>
            <p className="text-muted">Your watched videos will appear here</p>
          </div>
        );
      
      default:
        return <VideoList videos={trending} onPlay={handlePlay} onFavorite={addToFavorites} darkMode={darkMode} onQueue={addToQueue} />;
    }
  };

  return (
    <div className={`youtube-app ${darkMode ? "dark-mode" : "light-mode"}`}>
      {/* Header */}
      <header className="app-header">
        <div className="container">
          <div className="header-content">
            <div className="brand-section">
              <h1 className="brand">
                <i className="bi bi-play-btn-fill text-danger me-2"></i>
                VideoStream
              </h1>
            </div>
            
            <div className="search-section">
              <div className="search-box">
                <input 
                  type="text" 
                  className="search-input" 
                  placeholder="Search videos..." 
                  value={txt} 
                  onChange={(e) => setTxt(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()} 
                />
                <button className="search-btn" onClick={() => handleSearch()}>
                  <img src={searchImage} alt="Search" height="25" />
                </button>
              </div>
            </div>

            <div className="controls-section">
              <div className="theme-toggle">
                <label className="theme-switch">
                  <input 
                    type="checkbox" 
                    checked={darkMode} 
                    onChange={() => setDarkMode(!darkMode)} 
                  />
                  <span className="slider">
                    <i className="bi bi-sun"></i>
                    <i className="bi bi-moon"></i>
                  </span>
                </label>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="main-content">
        <div className="container">
          <div className="content-wrapper">
            {/* Sidebar */}
            <aside className="sidebar">
              <nav className="sidebar-nav">
                <button 
                  className={`nav-item ${activeTab === "trending" ? "active" : ""}`}
                  onClick={() => setActiveTab("trending")}
                >
                  <i className="bi bi-fire"></i>
                  <span>Trending</span>
                </button>
                
                <button 
                  className={`nav-item ${activeTab === "search" ? "active" : ""}`}
                  onClick={() => setActiveTab("search")}
                >
                  <i className="bi bi-search"></i>
                  <span>Search Results</span>
                </button>
                
                <button 
                  className={`nav-item ${activeTab === "favorites" ? "active" : ""}`}
                  onClick={() => setActiveTab("favorites")}
                >
                  <i className="bi bi-star"></i>
                  <span>Favorites</span>
                  {favorites.length > 0 && <span className="badge">{favorites.length}</span>}
                </button>
                
                <button 
                  className={`nav-item ${activeTab === "history" ? "active" : ""}`}
                  onClick={() => setActiveTab("history")}
                >
                  <i className="bi bi-clock-history"></i>
                  <span>History</span>
                </button>
              </nav>

              {/* Recent Searches */}
              {history.length > 0 && (
                <div className="recent-searches">
                  <h6>Recent Searches</h6>
                  <div className="search-tags">
                    {history.map((h, i) => (
                      <button 
                        key={i} 
                        className={`search-tag btn btn-sm ${darkMode ? "btn-outline-light" : "btn-outline-dark"}`}
                        onClick={() => { setTxt(h); handleSearch(); }}
                      >
                        {h}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </aside>

            {/* Main Area */}
            <div className="main-area">
              {/* Video Player */}
              {renderMainPlayer()}

              {/* Queue */}
              {queue.length > 0 && (
                <div className="queue-section">
                  <h5 className="queue-title">
                    <i className="bi bi-list-ul me-2"></i>
                    Up Next ({queue.length})
                  </h5>
                  <div className="queue-list">
                    {queue.map((v, i) => (
                      <div key={i} className="queue-item">
                        <img 
                          src={v.snippet.thumbnails.default.url} 
                          alt={v.snippet.title}
                          className="queue-thumbnail"
                        />
                        <div className="queue-info">
                          <span className="queue-title">{v.snippet.title}</span>
                        </div>
                        <button
                          className="queue-remove"
                          onClick={() => setQueue(queue.filter((_, idx) => idx !== i))}
                        >
                          <i className="bi bi-x"></i>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Comments */}
              {currentVideo && (
                <div className="comments-section">
                  <h5 className="comments-title">
                    <i className="bi bi-chat-dots me-2"></i>
                    Comments ({(comments[getVideoId(currentVideo)] || []).length})
                  </h5>

                  <div className="comment-form">
                    <img
                      src="https://www.gravatar.com/avatar/?d=identicon&s=40"
                      alt="avatar"
                      className="comment-avatar"
                    />
                    <div className="comment-input-container">
                      <input
                        type="text"
                        className="comment-input"
                        placeholder="Add a comment..."
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && addComment()}
                      />
                      <button className="comment-submit" onClick={addComment}>
                        comment
                      </button>
                    </div>
                  </div>

                  <div className="comments-list">
                    {(comments[getVideoId(currentVideo)] || []).map((c, i) => (
                      <div key={i} className="comment-item">
                        <img
                          src="https://www.gravatar.com/avatar/?d=identicon&s=40"
                          alt="avatar"
                          className="comment-avatar"
                        />
                        <div className="comment-content">
                          <div className="comment-header">
                            <strong>{c.name}</strong>
                            <span className="comment-time">{c.timestamp}</span>
                          </div>
                          <p className="comment-text">{c.text}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Loading and Error States */}
              {loading && (
                <div className="loading-state text-center py-4">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                  <p className="mt-2">Searching videos...</p>
                </div>
              )}

              {error && (
                <div className="error-state alert alert-danger text-center">
                  <i className="bi bi-exclamation-triangle me-2"></i>
                  {error}
                </div>
              )}

              {/* Content */}
              <section className="videos-section">
                <div className="section-header">
                  <h4 className="section-title">
                    {activeTab === "trending" && <><i className="bi bi-fire me-2"></i>Trending Videos</>}
                    {activeTab === "search" && <><i className="bi bi-search me-2"></i>Search Results</>}
                    {activeTab === "favorites" && <><i className="bi bi-star me-2"></i>Your Favorites</>}
                    {activeTab === "history" && <><i className="bi bi-clock-history me-2"></i>Watch History</>}
                  </h4>
                  
                  {activeTab === "search" && nextPage && (
                    <button className="load-more-btn" onClick={() => handleSearch(true)}>
                      <i className="bi bi-arrow-down me-1"></i>Load More
                    </button>
                  )}
                </div>

                {renderContent()}
              </section>
            </div>
          </div>
        </div>
      </main>

      {/* Mini Player */}
      <MiniPlayer
        video={isMinimized ? currentVideo : null}
        slotRef={miniSlotRef}
        onClose={closeMini}
        onExpand={expandMini}
        darkMode={darkMode}
      />
    </div>
  );
}

export default App;