import { Avatar, AvatarFallback } from "@radix-ui/react-avatar";
import { useRef, useState, useEffect } from "react";

export function AvatarWithUpload({
  form,
  urlPath,
  handleImageUpload,
  uploading,
  readOnly
}: any) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const watchedUrl = form.watch(urlPath);

  const [localUrl, setLocalUrl] = useState<string | null>(null);
  const [imageLoading, setImageLoading] = useState(false);

  useEffect(() => {
    if (watchedUrl) {
      setLocalUrl(watchedUrl);
      setImageLoading(true);
    } else {
      setLocalUrl(null);
      setImageLoading(false);
    }
  }, [watchedUrl]);

  return (
    <>
      <div
        className={
          readOnly
            ? "flex justify-center md:justify-start relative"
            : "flex justify-center md:justify-start cursor-pointer relative"
        }
        onClick={() => inputRef.current?.click()}
      >
        <Avatar className="w-36 h-36 rounded-md overflow-hidden bg-gray-100 dark:bg-gray-800 relative">
          {localUrl ? (
            <>
              <img
                src={localUrl}
                alt="Inventory"
                className={`object-cover w-full h-full ${
                  imageLoading ? "opacity-0" : "opacity-100"
                }`}
                onLoad={() => setImageLoading(false)}
                onError={() => setImageLoading(false)}
              />
              {imageLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-200 dark:bg-gray-700">
                  <span>Loading...</span>
                </div>
              )}
            </>
          ) : (
            <AvatarFallback className="text-4xl"></AvatarFallback>
          )}
        </Avatar>
      </div>
      {!readOnly && (
        <input
          type="file"
          accept="image/*"
          ref={inputRef}
          className="hidden"
          disabled={uploading}
          onChange={async (e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            setImageLoading(true);
            const url = await handleImageUpload(file);
            if (url) form.setValue(urlPath, url);
            else setImageLoading(false);
          }}
        />
      )}
    </>
  );
}
