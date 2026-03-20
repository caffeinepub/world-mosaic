import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ImagePlus, Loader2 } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { useCreatePost } from "../hooks/useQueries";
import { uploadFileToStorage } from "../utils/uploadFile";

interface CreatePostModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: bigint;
}

export function CreatePostModal({
  open,
  onOpenChange,
  userId,
}: CreatePostModalProps) {
  const [imageUrl, setImageUrl] = useState("");
  const [imagePreview, setImagePreview] = useState("");
  const [caption, setCaption] = useState("");
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const createPost = useCreatePost();

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const preview = URL.createObjectURL(file);
    setImagePreview(preview);
    setUploading(true);
    try {
      const url = await uploadFileToStorage(file);
      setImageUrl(url);
    } catch {
      toast.error("Failed to upload image. Please try again.");
      setImagePreview("");
    } finally {
      setUploading(false);
    }
  };

  const reset = () => {
    setImageUrl("");
    setImagePreview("");
    setCaption("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageUrl) {
      toast.error("Please upload a photo first.");
      return;
    }
    try {
      await createPost.mutateAsync({ authorId: userId, imageUrl, caption });
      toast.success("Post shared!");
      reset();
      onOpenChange(false);
    } catch {
      toast.error("Failed to create post. Please try again.");
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) reset();
        onOpenChange(v);
      }}
    >
      <DialogContent
        data-ocid="create_post.dialog"
        className="max-w-md rounded-2xl"
      >
        <DialogHeader>
          <DialogTitle className="font-display">Share a Photo</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          {/* Image upload area */}
          <button
            type="button"
            className="relative w-full aspect-square bg-muted rounded-xl overflow-hidden border-2 border-dashed border-border hover:border-primary transition-colors flex items-center justify-center cursor-pointer"
            onClick={() => fileInputRef.current?.click()}
            data-ocid="create_post.dropzone"
          >
            {imagePreview ? (
              <img
                src={imagePreview}
                alt="Preview"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="text-center pointer-events-none">
                <ImagePlus className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">
                  Click to upload photo
                </p>
              </div>
            )}
            {uploading && (
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-white animate-spin" />
              </div>
            )}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleImageUpload}
            data-ocid="create_post.upload_button"
          />

          <div className="space-y-2">
            <Label htmlFor="post-caption">Caption</Label>
            <Textarea
              id="post-caption"
              data-ocid="create_post.caption.textarea"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Write a caption..."
              className="rounded-xl min-h-20"
            />
          </div>

          <Button
            type="submit"
            data-ocid="create_post.submit_button"
            disabled={createPost.isPending || uploading || !imageUrl}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl gap-2"
          >
            {createPost.isPending && (
              <Loader2 className="w-4 h-4 animate-spin" />
            )}
            Share Post
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
