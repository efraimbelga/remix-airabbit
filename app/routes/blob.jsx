import { Outlet, json, useLoaderData } from "@remix-run/react";
import React from "react";
import {
  uploadBlob,
  createContainer,
  donwloadToTemp,
  fnJweDecrypt,
  fnJwtVerify,
  deleteFile,
} from "../lib/encryption";
import path from "path";
import { getSession } from "../sessions";

export async function loader({ request }) {
  const url = new URL(request.url);
  const jwe = url.searchParams.get("id");
  if (!jwe) {
    throw new Response("Not Found", { status: 404 });
  }

  // const session = await getSession(request.headers.get("Cookie"));
  // if (!session.has("userId")) {
  //   // Redirect to the home page if they are already signed in.
  //   return redirect("/");
  // }

  const jwt = await fnJweDecrypt(jwe);
  if (!jwt) {
    throw new Response("Not Found", { status: 404 });
  }
  const encSas = await fnJwtVerify(jwt);
  if (!encSas) {
    throw new Response("Not Found", { status: 404 });
  }
  const tempPath = await donwloadToTemp(encSas);
  if (!tempPath) {
    throw new Response("Internal Server Error", { status: 500 });
  }
  const container = await createContainer();
  const newPath = await uploadBlob(tempPath, container);
  if (!newPath) {
    throw new Response("Internal Server Error", { status: 500 });
  }
  //   const isDeleted = deleteFile(newPath);
  //   if (!isDeleted) {
  //     throw new Response("Internal Server Error", { status: 500 });
  //   }
  return json({ newPath });
}

const blob = () => {
  const { newPath } = useLoaderData();
  const filename = path.basename(newPath);

  return (
    <div class="container-fluid p-5  text-center">
      <div style={{ marginTop: "100px" }}>
        <h1>Success!</h1>
        <p>{filename} uploaded Successfully!</p>
        <Outlet />
      </div>
    </div>
  );
};

export default blob;
