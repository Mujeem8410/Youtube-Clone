import React from "react";
import "../App.css";

function VideoCard({ video, onPlay, onFavorite, onRemove, isFavorite, darkMode, onQueue }) {
  
  const title = video.snippet?.title || "";
  const shortTitle = title.length > 60 ? title.slice(0, 57) + "..." : title;
  const channel = video.snippet.channelTitle;
  const shortChannel = channel.length > 30 ? channel.slice(0, 27) + "..." : channel;

  return (
    <div className="col-xl-4 col-lg-6 col-md-6 mb-4">
      <div className={`card h-100 shadow-sm ${isFavorite ? "border-warning" : ""} ${darkMode ? "bg-dark text-light" : "bg-light"}`}>
        
        {/* Thumbnail with Hover Effect */}
        <div className="position-relative overflow-hidden">
          <img 
            src={video.snippet.thumbnails.medium.url} 
            className="card-img-top" 
            alt={title}
            style={{ 
              height: "180px", 
              objectFit: "cover", 
              cursor: "pointer",
              transition: "transform 0.3s ease"
            }}
            onClick={() => onPlay(video)}
            onMouseEnter={(e) => e.target.style.transform = "scale(1.05)"}
            onMouseLeave={(e) => e.target.style.transform = "scale(1)"}
          />
          
          {/* Play Button Overlay */}
          <div 
            className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
            style={{ 
              background: "rgba(0,0,0,0.3)", 
              opacity: 0, 
              transition: "opacity 0.3s",
              cursor: "pointer"
            }}
            onMouseEnter={(e) => e.currentTarget.style.opacity = 1}
            onMouseLeave={(e) => e.currentTarget.style.opacity = 0}
            onClick={() => onPlay(video)}
          >
            <button 
              className="btn btn-danger rounded-circle d-flex align-items-center justify-content-center"
              style={{ width: "60px", height: "60px" }}
            >
              <i className="bi bi-play-fill fs-5"></i>
            </button>
          </div>
          
          {/* Duration Badge */}
          <div className="position-absolute bottom-0 end-0 m-2 bg-dark text-light px-2 py-1 rounded small">
            10:30
          </div>
        </div>
        
        {/* Card Body */}
        <div className="card-body d-flex flex-column">
          {/* Video Info */}
          <div className="d-flex align-items-start mb-3">
            <div className="flex-shrink-0 me-3">
              <i className="bi bi-person-circle fs-3 text-muted"></i>
            </div>
            
            <div className="flex-grow-1">
              <h6 
                className="card-title fw-bold" 
                title={title}
                style={{ 
                  display: "-webkit-box", 
                  WebkitLineClamp: 2, 
                  WebkitBoxOrient: "vertical", 
                  overflow: "hidden",
                  lineHeight: "1.3"
                }}
              >
                {shortTitle}
              </h6>
              <p className="text-muted small mb-1">{shortChannel}</p>
            
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-auto d-grid gap-2">
            <div className="d-flex gap-2">
              <button 
                className="btn btn-danger btn-sm flex-fill d-flex align-items-center justify-content-center"
                onClick={() => onPlay(video)}
              >
                <i className="bi bi-play-fill me-2"></i>
                Play
              </button>
              
              <button
                className="btn btn-outline-primary btn-sm flex-fill d-flex align-items-center justify-content-center"
                onClick={() => onQueue(video)}
              >
                <i className="bi bi-plus-lg me-2"></i>
                Queue
              </button>
            </div>
            
            <div className="d-flex gap-2">
              {onFavorite && !isFavorite && (
                <button 
                  className="btn btn-outline-warning btn-sm flex-fill d-flex align-items-center justify-content-center"
                  onClick={() => onFavorite(video)}
                >
                  <i className="bi bi-star me-2"></i>
                  Favorite
                </button>
              )}
              
              {onRemove && isFavorite && (
                <button 
                  className="btn btn-warning btn-sm flex-fill d-flex align-items-center justify-content-center"
                  onClick={() => onRemove(video)}
                >
                  <i className="bi bi-star-fill me-2"></i>
                  Remove
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default VideoCard;