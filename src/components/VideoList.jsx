import React from "react";
import VideoCard from "./VideoCard";

function VideoList({ videos, onPlay, onFavorite, onRemove, isFavorite, darkMode , onQueue }) {
  console.log(videos);
  return (
    <div className="row">
      {videos.map((video, i) => (
        <VideoCard
          key={i}
          video={video}
          onPlay={onPlay}
          onFavorite={onFavorite}
          onRemove={onRemove}
          isFavorite={isFavorite}
          darkMode={darkMode}
          onQueue={onQueue}
        />
      ))}
    </div>
  );
}

export default VideoList;
