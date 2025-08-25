
import { useState, useRef, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface UploadedFile {
  name: string;
  url: string;
  size: number;
  type: string;
  uploadedAt: Date;
}

export const useFileManager = () => {
  const [files, setFiles] = useState<Array<{
    id: string;
    name: string;
    url: string;
    type: string;
    size: number;
    created_at: string;
  }>>([]);
  const [uploading, setUploading] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchFiles = async () => {
      const { data, error } = await supabase.storage
        .from("cms-uploads")
        .list("", { limit: 100, offset: 0, sortBy: { column: "created_at", order: "desc" } });
      if (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        toast({
          title: "Error loading files",
          description: errorMessage,
          variant: "destructive",
        });
        return;
      }
      if (!data) return;

      const filesData = await Promise.all(
        data.map(async (fileObj) => {
          const { data: { publicUrl } } = supabase.storage
            .from("cms-uploads")
            .getPublicUrl(fileObj.name);
          return {
            id: fileObj.name, // Use name as id since storage doesn't provide id
            name: fileObj.name,
            url: publicUrl,
            size: typeof fileObj.metadata?.size === "number" ? fileObj.metadata.size : 0,
            type: fileObj.metadata?.mimetype || "application/octet-stream",
            created_at: fileObj.created_at || new Date().toISOString(),
          };
        })
      );
      setFiles(filesData);
    };
    fetchFiles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);

    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        const fileExt = file.name.split(".").pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
        const filePath = fileName;
        const { error } = await supabase.storage.from("cms-uploads").upload(filePath, file);
        if (error) throw error;
        const { data: { publicUrl } } = supabase.storage.from("cms-uploads").getPublicUrl(filePath);
        return {
          id: `${Date.now()}-${Math.random().toString(36).substring(2)}`,
          name: file.name,
          url: publicUrl,
          size: file.size,
          type: file.type,
          created_at: new Date().toISOString(),
        };
      });

      const newFiles = await Promise.all(uploadPromises);
      setFiles((prev) => [...newFiles, ...prev]);

      toast({
        title: "Upload successful",
        description: `${files.length} file(s) uploaded successfully`,
      });

      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      toast({
        title: "Upload failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const copyToClipboard = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedUrl(url);
      toast({
        title: "URL copied",
        description: "Image URL copied to clipboard",
      });
      setTimeout(() => setCopiedUrl(null), 2000);
    } catch {
      toast({
        title: "Copy failed",
        description: "Failed to copy URL to clipboard",
        variant: "destructive",
      });
    }
  };

  const deleteFile = async (url: string, fileName: string) => {
    try {
      const urlParts = url.split("/");
      const filePath = urlParts[urlParts.length - 1];
      const { error } = await supabase.storage
        .from("cms-uploads")
        .remove([filePath]);
      if (error) throw error;
      setFiles((prev) => prev.filter((file) => file.url !== url));
      toast({
        title: "File deleted",
        description: `${fileName} has been deleted`,
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      toast({
        title: "Delete failed",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  return {
    files,
    setFiles,
    uploading,
    copiedUrl,
    fileInputRef,
    handleFileSelect,
    copyToClipboard,
    deleteFile,
  };
};
