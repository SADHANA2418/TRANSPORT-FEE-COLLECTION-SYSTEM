import { BlobServiceClient, StorageSharedKeyCredential, generateBlobSASQueryParameters, BlobSASPermissions } from "@azure/storage-blob";
import dotenv from "dotenv";
dotenv.config();

// Initialize Azure Blob Service
const blobServiceClient = BlobServiceClient.fromConnectionString(
  process.env.AZURE_STORAGE_CONNECTION_STRING
);

const containerName = process.env.AZURE_STORAGE_CONTAINER_NAME;

/**
 * Uploads a buffer (PDF, image, etc.) to Azure Blob Storage
 * @param {Buffer} buffer - The file content
 * @param {string} blobName - The name for the blob in storage
 * @returns {string} - The blob name (not full URL)
 */
export const uploadToAzureBlob = async (buffer, blobName) => {
  try {
    const containerClient = blobServiceClient.getContainerClient(containerName);

    // Create container if it doesn't exist
    const exists = await containerClient.exists();
    if (!exists) {
      await containerClient.create({ access: "private" }); // keep private
    }

    const blockBlobClient = containerClient.getBlockBlobClient(blobName);

    await blockBlobClient.uploadData(buffer, {
      blobHTTPHeaders: { blobContentType: "application/pdf" },
    });

    return blobName; // return blobName only
  } catch (err) {
    console.error("Azure Blob upload error:", err);
    throw err;
  }
};

/**
 * Generates a SAS URL for a blob
 * @param {string} blobName - The blob name in container
 * @param {number} expiresInMinutes - Expiry time in minutes
 * @returns {string} - The SAS URL
 */
export const generateSasUrl = (blobName, expiresInMinutes = 60) => {
  const sharedKeyCredential = new StorageSharedKeyCredential(
    process.env.AZURE_STORAGE_ACCOUNT_NAME,
    process.env.AZURE_STORAGE_ACCOUNT_KEY
  );

  const sasToken = generateBlobSASQueryParameters({
    containerName,
    blobName,
    permissions: BlobSASPermissions.parse("r"), // read-only
    expiresOn: new Date(new Date().valueOf() + expiresInMinutes * 60 * 1000)
  }, sharedKeyCredential).toString();

  return `https://${process.env.AZURE_STORAGE_ACCOUNT_NAME}.blob.core.windows.net/${containerName}/${blobName}?${sasToken}`;
};
