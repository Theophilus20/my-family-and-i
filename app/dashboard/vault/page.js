'use client';

import { useState, useRef, useEffect } from 'react';
import { BookOpen, Image, FileText, Mail, Plus, Search, X, Upload, ArrowLeft, Paperclip, Check, AlertCircle, Trash2, Pencil, Music, Film, File } from 'lucide-react';
import FadeIn from '@/components/FadeIn';
import { useTheme } from '@/context/ThemeContext';
import { useLang } from '@/context/LangContext';
import { BRAND } from '@/lib/tokens';
import { api } from '@/lib/api';
import { useVault } from '@/context/VaultContext';
import { vaultRole, canEdit } from '@/lib/permissions';
import { SkeletonGrid } from '@/components/Skeleton';

const GREY = '#6B7280';
// UPDATED: Added 'Audio' and 'Document' as new memory types
const TYPES = [null, 'Story', 'Photo', 'Letter', 'Lesson', 'Audio', 'Document'];
const LABELS = { null: 'All', Story: 'Stories', Photo: 'Photos', Letter: 'Letters', Lesson: 'Lessons', Audio: 'Audio', Document: 'Documents' };
const TYPE_ICONS = { Story: BookOpen, Photo: Image, Letter: Mail, Lesson: FileText, Audio: Music, Document: File };
const TYPE_COLORS = { Story: BRAND.lav, Photo: BRAND.green, Letter: BRAND.lime, Lesson: BRAND.gold, Audio: BRAND.green, Document: BRAND.gold };

// File size limits (in bytes)
const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_VIDEO_SIZE = 50 * 1024 * 1024; // 50MB
const MAX_AUDIO_SIZE = 20 * 1024 * 1024; // 20MB
const MAX_DOCUMENT_SIZE = 10 * 1024 * 1024; // 10MB

function fmt(dateStr) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

// Helper function to detect file type - IMPROVED to handle data URLs for documents
const getFileType = (fileUrl) => {
  if (!fileUrl) return null;
  const url = fileUrl.toLowerCase();
  
  // Check data URL MIME types first
  if (url.startsWith('data:image/')) return 'image';
  if (url.startsWith('data:video/')) return 'video';
  if (url.startsWith('data:audio/')) return 'audio';
  if (url.startsWith('data:application/pdf')) return 'document';
  if (url.startsWith('data:application/msword')) return 'document';
  if (url.startsWith('data:application/vnd.openxmlformats-officedocument')) return 'document';
  if (url.startsWith('data:text/')) return 'document';
  
  // Check by extension
  if (/\.(mp4|webm|mov|avi|mkv)$/i.test(url)) return 'video';
  if (/\.(mp3|wav|ogg|m4a|flac)$/i.test(url)) return 'audio';
  if (/\.(pdf|doc|docx|txt|xlsx|xls|ppt|pptx)$/i.test(url)) return 'document';
  
  return 'file';
};

// Helper function to get display name for file
const getFileName = (fileUrl) => {
  if (!fileUrl) return '';
  if (fileUrl.startsWith('data:')) return 'Embedded file';
  return fileUrl.split('/').pop() || fileUrl;
};

// Helper function to get icon for file type
const getFileIcon = (fileType) => {
  switch (fileType) {
    case 'video': return Film;
    case 'audio': return Music;
    case 'document': return File;
    default: return Paperclip;
  }
};

// Format file size for display
const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
};

