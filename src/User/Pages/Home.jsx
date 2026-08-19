import "bootstrap/dist/js/bootstrap.bundle.min.js";
import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../lib/firebase";
import Driver from "../../assets/Media/F1_driver_groupDriver.jpg";
import CalendarPic from "../../assets/Media/f1-calendar.jpg";
import CarouselPic from "../../assets/Media/f1Crusel.jpg";
import "../Css/Overall.css";
import "../Css/Home.css";

function Home() {
  const [standings, setStandings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [prevRace, setPrevRace] = useState(null);
  const [nextRace, setNextRace] = useState(null);
  const [raceResults, setRaceResults] = useState([]);
  const [prevRacePic, setPrevRacePic] = useState("");
  const [nextRacePic, setNextRacePic] = useState("");
  const [driverPics, setDriverPics] = useState({});
  const [homepage, setHomepage] = useState({
    announcement: "",
    firstImageUrl: "",
    secondImageUrl: "",
    thirdImageUrl: "",
  });
  useEffect(() => {
    const loadHomepageContent = async () => {
      try {
        const homepageSnapshot = await getDoc(doc(db, "siteContent", "home"));

        if (homepageSnapshot.exists()) {
          setHomepage((currentHomepage) => ({
            ...currentHomepage,
            ...homepageSnapshot.data(),
          }));
        }
      } catch (error) {
        console.error("Unable to load homepage content:", error);
      }
    };

    loadHomepageContent();
  }, []);
  useEffect(() => {
    const loadF1Data = async () => {
      try {
        const [
          standingsResponse,
          resultsResponse,
          nextRaceResponse,
          previousPosterResponse,
          nextPosterResponse,
          driversResponse,
        ] = await Promise.all([
          fetch("https://api.jolpi.ca/ergast/f1/current/driverstandings/"),
          fetch("https://api.jolpi.ca/ergast/f1/current/last/results/"),
          fetch("https://api.jolpi.ca/ergast/f1/current/next/races/"),
          fetch(
            "https://www.thesportsdb.com/api/v1/json/123/eventspastleague.php?id=4370",
          ),
          fetch(
            "https://www.thesportsdb.com/api/v1/json/123/eventsnextleague.php?id=4370",
          ),
          fetch("https://api.openf1.org/v1/drivers?session_key=latest"),
        ]);

        if (
          !standingsResponse.ok ||
          !resultsResponse.ok ||
          !nextRaceResponse.ok
        ) {
          throw new Error("Could not load the latest F1 data.");
        }

        const standingsData = await standingsResponse.json();
        const resultsData = await resultsResponse.json();
        const nextRaceData = await nextRaceResponse.json();

        const previousPosterData = previousPosterResponse.ok
          ? await previousPosterResponse.json()
          : null;

        const nextPosterData = nextPosterResponse.ok
          ? await nextPosterResponse.json()
          : null;
        const driversData = driversResponse.ok
          ? await driversResponse.json()
          : [];

        const standingsList =
          standingsData?.MRData?.StandingsTable?.StandingsLists?.[0]
            ?.DriverStandings || [];

        const latestRace = resultsData?.MRData?.RaceTable?.Races?.[0] || null;

        const upcomingRace =
          nextRaceData?.MRData?.RaceTable?.Races?.[0] || null;

        const previousEvent = previousPosterData?.events?.[0];
        const nextEvent = nextPosterData?.events?.[0];

        setStandings(standingsList);
        setPrevRace(latestRace);
        setRaceResults(latestRace?.Results || []);
        setNextRace(upcomingRace);

        setPrevRacePic(
          previousEvent?.strPoster || previousEvent?.strThumb || "",
        );

        setNextRacePic(nextEvent?.strPoster || nextEvent?.strThumb || "");
        const imageList = {};

        driversData.forEach((driver) => {
          if (driver.last_name && driver.headshot_url) {
            imageList[driver.last_name.toLowerCase()] =
              driver.headshot_url.replace("/1col/", "/4col/");
          }
        });

        setDriverPics(imageList);
        setError(null);
      } catch (requestError) {
        setError(requestError.message);
      } finally {
        setLoading(false);
      }
    };

    loadF1Data();

    const refreshTimer = setInterval(loadF1Data, 5 * 60 * 1000);

    return () => clearInterval(refreshTimer);
  }, []);

  if (loading) {
    return <p className="grid min-h-[60vh] place-items-center">Loading...</p>;
  }

  if (error) {
    return (
      <p className="grid min-h-[60vh] place-items-center text-red-600">
        Error: {error}
      </p>
    );
  }

  const half = Math.ceil(standings.length / 2);
  const firstHalf = standings.slice(0, half);
  const secondHalf = standings.slice(half);
  const championshipLeader = standings[0];

  const leaderPic = championshipLeader
    ? driverPics[championshipLeader.Driver.familyName.toLowerCase()]
    : "";
  const renderTable = (rows) => (
    <div className="overflow-x-auto">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr>
            <th>No.</th>
            <th>Driver</th>
            <th>Team</th>
            <th>Total Score</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((entry) => (
            <tr key={entry.Driver.driverId}>
              <td>{entry.position}</td>
              <td>
                {entry.Driver.givenName} {entry.Driver.familyName}
              </td>
              <td>{entry.Constructors[0]?.name}</td>
              <td>{entry.points}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
  const renderPodium = () => {
    const podiumOrder = [raceResults[1], raceResults[0], raceResults[2]].filter(
      Boolean,
    );

    return (
      <div className="race-podium">
        {podiumOrder.map((result) => {
          const position = Number(result.position);

          const driverImage =
            driverPics[result.Driver.familyName.toLowerCase()];

          return (
            <div key={result.Driver.driverId} className={`podium-driver podium-position-${position}`} >
              <span className="podium-number">{position}</span>

              {driverImage ? (
                <img src={driverImage} alt={`${result.Driver.givenName} ${result.Driver.familyName}`} />
              ) : (
                <div className="driver-placeholder">
                  {result.Driver.givenName[0]}
                  {result.Driver.familyName[0]}
                </div>
              )}

              <p>
                {result.Driver.givenName} {result.Driver.familyName}
              </p>
            </div>
          );
        })}
      </div>
    );
  };
  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-[#f4f6f9] pt-2 font-sans">
      {homepage.announcement && (
        <div className="w-full bg-[#e10600] px-5 py-[11px] text-center text-[15px] font-bold tracking-[0.3px] text-white mb-2">
          {homepage.announcement}
        </div>
      )}
      <section className="container mb-4">
        <div id="carouselExampleAutoplaying" className="carousel slide" data-bs-ride="carousel" >
          <div className="carousel-inner">
            <div className="carousel-item active">
              <img src={homepage.firstImageUrl || CarouselPic} alt="Leader" style={{ height: "55vh" }} className="d-block w-100 position-relative object-fit-contain" />
            </div>
            <div className="carousel-item">
              <img src={homepage.secondImageUrl || Driver} style={{ height: "55vh" }} className="d-block w-100 object-fit-contain" alt="Leader" />{" "} </div>
            <div className="carousel-item">
              <img src={homepage.thirdImageUrl || CalendarPic} style={{ height: "55vh" }} className="d-block w-100 object-fit-contain" alt="..." />
            </div>
          </div>
          <button className="carousel-control-prev" type="button" data-bs-target="#carouselExampleAutoplaying" data-bs-slide="prev" >
            <span className="carousel-control-prev-icon" aria-hidden="true" ></span>
            <span className="visually-hidden">Previous</span>
          </button>
          <button className="carousel-control-next" type="button" data-bs-target="#carouselExampleAutoplaying" data-bs-slide="next" >
            <span className="carousel-control-next-icon" aria-hidden="true" ></span>
            <span className="visually-hidden">Next</span>
          </button>
        </div>
      </section>
      <section className="w-full content-center items-center">
        <article className="home-welcome grid w-full place-items-center px-4 text-center">
          <h2 className="mb-3">Welcome to Formula 1</h2>
          <p className="w-[90%] max-w-[1100px] leading-relaxed">
            Welcome to Formula 1, the top class of motorsport in the world. Here,
            the fastest drivers race at more than 300 km/h while teams use the best
            cars, technology, and strategy. Every Grand Prix is full of passion,
            pressure, and close competition. F1 is not only about speed; it is
            about teamwork, courage, and the dream of becoming champion.
          </p>
        </article>

        <div className="result flex flex-col lg:flex-row justify-center gap-10 mt-5 px-4">
          <div className="Current-results">
            <h3 className="text-white">Driver Standings</h3>
            <div className="table-result grid grid-cols-1 md:grid-cols-2 gap-4">
              {renderTable(firstHalf)}
              {renderTable(secondHalf)}
            </div>
          </div>
          <div className="Current-Leader">
            <h3>Current WDC Leader</h3>

            {leaderPic ? (
              <img src={leaderPic} alt={ `${championshipLeader.Driver.givenName} ` + championshipLeader.Driver.familyName } />
            ) : (
              <div className="leader-image-placeholder">
                {championshipLeader?.Driver?.givenName?.[0]}
                {championshipLeader?.Driver?.familyName?.[0]}
              </div>
            )}

            <article className="mt-3 p-0">
              <p className="text-2xl font-bold">
                Driver: {championshipLeader?.Driver?.givenName}{" "}
                {championshipLeader?.Driver?.familyName}
              </p>

              <p className="text-2xl font-bold">
                Nationality: {championshipLeader?.Driver?.nationality}
              </p>

              <p className="text-2xl font-bold">
                Team: {championshipLeader?.Constructors?.[0]?.name}
              </p>

              <p className="text-2xl font-bold">
                Points: {championshipLeader?.points}
              </p>
            </article>
          </div>
        </div>
        {/* race icon */}
        <div className="place-items-center gap-0 mt-[150px] grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2">
          <section className="Race-icon">
            <h3 className="text-center text-2xl">Previous Race</h3>
            <div className="race-poster">
              <img className="race-poster-image" src={prevRacePic || CalendarPic} alt={prevRace?.raceName || "Previous race"} onError={(event) => { event.currentTarget.onerror = null; event.currentTarget.src = CalendarPic; }} />
            </div>
          </section>
          <section className="Race-icon">
            <h3 className="text-center text-2xl">Next Race</h3>
            <div className="race-poster">
              <img className="race-poster-image" src={nextRacePic || CalendarPic} alt={nextRace?.raceName || "Next race"} onError={(event) => { event.currentTarget.onerror = null; event.currentTarget.src = CalendarPic; }} />
            </div>
          </section>
        </div>
        <section className="Latest-results">
          <h2 className="text-center">
            {prevRace?.raceName || "Latest Race"} Results
          </h2>

          {raceResults.length >= 3 ? (
            renderPodium()
          ) : (
            <p className="text-center">
              The latest race result is not available yet.
            </p>
          )}
        </section>
        <div className="w-full h-50 mt-5 bg-[#15151e] pt-6">
          <div className=" container-fluid  px-4 mx-auto ">
            <div className="w-full mb-6 block">
              <h2 className="text-2xl sm:text-3xl font-black italic uppercase tracking-wider text-white">
                Highlights 2026 Season
              </h2>
            </div>
            <section className="container-fluid w-100 h-[30vh]  flex overflow-x-auto gap-4 pb-4 scrollbar-thin flex-nowrap">
              <div className="box p-4 bg-gray-200 rounded-md shrink-0 w-full sm:w-[calc(50%-12px)] lg:w-[calc(25%-12px)]">
                <iframe className="w-full aspect-video" src="https://www.youtube.com/embed/eWOsJa24sQo" title="Race Highlights | Formula 1 Canadian Grand Prix 2026" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerPolicy="strict-origin-when-cross-origin" allowfullscreen ></iframe>
              </div>
              <div className="box p-4 bg-gray-200 rounded-md shrink-0 w-full sm:w-[calc(50%-12px)] lg:w-[calc(25%-12px)]">
                <iframe className="w-full aspect-video" src="https://www.youtube.com/embed/ksm1knZbzgc" title="Race Highlights | Formula 1 Miami Grand Prix 2026" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerPolicy="strict-origin-when-cross-origin" allowfullscreen ></iframe>
              </div>
              <div className="box p-4 bg-gray-200 rounded-md shrink-0 w-full sm:w-[calc(50%-12px)] lg:w-[calc(25%-12px)]">
                <iframe className="w-full aspect-video" src="https://www.youtube.com/embed/EW92sQPZuWk" title="Qualifying Highlights | Formula 1 Japanese Grand Prix 2026" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerPolicy="strict-origin-when-cross-origin" allowfullscreen ></iframe>
              </div>
              <div className="box p-4 bg-gray-200 rounded-md shrink-0 w-full sm:w-[calc(50%-12px)] lg:w-[calc(25%-12px)]">
                <iframe className="w-full aspect-video" src="https://www.youtube.com/embed/Fjpn0s-KtKI" title="Race Highlights | Formula 1 Chinese Grand Prix 2026" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerPolicy="strict-origin-when-cross-origin" allowfullscreen ></iframe>
              </div>
              <div className="box p-4 bg-gray-200 rounded-md shrink-0 w-full sm:w-[calc(50%-12px)] lg:w-[calc(25%-12px)]">
                <iframe className="w-full aspect-video" src="https://www.youtube.com/embed/ovJKA-FMJUg" title="Race Highlights | Formula 1 Australian Grand Prix 2026" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerPolicy="strict-origin-when-cross-origin" allowfullscreen ></iframe>
              </div>
            </section>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;
