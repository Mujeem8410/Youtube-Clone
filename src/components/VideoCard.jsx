import React from "react";

function VideoCard({ video, onPlay, onFavorite, onRemove, isFavorite, darkMode, onQueue }) {
  const title = video.snippet?.title || "";
  const shortTitle = title.length > 60 ? title.slice(0, 57) + "..." : title;
  const cardClass = `card h-100 shadow-sm ${isFavorite ? "border-warning" : ""} ${darkMode ? "bg-secondary text-white" : "bg-white text-dark"}`;

  return (
    <div className="col-md-4 mb-4">
      <div className={cardClass}>
        <img src={video.snippet.thumbnails.medium.url} className="card-img-top" alt={video.snippet.title} />
        <div className="card-body d-flex flex-column">
          <h5 className="card-title">{shortTitle.slice(0, 50)}...</h5>
          <p className="text-muted small mb-3">{video.snippet.channelTitle.slice(0, 30)}...</p>

          {/* Play Button: pass whole video object */}
          <button className="btn btn-danger w-100 mb-2" onClick={() => onPlay(video)}>
            ▶️ Play
          </button>
          <button
            className="btn btn-info mt-2 mb-2"
            onClick={() => onQueue(video)}
          >
            ➕ Add to Queue
          </button>

          {/* Favorite / Remove */}
          {onFavorite && (
            <button className="btn btn-outline-warning w-100 mb-2" onClick={() => onFavorite(video)}>
              ⭐ Add to Favorites
            </button>
          )}
          {onRemove && (
            <button className="btn btn-outline-danger w-100" onClick={() => onRemove(video)}>
              ❌ Remove
            </button>
          )}

          <div style={{ flex: 1 }} />
        </div>
      </div>
    </div>
  );
}

export default VideoCard;
