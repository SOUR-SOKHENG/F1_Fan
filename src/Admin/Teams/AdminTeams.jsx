import { useEffect, useMemo, useState } from "react";
import "./AdminTeams.css";

const historyYears = Array.from(
  { length: 2025 - 1958 + 1 },
  (_, index) => 2025 - index
);

const teamColors = [
  ["#e10600", "#720300"],
  ["#1678c8", "#092e50"],
  ["#ef7d00", "#7a3500"],
  ["#239a73", "#0b4431"],
  ["#4258c9", "#162056"],
  ["#9b3cc0", "#461558"],
  ["#cc2352", "#5c0b25"],
  ["#607d8b", "#26363d"],
];

const getTeamColors = (teamId) => {
  const number = [...teamId].reduce(
    (total, character) => total + character.charCodeAt(0),
    0
  );

  return teamColors[number % teamColors.length];
};
const currentYear = new Date().getFullYear();

const normalizeName = (name = "") =>
  name.toLowerCase().replace(/[^a-z0-9]/g, "");

const getDriverInitials = (driverName = "") =>
  driverName
    .split(" ")
    .map((part) => part.charAt(0))
    .join("")
    .slice(0, 2)
    .toUpperCase();

function AdminTeams() {
  const [selectedSeason, setSelectedSeason] = useState("current");
  const [teams, setTeams] = useState([]);
  const [currentStandings, setCurrentStandings] = useState({});
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [teamSearch, setTeamSearch] = useState("");
  const [refreshNumber, setRefreshNumber] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadDriverImages = async (season) => {
  if (season < 2023) return {};

  try {
    const sessionsResponse = await fetch(
      `https://api.openf1.org/v1/sessions?year=${season}&session_name=Race`
    );

    if (!sessionsResponse.ok) return {};

    const sessions = await sessionsResponse.json();

    if (sessions.length === 0) return {};

    const newestSession = [...sessions].sort(
      (firstSession, secondSession) =>
        new Date(secondSession.date_start) -
        new Date(firstSession.date_start)
    )[0];

    const driversResponse = await fetch(
      `https://api.openf1.org/v1/drivers?session_key=${newestSession.session_key}`
    );

    if (!driversResponse.ok) return {};

    const drivers = await driversResponse.json();
    const imageMap = {};

    drivers.forEach((driver) => {
      if (!driver.full_name || !driver.headshot_url) return;

      imageMap[normalizeName(driver.full_name)] =
        driver.headshot_url;
    });

    return imageMap;
  } catch (imageError) {
    console.warn("Admin driver pictures are unavailable:", imageError);
    return {};
  }
};
    const loadTeamData = async () => {
      setLoading(true);
      setError("");
      setSelectedTeam(null);

      try {
        const seasonPath =
          selectedSeason === "current"
            ? "current"
            : selectedSeason;
        const imageSeason =
  selectedSeason === "current"
    ? currentYear
    : Number(selectedSeason);
        const [
  standingsResponse,
  driversResponse,
  currentResponse,
  driverImages,
] = await Promise.all([
          fetch(
            `https://api.jolpi.ca/ergast/f1/${seasonPath}/constructorstandings/`
          ),
          fetch(
            `https://api.jolpi.ca/ergast/f1/${seasonPath}/driverstandings/?limit=100`
          ),
          fetch(
            "https://api.jolpi.ca/ergast/f1/current/constructorstandings/"
          ),
          loadDriverImages(imageSeason),
        ]);

        if (
          !standingsResponse.ok ||
          !driversResponse.ok ||
          !currentResponse.ok
        ) {
          throw new Error("The F1 team API did not respond.");
        }

        const standingsData = await standingsResponse.json();
        const driversData = await driversResponse.json();
        const currentData = await currentResponse.json();

        const constructorStandings =
          standingsData?.MRData?.StandingsTable
            ?.StandingsLists?.[0]?.ConstructorStandings || [];

        const driverStandings =
          driversData?.MRData?.StandingsTable
            ?.StandingsLists?.[0]?.DriverStandings || [];

        const currentConstructorStandings =
          currentData?.MRData?.StandingsTable
            ?.StandingsLists?.[0]?.ConstructorStandings || [];

        const currentMap = {};

        currentConstructorStandings.forEach((entry) => {
          currentMap[entry.Constructor.constructorId] = {
            position: entry.position,
            points: entry.points,
            wins: entry.wins,
          };
        });

        const driverMap = {};

        driverStandings.forEach((entry) => {
            const driverName =
  `${entry.Driver.givenName} ${entry.Driver.familyName}`;
          entry.Constructors?.forEach((constructor) => {
            if (!driverMap[constructor.constructorId]) {
              driverMap[constructor.constructorId] = [];
            }

            driverMap[constructor.constructorId].push({
              id: entry.Driver.driverId,
              name: driverName,
image: driverImages[normalizeName(driverName)] || "",
              number: entry.Driver.permanentNumber || "",
              nationality: entry.Driver.nationality,
              position: entry.position,
              points: entry.points,
              wins: entry.wins,
            });
          });
        });

        const teamList = constructorStandings.map((entry) => {
          const constructor = entry.Constructor;
          const colors = getTeamColors(constructor.constructorId);

          return {
            id: constructor.constructorId,
            name: constructor.name,
            nationality: constructor.nationality,
            informationUrl: constructor.url,
            position: entry.position,
            points: entry.points,
            wins: entry.wins,
            drivers: driverMap[constructor.constructorId] || [],
            primaryColor: colors[0],
            secondaryColor: colors[1],
          };
        });

        setTeams(teamList);
        setCurrentStandings(currentMap);
      } catch (requestError) {
        console.error("Could not load team history:", requestError);
        setError("Could not load F1 team information.");
        setTeams([]);
      } finally {
        setLoading(false);
      }
    };

    loadTeamData();
  }, [selectedSeason, refreshNumber]);

  const visibleTeams = useMemo(() => {
    const searchValue = teamSearch.trim().toLowerCase();

    if (!searchValue) return teams;

    return teams.filter((team) =>
      team.name.toLowerCase().includes(searchValue)
    );
  }, [teams, teamSearch]);

  const seasonLabel =
    selectedSeason === "current"
      ? "Current Season"
      : selectedSeason;

  return (
    <main className="min-h-[75vh] w-full">
      <div className="mb-[22px] flex flex-col items-start justify-between gap-5 min-[751px]:flex-row min-[751px]:items-center">
        <div>
          <p className="mb-[5px] text-xs font-black tracking-[1.5px] text-[#e10600]">
            F1 API TEAM DIRECTORY
          </p>
          <h2 className="m-0 text-[31px] text-[#191b20]">Team Championship History</h2>
        </div>

        <div className="flex items-center gap-[9px] rounded-[20px] bg-[#202229] px-3.5 py-[9px] text-xs font-extrabold text-white">
          <span className="h-[9px] w-[9px] rounded-full bg-[#37d86b] shadow-[0_0_0_4px_rgba(55,216,107,0.14)]"></span>
          Automatic API data
        </div>
      </div>

      <section className="grid grid-cols-1 items-end gap-[15px] rounded-[13px] border border-gray-200 bg-white p-5 shadow-md min-[751px]:grid-cols-[220px_minmax(240px,1fr)_auto]">
        <label className="text-[13px] font-extrabold text-gray-700">
          Championship season
          <select className="mt-[7px] block w-full rounded-lg border border-gray-300 bg-gray-50 px-[13px] py-[11px] outline-none focus:border-[#e10600] focus:bg-white focus:ring-4 focus:ring-red-100" value={selectedSeason} onChange={(event) =>
              setSelectedSeason(event.target.value)
            }
          >
            <option value="current">Current season</option>

            {historyYears.map((year) => (
              <option value={year} key={year}>
                {year}
              </option>
            ))}
          </select>
        </label>

        <label className="text-[13px] font-extrabold text-gray-700">
          Filter teams
          <input className="mt-[7px] block w-full rounded-lg border border-gray-300 bg-gray-50 px-[13px] py-[11px] outline-none focus:border-[#e10600] focus:bg-white focus:ring-4 focus:ring-red-100" type="search" value={teamSearch} onChange={(event) => setTeamSearch(event.target.value)} placeholder="Search team name" />
        </label>

        <button className="cursor-pointer rounded-lg border-0 bg-[#e10600] px-[17px] py-[11px] font-extrabold text-white hover:bg-[#b80500]" type="button" onClick={() =>
            setRefreshNumber((currentNumber) => currentNumber + 1)
          }
        >
          Refresh API
        </button>
      </section>

      <div className="mb-[17px] mt-[30px] flex items-end justify-between gap-5">
        <div>
          <p className="mb-[3px] text-[11px] font-black tracking-[1.2px] text-[#e10600]">
            CONSTRUCTOR STANDINGS
          </p>
          <h3 className="m-0 text-[25px] text-[#202229]">{seasonLabel}</h3>
        </div>

        <span className="rounded-[15px] bg-[#202229] px-3 py-[7px] text-[11px] font-extrabold text-white">
          {visibleTeams.length} teams
        </span>
      </div>

      {loading && (
        <p className="rounded-lg border-l-[5px] border-[#e10600] bg-white px-5 py-[30px] text-center text-gray-500">
          Loading {seasonLabel} teams...
        </p>
      )}

      {error && <p className="rounded-lg border-l-[5px] border-[#e10600] bg-white px-5 py-[30px] text-center text-gray-500">{error}</p>}

      {!loading && !error && visibleTeams.length === 0 && (
        <p className="rounded-lg border-l-[5px] border-[#e10600] bg-white px-5 py-[30px] text-center text-gray-500">
          No constructor standings were found for this season.
        </p>
      )}

      <section className="admin-team-history-grid">
        {visibleTeams.map((team) => (
          <button className="admin-team-history-card" type="button" key={team.id} style={{ background: `linear-gradient(135deg, ${team.primaryColor}, ${team.secondaryColor})`, }} onClick={() => setSelectedTeam(team)} >
            <div className="admin-team-position">
              <span>P</span>
              {team.position}
            </div>

            <div className="admin-team-card-heading">
              <p>{team.nationality}</p>
              <h3>{team.name}</h3>
            </div>

            <div className="admin-team-card-statistics">
              <div>
                <span>Points</span>
                <strong>{team.points}</strong>
              </div>

              <div>
                <span>Wins</span>
                <strong>{team.wins}</strong>
              </div>
            </div>

            <div className="admin-team-card-drivers">
              <span>Drivers</span>

              {team.drivers.length === 0 ? (
                <p>Driver data unavailable</p>
              ) : (
                team.drivers.map((driver) => (
  <div className="admin-team-card-driver" key={driver.id} >
    {driver.image ? (
      <img src={driver.image} alt={driver.name} onError={(event) => { event.currentTarget.style.display = "none"; event.currentTarget.nextElementSibling.style.display = "grid"; }} />
    ) : null}

    <span className="admin-driver-initials" style={{ display: driver.image ? "none" : "grid", }} >
      {getDriverInitials(driver.name)}
    </span>

    <p>
      {driver.number && `#${driver.number} `}
      {driver.name}
    </p>
  </div>
))
              )}
            </div>

            <small>View {seasonLabel} details →</small>
          </button>
        ))}
      </section>

      {selectedTeam && (
        <div className="admin-team-modal" onClick={() => setSelectedTeam(null)} >
          <article className="admin-team-modal-content" onClick={(event) => event.stopPropagation()} >
            <button className="admin-team-modal-close" type="button" onClick={() => setSelectedTeam(null)} aria-label="Close team details" >
              ×
            </button>

            <div className="admin-team-modal-banner" style={{ background: `linear-gradient(135deg, ${selectedTeam.primaryColor}, ${selectedTeam.secondaryColor})`, }} >
              <p>{selectedTeam.nationality}</p>
              <h2>{selectedTeam.name}</h2>
              <span>{seasonLabel} Constructor</span>
            </div>

            <div className="admin-team-modal-body">
              <div className="admin-team-modal-facts">
                <div>
                  <span>{seasonLabel} position</span>
                  <strong>P{selectedTeam.position}</strong>
                </div>

                <div>
                  <span>{seasonLabel} points</span>
                  <strong>{selectedTeam.points}</strong>
                </div>

                <div>
                  <span>{seasonLabel} wins</span>
                  <strong>{selectedTeam.wins}</strong>
                </div>

                <div>
                  <span>Current position</span>
                  <strong>
                    {currentStandings[selectedTeam.id]
                      ? `P${currentStandings[selectedTeam.id].position}`
                      : "Not on current grid"}
                  </strong>
                </div>
              </div>

              <h3>{seasonLabel} Drivers</h3>

              <div className="admin-team-modal-drivers">
                {selectedTeam.drivers.length === 0 ? (
                  <p>Driver information is unavailable.</p>
                ) : (
                  selectedTeam.drivers.map((driver) => (
                    <div key={driver.id}>
                      <div className="admin-history-driver-picture">
  {driver.image ? (
    <img src={driver.image} alt={driver.name} onError={(event) => { event.currentTarget.style.display = "none"; event.currentTarget.nextElementSibling.style.display = "grid"; }} />
  ) : null}

  <span className="admin-driver-initials" style={{ display: driver.image ? "none" : "grid", }} >
    {getDriverInitials(driver.name)}
  </span>
</div>

                      <div>
                        <strong>
  {driver.number && `#${driver.number} `}
  {driver.name}
</strong>
                        <span>{driver.nationality}</span>
                        <small>
                          Championship P{driver.position} ·{" "}
                          {driver.points} points · {driver.wins} wins
                        </small>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {selectedTeam.informationUrl && (
                <a href={selectedTeam.informationUrl} target="_blank" rel="noreferrer" >
                  Read team history
                </a>
              )}
            </div>
          </article>
        </div>
      )}
    </main>
  );
}

export default AdminTeams;
