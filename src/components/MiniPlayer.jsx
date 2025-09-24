import React, { useEffect } from "react";

function MiniPlayer({ video, slotRef, onClose, onExpand }) {
  // quick debug to ensure slotRef was passed and component mounted
  useEffect(() => {
    console.log("[DEBUG] MiniPlayer mount, video:", video?.snippet?.title, "slotRef:", !!slotRef?.current);
  }, [video, slotRef]);

  if (!video) return null;

  return (
    <div
      className="shadow-lg bg-dark text-white"
      style={{
        position: "fixed",
        bottom: "10px",
        right: "10px",
        width: "340px",
        height: "220px",
        borderRadius: "8px",
        overflow: "hidden",
        zIndex: 2000,
      }}
    >
      {/* header */}
      <div className="d-flex justify-content-between align-items-center px-2 py-1 bg-secondary" style={{ height: 34 }}>
        <div style={{ minWidth: 0 }}>
          <div className="small text-truncate" style={{ maxWidth: 220 }}>
            {video.snippet.title}
          </div>
          <div className="small text-muted" style={{ maxWidth: 220 }}>
            {video.snippet.channelTitle}
          </div>
        </div>

        <div>
          <button className="btn btn-sm btn-light me-1" onClick={onExpand} title="Expand">
            ⤢
          </button>
          <button className="btn btn-sm btn-danger" onClick={onClose} title="Close">
            ✖
          </button>
        </div>
      </div>

      {/* slot for iframe — App will append the real iframe into this div */}
      <div ref={slotRef} style={{ width: "100%", height: 186, background: "#000" }} />
    </div>
  );
}

export default MiniPlayer;
