// ─── Google Drive Helpers ───────────────────────────────────
// Handles file operations on Google Drive.

const DRIVE_API_BASE = "https://www.googleapis.com/drive/v3";
const DRIVE_UPLOAD_BASE = "https://www.googleapis.com/upload/drive/v3";

export interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  size?: string;
  createdTime?: string;
  modifiedTime?: string;
  webViewLink?: string;
  webContentLink?: string;
  parents?: string[];
  thumbnailLink?: string;
}

export interface DriveFileList {
  files: DriveFile[];
  nextPageToken?: string;
}

export interface CreateFolderOptions {
  name: string;
  parentId?: string;
}

export interface UploadFileOptions {
  name: string;
  mimeType: string;
  content: Blob | Buffer;
  parentId?: string;
}

export interface ListFilesOptions {
  folderId?: string;
  query?: string;
  pageSize?: number;
  pageToken?: string;
  orderBy?: string;
}

/**
 * Create a folder in Google Drive.
 */
export async function createFolder(
  accessToken: string,
  options: CreateFolderOptions
): Promise<DriveFile> {
  // TODO: Implement folder creation via Drive API
  const metadata = {
    name: options.name,
    mimeType: "application/vnd.google-apps.folder",
    ...(options.parentId ? { parents: [options.parentId] } : {}),
  };

  const response = await fetch(`${DRIVE_API_BASE}/files`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(metadata),
  });

  if (!response.ok) {
    throw new Error(`Failed to create folder: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Upload a file to Google Drive.
 */
export async function uploadFile(
  accessToken: string,
  options: UploadFileOptions
): Promise<DriveFile> {
  // TODO: Implement file upload via Drive API (resumable or multipart)
  const metadata = {
    name: options.name,
    mimeType: options.mimeType,
    ...(options.parentId ? { parents: [options.parentId] } : {}),
  };

  // Using simple upload for now — switch to resumable for large files
  const form = new FormData();
  form.append(
    "metadata",
    new Blob([JSON.stringify(metadata)], { type: "application/json" })
  );
  form.append("file", options.content as Blob);

  const response = await fetch(
    `${DRIVE_UPLOAD_BASE}/files?uploadType=multipart`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      body: form,
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to upload file: ${response.statusText}`);
  }

  return response.json();
}

/**
 * List files in Google Drive, optionally filtered by folder or query.
 */
export async function listFiles(
  accessToken: string,
  options: ListFilesOptions = {}
): Promise<DriveFileList> {
  // TODO: Implement file listing via Drive API
  const params = new URLSearchParams({
    fields: "nextPageToken,files(id,name,mimeType,size,createdTime,modifiedTime,webViewLink,webContentLink,parents,thumbnailLink)",
    pageSize: String(options.pageSize ?? 20),
    orderBy: options.orderBy ?? "modifiedTime desc",
  });

  const queryParts: string[] = ["trashed = false"];
  if (options.folderId) {
    queryParts.push(`'${options.folderId}' in parents`);
  }
  if (options.query) {
    queryParts.push(options.query);
  }
  params.set("q", queryParts.join(" and "));

  if (options.pageToken) {
    params.set("pageToken", options.pageToken);
  }

  const response = await fetch(`${DRIVE_API_BASE}/files?${params.toString()}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to list files: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Get a specific file's metadata from Google Drive.
 */
export async function getFile(
  accessToken: string,
  fileId: string
): Promise<DriveFile> {
  // TODO: Implement file retrieval via Drive API
  const params = new URLSearchParams({
    fields: "id,name,mimeType,size,createdTime,modifiedTime,webViewLink,webContentLink,parents,thumbnailLink",
  });

  const response = await fetch(
    `${DRIVE_API_BASE}/files/${fileId}?${params.toString()}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to get file: ${response.statusText}`);
  }

  return response.json();
}
