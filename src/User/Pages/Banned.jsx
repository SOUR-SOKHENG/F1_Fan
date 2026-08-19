import { Link } from "react-router-dom";
import "../Css/Banned.css";

function Banned() {
  return (
    <main className="banned-page grid min-h-screen place-items-center p-6">
      <section className="banned-popup w-full max-w-[520px] px-5 py-[30px] text-center sm:p-[42px]">
        <div className="banned-icon mx-auto mb-5 grid h-[76px] w-[76px] place-items-center rounded-full text-5xl font-black leading-none">
          !
        </div>
        <p className="banned-label mb-2 text-xs font-black tracking-[2px]">
          ACCOUNT RESTRICTED
        </p>
        <h1 className="m-0 text-[clamp(28px,5vw,39px)] italic uppercase">
          Your account has been banned
        </h1>
        <p className="banned-message mb-3 mt-5 text-base leading-[1.65]"> Your account has violated the platform rules. An administrator has banned your account, so you can no longer use signed-in features.</p>
        <p className="banned-contact m-0 rounded-[7px] p-3.5 leading-[1.55]">If you believe this was a mistake, you may contact the administrator for more information.</p>
        <Link className="banned-login-link mt-6 inline-block rounded-lg px-5 py-[11px] font-extrabold no-underline" to="/Login" >
          Return to login
        </Link>
      </section>
    </main>
  );
}

export default Banned;
