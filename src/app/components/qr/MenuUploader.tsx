import React, { useCallback, useState } from "react";
import { useProfile, BusinessMenu } from "../../context/ProfileContext";
import { toast } from "sonner";
import { Upload, FileText, Image as ImageIcon, Trash2, Loader2, CheckCircle2 } from "lucide-react";

const ACCEPTED = ".pdf,.png,.jpg,.jpeg,.webp";
const MAX_MB = 20;

export function MenuUploader() {
  const { menus, uploadMenu, deleteMenu } = useProfile();
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [label, setLabel] = useState("Menu");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleFile = async (file: File) => {
    if (file.size > MAX_MB * 1024 * 1024) {
      toast.error(`File too large. Max size is ${MAX_MB} MB`);
      return;
    }
    const allowed = ["application/pdf", "image/png", "image/jpeg", "image/webp"];
    if (!allowed.includes(file.type)) {
      toast.error("Only PDF, PNG, JPG, or WebP files are allowed");
      return;
    }
    setUploading(true);
    try {
      await uploadMenu(file, label || file.name);
      toast.success("Menu uploaded successfully!");
      setLabel("Menu");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [label]);

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    e.target.value = "";
  };

  const handleDelete = async (menu: BusinessMenu) => {
    setDeletingId(menu.id);
    try {
      await deleteMenu(menu.id, menu.storage_path);
      toast.success("Menu removed");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Delete failed");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Label input */}
      <div>
        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
          Menu Label
        </label>
        <input
          value={label}
          onChange={e => setLabel(e.target.value)}
          placeholder='e.g. "Dinner Menu", "Drinks"'
          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
        />
      </div>

      {/* Drop zone */}
      <label
        className={`relative flex flex-col items-center justify-center gap-4 h-52 rounded-2xl border-2 border-dashed cursor-pointer transition-all select-none
          ${dragging ? "border-purple-500 bg-purple-50 scale-[1.01]" : "border-slate-300 bg-slate-50 hover:border-purple-400 hover:bg-purple-50/40"}`}
        onDragOver={e => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
      >
        <input type="file" accept={ACCEPTED} className="sr-only" onChange={onInputChange} disabled={uploading} />
        {uploading ? (
          <>
            <Loader2 className="w-10 h-10 text-purple-500 animate-spin" />
            <p className="text-sm font-medium text-purple-600">Uploading...</p>
          </>
        ) : (
          <>
            <div className="w-16 h-16 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-center">
              <Upload className="w-8 h-8 text-slate-400" />
            </div>
            <div className="text-center">
              <p className="font-semibold text-slate-700">Drop your file here, or <span className="text-purple-600">browse</span></p>
              <p className="text-xs text-slate-400 mt-1">PDF, PNG, JPG, WebP — max {MAX_MB} MB</p>
            </div>
          </>
        )}
      </label>

      {/* Uploaded menus list */}
      {menus.length > 0 && (
        <div className="space-y-3">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Uploaded Menus</p>
          {menus.map(menu => (
            <div key={menu.id} className="flex items-center gap-3 p-3 bg-white border border-slate-200 rounded-xl shadow-sm">
              <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                {menu.file_type === "pdf"
                  ? <FileText className="w-5 h-5 text-red-500" />
                  : <ImageIcon className="w-5 h-5 text-blue-500" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-900 truncate">{menu.label}</p>
                <p className="text-xs text-slate-400 uppercase">{menu.file_type}</p>
              </div>
              <a
                href={menu.public_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-purple-600 hover:underline font-medium shrink-0"
              >
                Preview
              </a>
              <button
                onClick={() => handleDelete(menu)}
                disabled={deletingId === menu.id}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
              >
                {deletingId === menu.id
                  ? <Loader2 className="w-4 h-4 animate-spin" />
                  : <Trash2 className="w-4 h-4" />}
              </button>
            </div>
          ))}
        </div>
      )}

      {menus.length === 0 && !uploading && (
        <div className="flex items-center gap-2 text-xs text-slate-400 justify-center">
          <CheckCircle2 className="w-4 h-4" />
          No menus uploaded yet
        </div>
      )}
    </div>
  );
}
