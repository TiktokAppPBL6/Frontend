import { Video, X } from 'lucide-react';

interface FileUploadAreaProps {
  preview: string | null;
  file: File | null;
  error?: string;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemove: () => void;
}

export function FileUploadArea({ preview, file, error, onFileChange, onRemove }: FileUploadAreaProps) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-gray-300">Video</label>
      <div className="border-2 border-dashed border-gray-700 rounded-lg p-8 text-center hover:border-[#FE2C55] transition-colors bg-[#121212]">
        {preview ? (
          <div className="relative">
            <video
              src={preview}
              controls
              className="w-full max-h-96 rounded-lg mx-auto"
            />
            <button
              type="button"
              onClick={onRemove}
              className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-2 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <p className="text-sm text-gray-400 mt-2">{file?.name}</p>
          </div>
        ) : (
          <label className="cursor-pointer">
            <input
              type="file"
              accept="video/*"
              onChange={onFileChange}
              className="hidden"
            />
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mb-4">
                <Video className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-white font-medium mb-1">Chọn video để tải lên</p>
              <p className="text-sm text-gray-400 mb-4">Hoặc kéo và thả file</p>
              <div className="space-y-1 text-xs text-gray-500">
                <p>MP4, WebM, hoặc MOV</p>
                <p>Độ phân giải 720x1280 hoặc cao hơn</p>
                <p>Tối đa 2 phút</p>
                <p>Dưới 500MB</p>
              </div>
            </div>
          </label>
        )}
      </div>
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}
