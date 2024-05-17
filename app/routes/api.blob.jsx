import {
  Outlet,
  isRouteErrorResponse,
  json,
  useLoaderData,
  useRouteError,
} from "@remix-run/react";
import React from "react";
import {
  uploadBlob,
  donwloadToTemp,
  fnJweDecrypt,
  fnJwtVerify,
} from "../lib/api.server";

import { getSession } from "../sessions";
import { redirect } from "@remix-run/node";

export async function loader({ request }) {
  try {
    const url = new URL(request.url);
    const jwe = url.searchParams.get("id");
    if (!jwe) {
      throw new Response("Page not Found", { status: 404 });
    }

    // const userSession = await getSession();
    // console.log(userSession.has("userId"));
    // if (userSession.has("userId")) {
    //   return redirect("/api/login");
    // }

    const jwt = await fnJweDecrypt(jwe);
    const encSAS = await fnJwtVerify(jwt);
    const tempPath = await donwloadToTemp(encSAS);
    const blobName = await uploadBlob(tempPath);
    return json({ blobName });
  } catch (e) {
    console.log({ e });
    throw new Response(
      e.status && e.status === 404
        ? "Page not found!"
        : "Oh no! Something went wrong!",
      {
        status: e.status || 500,
      }
    );
  }
}

export function ErrorBoundary() {
  const error = useRouteError();
  if (isRouteErrorResponse(error)) {
    return (
      <div style={{ height: "100vh" }}>
        <div className=" h-100 d-flex justify-content-center align-items-center">
          <div>
            <h1 className="text-danger">{error.status}</h1>
            <p>⚠ {error.data}</p>
          </div>
        </div>
      </div>
    );
  }
}

const blob = () => {
  const { blobName } = useLoaderData();

  return (
    <div style={{ height: "100vh" }}>
      <div className=" h-100 d-flex justify-content-center align-items-center">
        <div>
          <h1 className="text-success">Success!</h1>
          <p>✅{blobName} was uploaded Successfully!</p>
          <Outlet />
        </div>
      </div>
    </div>
  );
};
export default blob;
