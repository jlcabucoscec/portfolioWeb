import { useState } from "react";

export default function ScreenshotUploader({
  screenshots = [],
  thumbnailUrl = "",
  useThumbnail = false,
  uploadingAsset = false,
  onUploadImages,
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

  function handleDragOver(e, index) {
    e.preventDefault();
    setDragOverIndex(index);
  }

  function handleDrop(e, targetIndex) {
    e.preventDefault();
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
    if (value) {
      onAddImageUrl(value);
      setUrlInput("");
    }
  }

  return (
    <div className="admin-media-box">
      <div className="admin-section-heading">
        <div>
          <p className="eyebrow">Screenshots</p>
          <h3>Upload or add project images</h3>
          <p className="section-copy">
            Like Instagram, drag to reorder. Select an image as thumbnail or use gradient. Uploads
            are compressed automatically.
          </p>
        </div>
      </div>

      {/* Upload Zone */}
      <div className="admin-upload-zone">
        <label className="field">
          <span>Upload Screenshot Images</span>
          <div className="admin-upload-input-wrapper">
            <input
              accept="image/*"
              disabled={uploadingAsset}
              multiple
              onChange={(event) => {
                const files = Array.from(event.target.files || []);
                if (files.length) {
                  onUploadImages(files);
                }
                event.target.value = "";
              }}
              type="file"
            />
            <div className="admin-upload-placeholder">
              <span className="material-symbols-outlined">cloud_upload</span>
              <p>
                <strong>Click to upload</strong> or drag files here
              </p>
              <span className="text-xs text-[var(--text-soft)]">PNG, JPG, WEBP • Up to 5MB</span>
            </div>
          </div>
        </label>

        {uploadingAsset && (
          <div className="admin-upload-progress">
            <div className="spinner"></div>
            <span>Compressing and uploading screenshot...</span>
          </div>
        )}
      </div>

      {/* URL Input */}
      <div className="admin-inline-upload">
        <input
          className="admin-inline-input"
          disabled={uploadingAsset}
          placeholder="https://example.com/screenshot.jpg"
          value={urlInput}
          onChange={(event) => setUrlInput(event.target.value)}
          onKeyPress={(event) => {
            if (event.key === "Enter") {
              handleAddUrl();
            }
          }}
        />
        <button
          className="button-secondary"
          disabled={uploadingAsset}
          onClick={handleAddUrl}
          type="button"
        >
          Add URL
        </button>
      </div>

      {/* Screenshot Grid - Instagram Style */}
      <div className="admin-screenshot-gallery">
        {screenshots.length ? (
          <div className="gallery-grid">
            {screenshots.map((image, index) => {
              const isThumbnail = useThumbnail && thumbnailUrl === image;
              const isHovered = dragOverIndex === index;

              return (
                <div
                  key={`${image}-${index}`}
                  className={`gallery-item ${isThumbnail ? "is-thumbnail" : ""} ${isHovered ? "drag-over" : ""}`}
                  draggable
                  onDragStart={() => handleDragStart(index)}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDrop={(e) => handleDrop(e, index)}
                  onDragEnd={handleDragEnd}
                  onDragLeave={() => setDragOverIndex(null)}
                >
                  <img alt={`Screenshot ${index + 1}`} src={image} loading="lazy" />

                  {/* Thumbnail Badge */}
                  {isThumbnail && (
                    <div className="gallery-badge">
                      <span className="material-symbols-outlined">check_circle</span>
                      Thumbnail
                    </div>
                  )}

                  {/* Image Number */}
                  <div className="gallery-number">{index + 1}</div>

                  {/* Hover Actions */}
                  <div className="gallery-actions">
                    <button
                      className={`action-btn ${isThumbnail ? "active" : ""}`}
                      onClick={() => onSetThumbnail(image)}
                      title={isThumbnail ? "Already selected as thumbnail" : "Set as thumbnail"}
                      type="button"
                    >
                      <span className="material-symbols-outlined">
                        {isThumbnail ? "check" : "star"}
                      </span>
                    </button>
                    <button
                      className="action-btn danger"
                      onClick={() => onRemoveScreenshot(image)}
                      title="Remove screenshot"
                      type="button"
                    >
                      <span className="material-symbols-outlined">delete</span>
                    </button>
                  </div>

                  {/* Drag Indicator */}
                  {dragSrc === index && <div className="drag-indicator"></div>}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="admin-image-fallback admin-image-fallback-gradient">
            <span className="material-symbols-outlined">imagesmode</span>
            <strong>No screenshots added yet</strong>
            <p className="text-xs">Upload or add images to get started</p>
          </div>
        )}
      </div>

      {/* Info Text */}
      <p className="section-copy mt-4 mb-0">
        {uploadingAsset
          ? "⏳ Compressing and uploading... Please wait"
          : `📸 ${screenshots.length} image${screenshots.length !== 1 ? "s" : ""} added • ${useThumbnail && thumbnailUrl ? "Custom thumbnail selected" : "Gradient thumbnail will be used"}`}
      </p>
    </div>
  );
}
