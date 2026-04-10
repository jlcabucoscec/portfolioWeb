import { useState } from "react";

export default function ScreenshotUploader({
  screenshots = [],
  thumbnailUrl = "",
  useThumbnail = false,
  onAddImageUrl,
  onRemoveScreenshot,
  onSetThumbnail,
  onReorderScreenshots,
}) {
  const [dragOverIndex, setDragOverIndex] = useState(null);
  const [urlInput, setUrlInput] = useState("");
  const [dragSrc, setDragSrc] = useState(null);

  function handleDragStart(index) {
    setDragSrc(index);
  }

  function handleDragOver(event, index) {
    event.preventDefault();
    setDragOverIndex(index);
  }

  function handleDrop(event, targetIndex) {
    event.preventDefault();
    setDragOverIndex(null);

    if (dragSrc !== null && dragSrc !== targetIndex) {
      const reordered = [...screenshots];
      const [moved] = reordered.splice(dragSrc, 1);
      reordered.splice(targetIndex, 0, moved);
      onReorderScreenshots(reordered);
    }

    setDragSrc(null);
  }

  function handleDragEnd() {
    setDragSrc(null);
    setDragOverIndex(null);
  }

  function handleAddUrl() {
    const value = String(urlInput || "").trim();
    if (!value) {
      return;
    }

    onAddImageUrl(value);
    setUrlInput("");
  }

  return (
    <div className="admin-media-box">
      <div className="admin-section-heading">
        <div>
          <p className="eyebrow">Project Images</p>
          <h3>Add image URLs</h3>
          <p className="section-copy">
            Paste direct image links, add more as needed, then choose which image should appear as
            the featured visual on the project card.
          </p>
        </div>
      </div>

      <div className="admin-inline-upload">
        <input
          className="admin-inline-input"
          onChange={(event) => setUrlInput(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              handleAddUrl();
            }
          }}
          placeholder="https://example.com/project-image.jpg"
          value={urlInput}
        />
        <button className="button-secondary" onClick={handleAddUrl} type="button">
          Add Another Image
        </button>
      </div>

      <div className="admin-screenshot-gallery">
        {screenshots.length ? (
          <div className="gallery-grid">
            {screenshots.map((image, index) => {
              const isFeaturedVisual = useThumbnail && thumbnailUrl === image;
              const isHovered = dragOverIndex === index;

              return (
                <div
                  key={`${image}-${index}`}
                  className={`gallery-item ${isFeaturedVisual ? "is-thumbnail" : ""} ${isHovered ? "drag-over" : ""}`}
                  draggable
                  onDragEnd={handleDragEnd}
                  onDragLeave={() => setDragOverIndex(null)}
                  onDragOver={(event) => handleDragOver(event, index)}
                  onDragStart={() => handleDragStart(index)}
                  onDrop={(event) => handleDrop(event, index)}
                >
                  <img alt={`Project image ${index + 1}`} loading="lazy" src={image} />

                  {isFeaturedVisual && (
                    <div className="gallery-badge">
                      <span className="material-symbols-outlined">check_circle</span>
                      Featured Visual
                    </div>
                  )}

                  <div className="gallery-number">{index + 1}</div>

                  <div className="gallery-actions">
                    <button
                      className={`action-btn ${isFeaturedVisual ? "active" : ""}`}
                      onClick={() => onSetThumbnail(image)}
                      title={isFeaturedVisual ? "Already selected as the featured visual" : "Use as the featured visual"}
                      type="button"
                    >
                      <span className="material-symbols-outlined">
                        {isFeaturedVisual ? "check" : "star"}
                      </span>
                    </button>
                    <button
                      className="action-btn danger"
                      onClick={() => onRemoveScreenshot(image)}
                      title="Remove image"
                      type="button"
                    >
                      <span className="material-symbols-outlined">delete</span>
                    </button>
                  </div>

                  {dragSrc === index && <div className="drag-indicator"></div>}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="admin-image-fallback admin-image-fallback-gradient">
            <span className="material-symbols-outlined">imagesmode</span>
            <strong>No project images added yet</strong>
            <p className="text-xs">Paste one image URL at a time to build the gallery</p>
          </div>
        )}
      </div>

      <p className="section-copy mt-4 mb-0">
        {screenshots.length
          ? `${screenshots.length} image${screenshots.length !== 1 ? "s" : ""} added | ${useThumbnail && thumbnailUrl ? "Featured visual selected" : "Gradient visual will be used until you pick one"}`
          : "Add one or more image URLs, then choose which one should be featured."}
      </p>
    </div>
  );
}
