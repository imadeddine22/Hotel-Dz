'use client';

import { useState, useRef } from 'react';
import { UploadCloud, X, Image as ImageIcon, Star } from 'lucide-react';
import { getImageUrl } from '@/lib/api';

export default function ImageUploader({ onChange, setFiles: setFilesExternal, files: filesExternal, maxFiles = 6, existingImages = [] }) {
  const [previews, setPreviews] = useState(
    existingImages.map(img => ({ url: getImageUrl(img.url || img), isExisting: true }))
  );
  const [files, setFiles] = useState([]);
  const fileInputRef = useRef(null);

  // Helper: notify parent using either onChange or setFiles
  const notifyParent = (updatedFiles) => {
    if (typeof onChange === 'function') {
      const dt = new DataTransfer();
      updatedFiles.forEach(file => dt.items.add(file));
      onChange(dt.files);
    } else if (typeof setFilesExternal === 'function') {
      setFilesExternal(updatedFiles);
    }
  };

  const handleFileSelect = (e) => {
    const selectedFiles = Array.from(e.target.files);
    
    if (previews.length + selectedFiles.length > maxFiles) {
      alert(`Vous ne pouvez sélectionner que ${maxFiles} photos au total.`);
      return;
    }

    const newPreviews = selectedFiles.map(file => ({
      url: URL.createObjectURL(file),
      file,
      isExisting: false
    }));

    setPreviews(prev => [...prev, ...newPreviews]);
    const updatedFiles = [...files, ...selectedFiles];
    setFiles(updatedFiles);
    notifyParent(updatedFiles);
  };

  const removeImage = (indexToRemove) => {
    const previewToRemove = previews[indexToRemove];
    
    // Revoke object URL to prevent memory leaks if it's a new file
    if (!previewToRemove.isExisting) {
      URL.revokeObjectURL(previewToRemove.url);
      
      // Remove from files array
      const updatedFiles = files.filter(f => f !== previewToRemove.file);
      setFiles(updatedFiles);
      notifyParent(updatedFiles);
    }
    
    // Remove from previews
    setPreviews(prev => prev.filter((_, idx) => idx !== indexToRemove));
  };

  return (
    <div style={{ width: '100%' }}>
      {/* Upload Zone */}
      {previews.length < maxFiles && (
        <div
          onClick={() => fileInputRef.current?.click()}
          style={{
            border: '2px dashed #cbd5e1',
            borderRadius: 16,
            padding: '32px 24px',
            textAlign: 'center',
            cursor: 'pointer',
            background: '#f8fafc',
            transition: 'all 0.2s ease',
            marginBottom: 20,
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.borderColor = '#a855f7';
            e.currentTarget.style.background = '#faf5ff';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.borderColor = '#cbd5e1';
            e.currentTarget.style.background = '#f8fafc';
          }}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            accept="image/*"
            multiple
            style={{ display: 'none' }}
          />
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}>
            <div style={{ background: '#f1f5f9', padding: 12, borderRadius: '50%', color: '#64748b' }}>
              <UploadCloud size={28} />
            </div>
          </div>
          <p style={{ margin: 0, fontSize: 15, fontWeight: 600, color: '#334155' }}>
            Cliquez ou glissez-déposez pour ajouter des photos
          </p>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: '#94a3b8' }}>
            {previews.length} / {maxFiles} sélectionnées (JPG, PNG)
          </p>
        </div>
      )}

      {/* Previews Grid */}
      {previews.length > 0 && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
          gap: 16
        }}>
          {previews.map((preview, index) => (
            <div key={index} style={{
              position: 'relative',
              borderRadius: 12,
              overflow: 'hidden',
              aspectRatio: '1',
              boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
              border: index === 0 ? '2px solid #a855f7' : '1px solid #e2e8f0',
            }}>
              <img
                src={preview.url}
                alt={`Preview ${index}`}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              
              {/* Overlay for main image badge */}
              {index === 0 && (
                <div style={{
                  position: 'absolute', top: 8, left: 8,
                  background: 'rgba(168,85,247,0.9)', color: '#fff',
                  borderRadius: 20, padding: '4px 10px', fontSize: 11,
                  fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4,
                  backdropFilter: 'blur(4px)'
                }}>
                  <Star size={12} fill="#fff" /> Principale
                </div>
              )}
              {/* Badge for gallery items */}
              {index > 0 && (
                <div style={{
                  position: 'absolute', top: 8, left: 8,
                  background: 'rgba(0,0,0,0.6)', color: '#fff',
                  borderRadius: 20, padding: '4px 10px', fontSize: 11,
                  fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4,
                  backdropFilter: 'blur(4px)'
                }}>
                  <ImageIcon size={12} /> Galerie
                </div>
              )}

              {/* Remove button */}
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); removeImage(index); }}
                style={{
                  position: 'absolute', top: 8, right: 8,
                  background: 'rgba(255,255,255,0.9)', border: 'none',
                  borderRadius: '50%', width: 24, height: 24,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', color: '#ef4444',
                  boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
                }}
              >
                <X size={14} strokeWidth={3} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
