import React, { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Camera, Loader2, Trophy, UserRound } from 'lucide-react';

export default function HomeProfileHeader({ streak = 0 }) {
  const qc = useQueryClient();
  const fileRef = useRef(null);
  const [uploadError, setUploadError] = useState(null);
  const [uploading, setUploading] = useState(false);

  const { data: user, isLoading: userLoading } = useQuery({
    queryKey: ['user'],
    queryFn: () => base44.auth.me(),
  });

  const photoUrl = user?.profile_photo_url;
  const displayName = user?.full_name?.split(' ')[0] || 'You';

  const uploadMutation = useMutation({
    mutationFn: async (file) => {
      setUploadError(null);
      setUploading(true);
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      await base44.auth.updateMe({ profile_photo_url: file_url });
      try {
        await base44.entities.User.update(user.id, { profile_photo_url: file_url });
      } catch {
        /* User entity update optional */
      }
      return file_url;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['user'] });
      setUploading(false);
    },
    onError: (err) => {
      setUploadError(err?.message || 'Upload failed. Try a smaller image.');
      setUploading(false);
    },
  });

  const onFileChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setUploadError('Please choose a photo image file.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setUploadError('Photo must be under 5 MB.');
      return;
    }
    uploadMutation.mutate(file);
    event.target.value = '';
  };

  if (userLoading) {
    return (
      <section className="rounded-[28px] border border-white/12 bg-white/8 p-4">
        <div className="flex items-center gap-3">
          <div className="h-14 w-14 animate-pulse rounded-full bg-white/10" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-32 animate-pulse rounded bg-white/10" />
            <div className="h-3 w-48 animate-pulse rounded bg-white/10" />
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="rounded-[28px] border border-white/12 bg-white/10 p-4 shadow-xl backdrop-blur-2xl">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className="group relative h-14 w-14 shrink-0 overflow-hidden rounded-full border-2 border-amber-200/40 bg-white/10"
          aria-label="Upload profile photo"
        >
          {photoUrl ? (
            <img src={photoUrl} alt="" className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-amber-300/25 to-blue-400/20">
              <UserRound className="h-6 w-6 text-amber-100" />
            </div>
          )}
          <div className="absolute inset-0 flex items-center justify-center bg-black/45 opacity-0 transition group-hover:opacity-100 group-focus-visible:opacity-100">
            {uploading ? (
              <Loader2 className="h-5 w-5 animate-spin text-white" />
            ) : (
              <Camera className="h-5 w-5 text-white" />
            )}
          </div>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onFileChange} />
        </button>

        <div className="min-w-0 flex-1">
          <p className="truncate font-sans text-lg font-black text-white">Welcome back, {displayName}</p>
          <p className="text-xs font-bold text-slate-300">
            {streak > 0 ? `${streak}-day streak active` : 'Your comeback starts with one step today'}
          </p>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2">
        <Link
          to="/Profile"
          className="flex items-center justify-center gap-2 rounded-2xl border border-amber-200/25 bg-amber-300/12 px-3 py-2.5 text-sm font-black text-amber-50 transition hover:bg-amber-300/20"
        >
          <UserRound className="h-4 w-4" />
          Profile
        </Link>
        <Link
          to="/Progress"
          className="flex items-center justify-center gap-2 rounded-2xl border border-emerald-200/25 bg-emerald-400/12 px-3 py-2.5 text-sm font-black text-emerald-50 transition hover:bg-emerald-400/20"
        >
          <Trophy className="h-4 w-4" />
          My Progress
        </Link>
      </div>

      {uploadError && (
        <p className="mt-2 text-xs font-bold text-rose-200">{uploadError}</p>
      )}
    </section>
  );
}
