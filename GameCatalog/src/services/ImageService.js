import { encode } from "base-64";

const privateKey = "user-secret";
const base64Auth = encode(privateKey + ":");

export const uploadImage = async (fileUri) => {
  if (!fileUri || fileUri.startsWith("http")) {
    return { url: fileUri || "", fileId: null };
  }

  const formData = new FormData();
  const filename = fileUri.split("/").pop();
  const match = /\.(\w+)$/.exec(filename);
  const type = match ? `image/${match[1]}` : `image/jpeg`;

  formData.append("file", { uri: fileUri, name: filename, type });
  formData.append("fileName", filename);

  try {
    const response = await fetch(
      "https://upload.imagekit.io/api/v1/files/upload",
      {
        method: "POST",
        body: formData,
        headers: {
          Authorization: `Basic ${base64Auth}`,
        },
      },
    );

    const data = await response.json();

    if (data.error || !data.url) {
      console.error("ImageKit error message:", data.message || data.error);
      return { url: "", fileId: null };
    }

    console.log(
      "The image has been successfully uploaded to ImageKit:",
      data.url,
    );
    return { url: data.url, fileId: data.fileId };
  } catch (error) {
    console.error("ImageKit network error:", error);
    return { url: "", fileId: null };
  }
};

export const deleteImageFromCloud = async (fileId) => {
  if (!fileId) {
    console.log("Deletion cancelled: fileId is missing.");
    return;
  }

  try {
    const response = await fetch(`https://api.imagekit.io/v1/files/${fileId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Basic ${base64Auth}`,
      },
    });

    if (response.status === 204 || response.status === 200) {
      console.log("The image was successfully deleted from ImageKit.");
    } else {
      const errorText = await response.text();
      console.log("ImageKit Error (Status):", response.status, errorText);
    }
  } catch (error) {
    console.error("Network error while deleting from ImageKit:", error);
  }
};
