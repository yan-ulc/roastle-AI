import LandingPage from "./landing/page";

// Render the landing page at the root route directly. A server redirect here
// made the first visit depend on a second request before the public page could
// render.
export default LandingPage;