export default function MemoryVault() {
  const { T } = useTheme();
  const { t } = useLang();
  const { activeVault, isOwnerView } = useVault();
  const role = vaultRole(isOwnerView, activeVault);
  const editable = canEdit(role);
  const fileRef = useRef(null);
  const [filter, setFilter] = useState(null);
  const [search, setSearch] = useState('');
  const [memories, setMemories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [selected, setSelected] = useState(null);
  const [saved, setSaved] = useState(false);
  const [newMem, setNewMem] = useState({ type: 'Story', title: '', excerpt: '', file: null, fileData: null, fileName: null });
  const [processingFile, setProcessingFile] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  useEffect(() => {
    let active = true;
    setLoading(true);
    api.getMemories(undefined, isOwnerView ? null : activeVault?.id)
      .then((rows) => {
        if (!active) return;
        setMemories(rows);
        setError(null);
        
        // Check if there's a selected memory ID from session storage (deep-linking)
        if (typeof window !== 'undefined') {
          const selectedId = sessionStorage.getItem('selectedMemoryId');
          if (selectedId) {
            const memory = rows.find((m) => m.id === selectedId);
            if (memory) {
              setSelected(memory);
              sessionStorage.removeItem('selectedMemoryId');
            }
          }
        }
      })
      .catch((e) => { if (active) setError(e.message); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [activeVault?.id, isOwnerView]);

  const iconFor = (type) => TYPE_ICONS[type] || BookOpen;
  const colorFor = (type) => TYPE_COLORS[type] || BRAND.lav;

  const visible = memories.filter((m) =>
    (!filter || m.type === filter) &&
    (!search || m.title.toLowerCase().includes(search.toLowerCase()))
  );

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Check file size limits
    let maxSize = MAX_DOCUMENT_SIZE;
    if (file.type.startsWith('image/')) maxSize = MAX_IMAGE_SIZE;
    else if (file.type.startsWith('video/')) maxSize = MAX_VIDEO_SIZE;
    else if (file.type.startsWith('audio/')) maxSize = MAX_AUDIO_SIZE;
    
    if (file.size > maxSize) {
      setError(`File too large. Maximum size: ${formatFileSize(maxSize)}`);
      if (fileRef.current) fileRef.current.value = '';
      return;
    }
    
    setError(null);
    const reader = new FileReader();
    setProcessingFile(true);
    
    reader.onload = (ev) => {
      const fileType = file.type;
      
      // For images, compress them
      if (fileType.startsWith('image/')) {
        const img = new window.Image();
        img.onload = () => {
          const max = 800;
          let { width, height } = img;
          if (width > height && width > max) { height = Math.round(height * max / width); width = max; }
          else if (height > max) { width = Math.round(width * max / height); height = max; }
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          canvas.getContext('2d').drawImage(img, 0, 0, width, height);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.82);
          setNewMem((m) => ({ ...m, file: file.name, fileData: dataUrl, fileName: file.name }));
          setProcessingFile(false);
        };
        img.onerror = () => { 
          setProcessingFile(false);
          setError('Failed to process image');
        };
        img.src = ev.target.result;
      } else if (fileType.startsWith('video/')) {
        // For video, store the data URL directly
        const dataUrl = ev.target.result;
        setNewMem((m) => ({ ...m, file: file.name, fileData: dataUrl, fileName: file.name }));
        setProcessingFile(false);
      } else if (fileType.startsWith('audio/')) {
        // For audio/music files, store as data URL so they can be played and saved
        const dataUrl = ev.target.result;
        setNewMem((m) => ({ ...m, file: file.name, fileData: dataUrl, fileName: file.name }));
        setProcessingFile(false);
      } else {
        // For documents and other files, store as data URL so they can be downloaded/opened properly
        const dataUrl = ev.target.result;
        setNewMem((m) => ({ ...m, file: file.name, fileData: dataUrl, fileName: file.name }));
        setProcessingFile(false);
      }
    };
    
    reader.onerror = () => {
      setProcessingFile(false);
      setError('Failed to read file');
    };
    
    // Read as data URL for all file types
    reader.readAsDataURL(file);
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;
    setDeleting(true);
    try {
      await api.deleteMemory(confirmDelete.id);
      setMemories((m) => m.filter((x) => x.id !== confirmDelete.id));
      setConfirmDelete(null);
      setSelected(null);
    } catch (e) {
      setError(e.message);
    } finally {
      setDeleting(false);
    }
  };
  
  const startEdit = (m) => {
    setNewMem({ type: m.type, title: m.title, excerpt: m.body || '', file: m.file_url || null, fileData: m.file_url?.startsWith('data:') ? m.file_url : null, fileName: m.file_url || null });
    setEditingId(m.id);
    setShowAdd(true);
    setSelected(null);
  };
  
  const handleAdd = async () => {
    if (!newMem.title.trim()) return;
    try {
      const payload = {
        type: newMem.type,
        title: newMem.title,
        body: newMem.excerpt,
        file_url: newMem.fileData || newMem.file,
      };
      if (editingId) {
        const row = await api.updateMemory(editingId, payload);
        setMemories((m) => m.map((x) => (x.id === editingId ? row : x)));
      } else {
        const row = await api.createMemory(payload);
        setMemories((m) => [row, ...m]);
      }
      setNewMem({ type: 'Story', title: '', excerpt: '', file: null, fileData: null, fileName: null });
      setEditingId(null);
      setSaved(true);
      setTimeout(() => { setSaved(false); setShowAdd(false); }, 1500);
    } catch (e) {
      setError(e.message);
    }
  };

  if (selected) {
    const Icon = iconFor(selected.type);
    const color = colorFor(selected.type);
    const fileType = getFileType(selected.file_url);
    const FileIcon = getFileIcon(fileType);
    const fileName = getFileName(selected.file_url);
    
    return (
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <button onClick={() => setSelected(null)} style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'none', border: 'none', color: T.textMut, fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: "'Plus Jakarta Sans',sans-serif" }}>
            <ArrowLeft size={16}/> Back to memories
          </button>
          {editable && (
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => startEdit(selected)}
                onMouseEnter={(e) => { e.currentTarget.style.filter = 'brightness(0.9)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.filter = 'brightness(1)'; }}
                style={{ display: 'flex', alignItems: 'center', gap: 6, background: T.surface2, border: `1.5px solid ${T.border}`, borderRadius: 10, padding: '8px 14px', color: T.textSub, fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: "'Plus Jakarta Sans',sans-serif" }}>
                <Pencil size={14}/> Edit
              </button>
              <button onClick={() => setConfirmDelete(selected)}
                onMouseEnter={(e) => { e.currentTarget.style.filter = 'brightness(0.9)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.filter = 'brightness(1)'; }}
                style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(255,80,80,0.08)', border: '1.5px solid rgba(255,80,80,0.25)', borderRadius: 10, padding: '8px 14px', color: '#FF5050', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: "'Plus Jakarta Sans',sans-serif" }}>
                <Trash2 size={14}/> Delete
              </button>
            </div>
          )}
        </div>
        <div style={{ background: T.surface, border: `1.5px solid ${T.border}`, borderRadius: 20, padding: '32px 28px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
            <div style={{ width: 48, height: 48, borderRadius: 14, background: T.surface2, border: `1px solid ${T.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icon size={22} color={GREY} strokeWidth={1.8}/>
            </div>
            <div>
              <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: .8, color, background: `${color}15`, borderRadius: 100, padding: '2px 8px' }}>{selected.type}</span>
              <p style={{ fontSize: 12, color: T.textMut, marginTop: 4, fontWeight: 500 }}>{fmt(selected.created_at)}</p>
            </div>
          </div>
          <h2 style={{ fontSize: 'clamp(20px,4vw,30px)', fontWeight: 800, color: T.text, marginBottom: 20, fontFamily: "'Plus Jakarta Sans',sans-serif", lineHeight: 1.3 }}>{selected.title}</h2>
          <p style={{ fontSize: 15, color: T.textSub, lineHeight: 1.9, maxWidth: 640, marginBottom: 24 }}>{selected.body || 'No description yet.'}</p>
          
          {selected.file_url && (
            <div style={{ marginTop: 24 }}>
              {fileType === 'image' ? (
                <img src={selected.file_url} alt={selected.title} style={{ maxWidth: '100%', maxHeight: 500, borderRadius: 12, border: `1.5px solid ${T.border}` }}/>
              ) : fileType === 'video' ? (
                <div style={{ background: '#000', borderRadius: 12, border: `1.5px solid ${T.border}`, overflow: 'hidden' }}>
                  <video 
                    key={selected.id}
                    src={selected.file_url} 
                    controls 
                    controlsList="nodownload"
                    style={{ width: '100%', maxHeight: 500, display: 'block' }}
                    onError={(e) => { console.error('Video playback error:', e); setError('Unable to play video'); }}
                  />
                </div>
              ) : fileType === 'audio' ? (
                <div style={{ background: T.surface2, border: `1.5px solid ${T.border}`, borderRadius: 12, padding: '20px', display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'center', maxWidth: 400 }}>
                  <Music size={32} color={BRAND.green} />
                  <audio 
                    key={selected.id}
                    src={selected.file_url} 
                    controls 
                    controlsList="nodownload"
                    style={{ width: '100%' }}
                    onError={(e) => { console.error('Audio playback error:', e); setError('Unable to play audio'); }}
                  />
                  <p style={{ fontSize: 13, color: T.textMut, textAlign: 'center' }}>{fileName}</p>
                </div>
              ) : fileType === 'document' ? (
                <div style={{ background: T.surface2, border: `1.5px solid ${T.border}`, borderRadius: 12, padding: '16px', display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 8, background: T.surface, border: `1px solid ${T.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <File size={18} color={GREY} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 13, fontWeight: 600, color: T.text, wordBreak: 'break-word' }}>{fileName}</p>
                    <p style={{ fontSize: 11, color: T.textMut }}>Document</p>
                  </div>
                  {selected.file_url && selected.file_url.startsWith('data:') && (
                    <a 
                      href={selected.file_url}
                      download={fileName}
                      style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'center', width: 36, height: 36, borderRadius: 8, background: BRAND.green, color: '#fff', cursor: 'pointer', flexShrink: 0, textDecoration: 'none', fontSize: 14, fontWeight: 600 }}
                      title="Download document"
                    >
                      ↓
                    </a>
                  )}
                </div>
              ) : (
                <div style={{ marginTop: 24, padding: '14px 16px', background: T.surface2, border: `1.5px solid ${T.border}`, borderRadius: 12, display: 'flex', alignItems: 'center', gap: 10 }}>
                  <FileIcon size={14} color={GREY}/>
                  <span style={{ fontSize: 13, color: T.textMut, wordBreak: 'break-word' }}>{fileName}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {confirmDelete && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 500, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
            <div style={{ background: T.surface, border: `1.5px solid ${T.border}`, borderRadius: 24, padding: 32, maxWidth: 420, width: '100%', boxShadow: '0 24px 64px rgba(0,0,0,0.3)' }}>
              <h3 style={{ fontSize: 20, fontWeight: 800, color: T.text, marginBottom: 10, fontFamily: "'Plus Jakarta Sans',sans-serif" }}>Delete this memory?</h3>
              <p style={{ fontSize: 14, color: T.textMut, lineHeight: 1.6, marginBottom: 24 }}>
                &ldquo;{confirmDelete.title}&rdquo; will be permanently removed. This cannot be undone.
              </p>
              <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={() => setConfirmDelete(null)} disabled={deleting}
                  onMouseEnter={(e) => { e.currentTarget.style.filter = 'brightness(0.9)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.filter = 'brightness(1)'; }}
                  style={{ flex: 1, background: 'none', border: `1.5px solid ${T.border}`, borderRadius: 12, padding: 13, fontSize: 14, fontWeight: 700, color: T.textSub, cursor: 'pointer', fontFamily: "'Plus Jakarta Sans',sans-serif" }}>
                  Cancel
                </button>
                <button onClick={handleDelete} disabled={deleting}
                  onMouseEnter={(e) => { e.currentTarget.style.filter = 'brightness(0.9)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.filter = 'brightness(1)'; }}
                  style={{ flex: 1, background: '#FF5050', border: 'none', borderRadius: 12, padding: 13, fontSize: 14, fontWeight: 700, color: '#fff', cursor: deleting ? 'default' : 'pointer', opacity: deleting ? 0.7 : 1, fontFamily: "'Plus Jakarta Sans',sans-serif" }}>
                  {deleting ? 'Deleting…' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div>
      <FadeIn>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16, marginBottom: 24 }}>
          <div>
            <h2 style={{ fontSize: 'clamp(20px,4vw,28px)', fontWeight: 800, color: T.text, marginBottom: 4, fontFamily: "'Plus Jakarta Sans',sans-serif" }}>{t.memory_vault}</h2>
            <p style={{ fontSize: 14, color: T.textMut, fontWeight: 500 }}>{memories.length} memories · {isOwnerView ? 'all formats' : `${activeVault?.name?.split(' ')[0] || 'their'}'s collection`}</p>
          </div>
          {editable && (
            <button onClick={() => setShowAdd(true)}
              onMouseEnter={(e) => { e.currentTarget.style.filter = 'brightness(0.9)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.filter = 'brightness(1)'; }}
              style={{ background: `linear-gradient(135deg,${BRAND.green},${BRAND.greenD})`, border: 'none', borderRadius: 12, padding: '10px 20px', fontSize: 13, fontWeight: 700, color: '#fff', display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', boxShadow: '0 4px 14px rgba(74,186,139,0.35)', fontFamily: "'Plus Jakarta Sans',sans-serif" }}>
              <Plus size={15}/> {t.add_memory}
            </button>
          )}
        </div>
      </FadeIn>

      {error && (
        <FadeIn>
          <div style={{ background: 'rgba(255,80,80,0.08)', border: '1.5px solid rgba(255,80,80,0.2)', borderRadius: 12, padding: '12px 16px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
            <AlertCircle size={15} color="#FF5050"/>
            <p style={{ fontSize: 13, color: '#FF5050' }}>{error}</p>
          </div>
        </FadeIn>
      )}

      {showAdd && (
        <FadeIn>
          <div style={{ background: T.surface, border: `1.5px solid ${BRAND.green}40`, borderRadius: 20, padding: 24, marginBottom: 20, boxShadow: `0 8px 32px ${BRAND.green}12` }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <h3 style={{ fontSize: 18, fontWeight: 800, color: T.text, fontFamily: "'Plus Jakarta Sans',sans-serif" }}>{editingId ? 'Edit Memory' : 'Add a Memory'}</h3>
              <button onClick={() => { setShowAdd(false); setError(null); }}
                onMouseEnter={(e) => { e.currentTarget.style.filter = 'brightness(0.9)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.filter = 'brightness(1)'; }}
                style={{ background: 'none', border: `1.5px solid ${T.border}`, borderRadius: 12, padding: '8px 16px', fontSize: 13, fontWeight: 600, color: T.textSub, cursor: 'pointer', fontFamily: "'Plus Jakarta Sans',sans-serif" }}>Cancel</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <p style={{ fontSize: 11, fontWeight: 600, color: T.textMut, textTransform: 'uppercase', letterSpacing: .5, marginBottom: 8 }}>Memory type</p>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {['Story', 'Photo', 'Letter', 'Lesson', 'Audio', 'Document'].map((tp) => (
                    <button key={tp} onClick={() => setNewMem((m) => ({ ...m, type: tp }))}
                      onMouseEnter={(e) => { e.currentTarget.style.filter = 'brightness(0.9)'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.filter = 'brightness(1)'; }}
                      style={{ background: newMem.type === tp ? BRAND.green : T.surface2, border: `1.5px solid ${newMem.type === tp ? BRAND.green : T.border}`, borderRadius: 100, padding: '7px 16px', fontSize: 12, fontWeight: 700, color: newMem.type === tp ? '#fff' : T.textSub, cursor: 'pointer', fontFamily: "'Plus Jakarta Sans',sans-serif", transition: 'all .2s' }}>
                      {tp}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p style={{ fontSize: 11, fontWeight: 600, color: T.textMut, textTransform: 'uppercase', letterSpacing: .5, marginBottom: 6 }}>Title</p>
                <input value={newMem.title} onChange={(e) => setNewMem((m) => ({ ...m, title: e.target.value }))} placeholder="Give your memory a title..."
                  style={{ width: '100%', background: T.surface2, border: `1.5px solid ${T.border}`, borderRadius: 12, padding: '12px 14px', fontSize: 14, color: T.text, fontFamily: "'Plus Jakarta Sans',sans-serif", outline: 'none' }}
                  onFocus={(e) => (e.target.style.borderColor = BRAND.green)} onBlur={(e) => (e.target.style.borderColor = T.border)}/>
              </div>
              <div>
                <p style={{ fontSize: 11, fontWeight: 600, color: T.textMut, textTransform: 'uppercase', letterSpacing: .5, marginBottom: 6 }}>Your story</p>
                <textarea value={newMem.excerpt} onChange={(e) => setNewMem((m) => ({ ...m, excerpt: e.target.value }))} placeholder="Write your memory here..." rows={4}
                  style={{ width: '100%', background: T.surface2, border: `1.5px solid ${T.border}`, borderRadius: 12, padding: '12px 14px', fontSize: 14, color: T.text, fontFamily: "'Plus Jakarta Sans',sans-serif", outline: 'none', resize: 'vertical' }}
                  onFocus={(e) => (e.target.style.borderColor = BRAND.green)} onBlur={(e) => (e.target.style.borderColor = T.border)}/>
              </div>
              <div>
                <p style={{ fontSize: 11, fontWeight: 600, color: T.textMut, textTransform: 'uppercase', letterSpacing: .5, marginBottom: 6 }}>Attach file (optional)</p>
                <p style={{ fontSize: 10, color: T.textMut, marginBottom: 8 }}>Max sizes: Images 5MB, Videos 50MB, Audio 20MB, Documents 10MB</p>
                <input ref={fileRef} type="file" accept="image/*,audio/*,video/*,.pdf,.doc,.docx,.txt,.xlsx,.xls,.ppt,.pptx" onChange={handleFileChange} style={{ display: 'none' }}/>
                <div onClick={() => fileRef.current.click()} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', background: T.surface2, border: `1.5px dashed ${newMem.file ? BRAND.green : T.border}`, borderRadius: 12, cursor: 'pointer', transition: 'border-color .2s' }}
                  onMouseEnter={(e) => (e.currentTarget.style.borderColor = BRAND.green)}
                  onMouseLeave={(e) => (e.currentTarget.style.borderColor = newMem.file ? BRAND.green : T.border)}
                >
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: T.surface, border: `1px solid ${T.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Upload size={16} color={GREY}/>
                  </div>
                  <div>
                    {newMem.file
                      ? <p style={{ fontSize: 13, fontWeight: 600, color: BRAND.green }}>{newMem.file}</p>
                      : <p style={{ fontSize: 13, fontWeight: 600, color: T.text }}>Click to attach a file</p>}
                    <p style={{ fontSize: 11, color: T.textMut }}>Photos, audio, video, PDF, Word documents</p>
                  </div>
                  {newMem.file && (
                    <button onClick={(e) => { e.stopPropagation(); setNewMem((m) => ({ ...m, file: null, fileData: null, fileName: null })); if (fileRef.current) fileRef.current.value = ''; }} style={{ marginLeft: 'auto', background: 'none', border: 'none', color: T.textMut, cursor: 'pointer', display: 'flex', flexShrink: 0 }}>
                      <X size={14}/>
                    </button>
                  )}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={handleAdd} disabled={!newMem.title.trim() || processingFile}
                  onMouseEnter={(e) => { e.currentTarget.style.filter = 'brightness(0.9)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.filter = 'brightness(1)'; }}
                  style={{ background: saved ? `${BRAND.green}15` : !newMem.title.trim() ? T.surface2 : `linear-gradient(135deg,${BRAND.green},${BRAND.greenD})`, border: saved ? `1.5px solid ${BRAND.green}` : !newMem.title.trim() ? `1.5px solid ${T.border}` : 'none', borderRadius: 12, padding: '12px 24px', fontSize: 13, fontWeight: 700, color: saved ? BRAND.green : !newMem.title.trim() ? T.textMut : '#fff', cursor: !newMem.title.trim() ? 'not-allowed' : 'pointer', fontFamily: "'Plus Jakarta Sans',sans-serif", transition: 'all .3s', display: 'flex', alignItems: 'center', gap: 8 }}>
                  {saved ? <><Check size={14} color={BRAND.green}/> Saved</> : processingFile ? 'Processing file…' : editingId ? 'Update memory' : 'Save memory'}
                </button>
              </div>
            </div>
          </div>
        </FadeIn>
      )}

      <FadeIn delay={60}>
        <div style={{ position: 'relative', marginBottom: 14 }}>
          <Search size={14} color={GREY} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}/>
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={t.search}
            style={{ width: '100%', background: T.surface, border: `1.5px solid ${T.border}`, borderRadius: 12, padding: '12px 14px 12px 40px', fontSize: 13, color: T.text, fontFamily: "'Plus Jakarta Sans',sans-serif", outline: 'none', transition: 'border-color .2s' }}
            onFocus={(e) => (e.target.style.borderColor = BRAND.green)} onBlur={(e) => (e.target.style.borderColor = T.border)}/>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 24 }}>
          {TYPES.map((tp) => (
            <button key={String(tp)} onClick={() => setFilter(tp)}
              onMouseEnter={(e) => { e.currentTarget.style.filter = 'brightness(0.9)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.filter = 'brightness(1)'; }}
              style={{ background: filter === tp ? BRAND.green : T.surface, border: `1.5px solid ${filter === tp ? BRAND.green : T.border}`, borderRadius: 100, padding: '7px 16px', fontSize: 12, fontWeight: filter === tp ? 700 : 500, color: filter === tp ? '#fff' : T.textSub, cursor: 'pointer', transition: 'all .2s', fontFamily: "'Plus Jakarta Sans',sans-serif" }}>
              {LABELS[String(tp)]}
            </button>
          ))}
        </div>
      </FadeIn>

      {loading ? (
        <SkeletonGrid count={6} className="vault-grid" />
      ) : visible.length === 0 ? (
        <p style={{ textAlign: 'center', padding: '60px 0', color: T.textMut, fontSize: 14, fontWeight: 500 }}>{t.no_memories}</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 12 }} className="vault-grid">
          {visible.map((m, i) => {
            const Icon = iconFor(m.type);
            const color = colorFor(m.type);
            const fileType = getFileType(m.file_url);
            const FileIcon = getFileIcon(fileType);
            return (
              <FadeIn key={m.id || i} delay={i * 40}>
                <div
                  onClick={() => setSelected(m)}
                  style={{ background: T.surface, border: `1.5px solid ${T.border}`, borderRadius: 16, padding: '18px 20px', cursor: 'pointer', transition: 'all .2s' }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = T.textMut; e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.08)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
                >
                  <div style={{ display: 'flex', gap: 14 }}>
                    <div style={{ width: 42, height: 42, borderRadius: 12, background: T.surface2, border: `1px solid ${T.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Icon size={18} color={GREY} strokeWidth={1.8}/>
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', gap: 8, marginBottom: 5, flexWrap: 'wrap', alignItems: 'center' }}>
                        <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: .8, color, background: `${color}15`, borderRadius: 100, padding: '2px 8px' }}>{m.type}</span>
                        <span style={{ fontSize: 11, color: T.textMut, fontWeight: 500 }}>
                          {fmt(m.created_at)}
                        </span>
                        {m.file_url && (
                          <span style={{ fontSize: 10, fontWeight: 600, color: BRAND.green, background: `${BRAND.green}15`, borderRadius: 100, padding: '2px 8px' }}>
                            {fileType === 'image' ? '🖼️ Photo' : fileType === 'video' ? '🎬 Video' : fileType === 'audio' ? '🎵 Audio' : fileType === 'document' ? '📄 Document' : '📎 File'}
                          </span>
                        )}
                      </div>
                      <h3 style={{ fontSize: 14, fontWeight: 700, color: T.text, marginBottom: 4, lineHeight: 1.4 }}>{m.title}</h3>
                      <p style={{ fontSize: 12, color: T.textMut, lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {m.body || 'No description'}
                      </p>
                    </div>
                  </div>
                </div>
              </FadeIn>
            );
          })}
        </div>
      )}
    </div>
  );
}
