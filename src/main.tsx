import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "./index.css";
import Routing from "./route.tsx";
import { AuthProvider } from "./api/auth-context.tsx";
import { SiteMediaProvider } from "./api/site-media.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <SiteMediaProvider>
          <Routing />
        </SiteMediaProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
);
