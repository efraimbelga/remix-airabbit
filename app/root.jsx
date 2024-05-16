import { Links, Meta, Outlet, Scripts } from "@remix-run/react";
import "bootstrap/dist/css/bootstrap.css";

export default function App() {
  return (
    <html>
      <head>
        <link rel="icon" href="data:image/x-icon;base64,AA" />
        <title>AIRabbit Upload</title>
        <Meta />
        <Links />
      </head>
      <body>
        <Outlet />
        <Scripts />
      </body>
    </html>
  );
}
