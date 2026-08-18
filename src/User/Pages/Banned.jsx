import { Link } from "react-router-dom";
import "../Css/Banned.css";

const Banned = () => {
  return (
    <main className="banned-page">
      <section className="banned-popup">
        <div className="banned-icon">!</div>

        <p className="banned-label">ACCOUNT RESTRICTED</p>

        <h1>Your account has been banned</h1>

        <p className="banned-message">
          Your account has violated the platform rules. An administrator
          has banned your account, so you can no longer use signed-in
          features.
        </p>

        <p className="banned-contact">
          If you believe this was a mistake, you may contact the
          administrator for more information.
        </p>

        <Link className="banned-login-link" to="/Login">
          Return to login
        </Link>
      </section>
    </main>
  );
};

export default Banned;