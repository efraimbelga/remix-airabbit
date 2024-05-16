import {
  BlobServiceClient,
  StorageSharedKeyCredential,
} from "@azure/storage-blob";
import { compactDecrypt, importJWK, jwtVerify } from "jose";

const env = process.env;
import fs from "fs";
import path from "path";

export const fnJweDecrypt = async (jwe) => {
  const secretKey = env.USER_SECRET;
  const jwk = await importJWK({
    kty: "oct",
    k: secretKey,
  });
  const { plaintext } = await compactDecrypt(jwe, jwk);
  const jwt = new TextDecoder().decode(plaintext);
  return jwt;
};

export const fnJwtVerify = async (jwt) => {
  try {
    const secretKey = env.USER_SECRET;
    const jwk = await importJWK({
      kty: "oct",
      k: secretKey,
    });

    const { payload } = await jwtVerify(jwt, jwk);
    return payload.sasURL;
  } catch (error) {
    throw new Response("Not Found", { status: 404 });
  }
};

export const donwloadToTemp = async (encSas) => {
  try {
    const sasURL = Buffer.from(encSas, "base64").toString("utf-8");
    const uri = new URL(sasURL);
    const sasToken = new URLSearchParams(uri.search);

    const host = uri.host;

    const protocol = uri.protocol;
    const pathname = uri.pathname;
    const filename = path.basename(pathname);
    const [container] = path
      .dirname(pathname.replace(/^\/|\/$/g, ""))
      .split("/");
    const blobServiceClient = new BlobServiceClient(
      `${protocol}//${host}?${sasToken}`
    );
    const containerClient = blobServiceClient.getContainerClient(container);
    const blobClient = containerClient.getBlobClient(filename);

    const downloadsPath = "/downloads";

    if (!fs.existsSync(downloadsPath)) {
      fs.mkdirSync(downloadsPath);
    }
    const newFileNameAndPath = path.join(downloadsPath, filename);
    console.log({ newFileNameAndPath });
    await blobClient.downloadToFile(newFileNameAndPath);

    return newFileNameAndPath;
  } catch (error) {
    throw error;
  }
};

export const createContainer = async () => {
  try {
    const account = env.STORAGE_ACCOUNT;
    const accountKey = env.ACCOUNT_KEY;
    const containerName = "web";
    const sharedKeyCredential = new StorageSharedKeyCredential(
      account,
      accountKey
    );
    const blobServiceClient = new BlobServiceClient(
      `https://${account}.blob.core.windows.net`,
      sharedKeyCredential
    );

    const containerClient = blobServiceClient.getContainerClient(containerName);
    await containerClient.createIfNotExists();
    return containerClient;
  } catch (error) {
    throw error;
  }
};

export const uploadBlob = async (newFileNameAndPath, containerClient) => {
  try {
    const blobName = path.basename(newFileNameAndPath);
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);
    await blockBlobClient.uploadFile(newFileNameAndPath.replaceAll("\\", "/"));
    return newFileNameAndPath;
  } catch (error) {
    throw error;
  }
};

export const deleteFile = (filePath) => {
  try {
    const result = fs.unlinkSync(filePath);
    return result;
  } catch (err) {
    console.error("Error deleting file:", err);
  }
};
