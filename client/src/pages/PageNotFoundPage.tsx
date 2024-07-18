import { Link } from "react-router-dom";

export default function PageNotFoundPage() {
  return (
    <div>
      <h1>Page Not Found</h1>
      <Link to="/">Go Home</Link>
    </div>
  );
}
