import { useEffect, useMemo, useState } from "react";
import "../Css/Team.css";

const currentYear = new Date().getFullYear();

const historyYears = Array.from(
  { length: 2025 - 1958 + 1 },
  (_, index) => 2025 - index
);

const teamColors = [
  ["#e10600", "#730300"],
  ["#1685c8", "#092f50"],
  ["#ef7d00", "#793500"],
  ["#199477", "#073f34"],
  ["#4258c9", "#171f55"],
  ["#9b3cc0", "#461558"],
  ["#cc2352", "#5c0b25"],
  ["#607d8b", "#26363d"],
];

const getTeamColors = (teamId) => {
  const colorNumber = [...teamId].reduce(
    (total, character) => total + character.charCodeAt(0),
    0
  );

  return teamColors[colorNumber % teamColors.length];
};

const normalizeName = (name = "") =>
  name.toLowerCase().replace(/[^a-z0-9]/g, "");

const getDriverInitials = (driverName = "") =>
  driverName
    .split(" ")
    .map((part) => part.charAt(0))
    .join("")
    .slice(0, 2)
    .toUpperCase();

const Team = () => {
  const [selectedSeason, setSelectedSeason] = useState("current");
  const [teams, setTeams] = useState([]);
  const [currentStandings, setCurrentStandings] = useState({});
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [teamSearch, setTeamSearch] = useState("");
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
        console.warn("Driver pictures are unavailable:", imageError);
        return {};
      }
    };

    const loadTeams = async () => {
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
          throw new Error("The F1 API did not respond.");
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
              number: entry.Driver.permanentNumber || "",
              nationality: entry.Driver.nationality,
              position: entry.position,
              points: entry.points,
              wins: entry.wins,
              image:
                driverImages[normalizeName(driverName)] || "",
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
        console.error("Could not load F1 teams:", requestError);
        setError("Could not load F1 team information.");
        setTeams([]);
      } finally {
        setLoading(false);
      }
    };

    loadTeams();
  }, [selectedSeason]);

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
    <main className="teams-page">
      <header className="teams-heading">
        <p>Formula 1 Constructors</p>
        <h1>F1 Teams</h1>
        <span>
          Explore current teams and Formula 1 constructor history.
        </span>
      </header>

      <section className="team-public-filters">
        <label>
          Championship season

          <select
            value={selectedSeason}
            onChange={(event) =>
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

        <label>
          Find a team

          <input
            type="search"
            value={teamSearch}
            onChange={(event) => setTeamSearch(event.target.value)}
            placeholder="Search team name"
          />
        </label>
      </section>

      <div className="team-season-heading">
        <div>
          <p>Constructor standings</p>
          <h2>{seasonLabel}</h2>
        </div>

        <span>{visibleTeams.length} teams</span>
      </div>

      {loading && (
        <p className="team-page-message">
          Loading {seasonLabel} teams...
        </p>
      )}

      {error && <p className="team-page-message">{error}</p>}

      {!loading && !error && visibleTeams.length === 0 && (
        <p className="team-page-message">
          No constructor standings were found.
        </p>
      )}

      <section className="public-team-grid">
        {visibleTeams.map((team) => (
          <button
            className="public-team-card"
            type="button"
            key={team.id}
            style={{
              background: `linear-gradient(135deg, ${team.primaryColor}, ${team.secondaryColor})`,
            }}
            onClick={() => setSelectedTeam(team)}
          >
            <div className="public-team-position">
              <span>P</span>
              {team.position}
            </div>

            <div className="public-team-top">
              <div>
                <p>{team.nationality}</p>
                <h2>{team.name}</h2>
              </div>
            </div>

            <div className="public-team-statistics">
              <div>
                <span>Points</span>
                <strong>{team.points}</strong>
              </div>

              <div>
                <span>Wins</span>
                <strong>{team.wins}</strong>
              </div>
            </div>

            <div className="public-team-drivers">
              {team.drivers.length === 0 ? (
                <p>Driver information unavailable</p>
              ) : (
                team.drivers.map((driver) => (
                  <div key={driver.id}>
                    {driver.image ? (
                      <img
                        src={driver.image}
                        alt={driver.name}
                        onError={(event) => {
                          event.currentTarget.style.display = "none";
                          event.currentTarget.nextElementSibling.style.display =
                            "grid";
                        }}
                      />
                    ) : null}

                    <span
                      className="driver-initial"
                      style={{
                        display: driver.image ? "none" : "grid",
                      }}
                    >
                      {getDriverInitials(driver.name)}
                    </span>

                    <strong>
                      {driver.number && `#${driver.number} `}
                      {driver.name}
                    </strong>
                  </div>
                ))
              )}
            </div>

            <span className="view-team-text">
              View team details →
            </span>
          </button>
        ))}
      </section>

      {selectedTeam && (
        <div
          className="team-details-overlay"
          role="presentation"
          onClick={() => setSelectedTeam(null)}
        >
          <article
            className="team-details"
            role="dialog"
            aria-modal="true"
            aria-label={`${selectedTeam.name} details`}
            onClick={(event) => event.stopPropagation()}
          >
            <button
              className="close-team-details"
              type="button"
              onClick={() => setSelectedTeam(null)}
              aria-label="Close team details"
            >
              ×
            </button>

            <div
              className="team-details-banner"
              style={{
                background: `linear-gradient(135deg, ${selectedTeam.primaryColor}, ${selectedTeam.secondaryColor})`,
              }}
            >
              <p>{selectedTeam.nationality}</p>
              <h2>{selectedTeam.name}</h2>
              <span>{seasonLabel} Constructor</span>
            </div>

            <div className="team-details-content">
              <div className="team-facts">
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

              <div className="team-detail-drivers">
                {selectedTeam.drivers.length === 0 ? (
                  <p>Driver information is unavailable.</p>
                ) : (
                  selectedTeam.drivers.map((driver) => (
                    <div key={driver.id}>
                      <div className="team-driver-picture">
                        {driver.image ? (
                          <img
                            src={driver.image}
                            alt={driver.name}
                            onError={(event) => {
                              event.currentTarget.style.display =
                                "none";

                              event.currentTarget.nextElementSibling.style.display =
                                "grid";
                            }}
                          />
                        ) : null}

                        <span
                          className="driver-initial"
                          style={{
                            display: driver.image
                              ? "none"
                              : "grid",
                          }}
                        >
                          {getDriverInitials(driver.name)}
                        </span>
                      </div>

                      <div>
                        <strong>{driver.name}</strong>

                        <span>
                          {driver.number
                            ? `#${driver.number} · `
                            : ""}
                          {driver.nationality}
                        </span>

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
                <a
                  className="team-history-link"
                  href={selectedTeam.informationUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  Read team history
                </a>
              )}
            </div>
          </article>
        </div>
      )}
    </main>
  );
};

export default Team;