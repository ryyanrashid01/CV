import { StrictMode } from "react"
import { createRoot } from "react-dom/client"

// Base styles load first so component stylesheets can refine them.
import "lenis/dist/lenis.css"
import "./index.css"
import App from "./App"

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
