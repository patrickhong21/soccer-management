const oracledb = require("oracledb");

const loadEnvFile = require("./utils/envUtil");
const envVariables = loadEnvFile("../.env");

// Database configuration setup. Ensure your .env file has the required database credentials.
const DB_CONFIG = {
	user: envVariables.ORACLE_USER,
	password: envVariables.ORACLE_PASS,
	connectString: `${envVariables.ORACLE_HOST}:${envVariables.ORACLE_PORT}/${envVariables.ORACLE_DBNAME}`,
	poolMax: 1
};

// Wrapper to manage OracleDB actions, simplifying connection handling.
// https://piazza.com/class/lkk1xyugpas6fo/post/545
let poolMade = false;
let pool;
const withOracleDB = async(action) => {
    let connection;
    try {
        if (!poolMade) {
            await oracledb.createPool(DB_CONFIG);
            pool = oracledb.getPool();
            poolMade = true;
        }

        connection = await pool.getConnection();
        return await action(connection);
    } catch (err) {
        console.error(err);
        throw err;
    } finally {
        if (connection) {
            try {
                await connection.close();
            } catch (err) {
                console.error(err);
            }
        }
    }
};

const testOracleConnection = async () => {
	return await withOracleDB(async (connection) => {
		console.log("Oracle connection success!");
		return true;
	}).catch(() => {
		console.log("Oracle connection failed!");
		return false;
	});
};

const getAllNamePositionTeam = () => {
	return withOracleDB((connection) => {
		return connection.execute(`
			SELECT person_id, name, position, current_team as team
			FROM Athlete, PositionDetails
			WHERE Athlete.jersey_num = PositionDetails.jersey_num
		`).catch((err) => {
			throw err;
		});
	});
};

const getTeams = () => {
	return withOracleDB((connection) => {
		return connection.execute(`
			SELECT team_name
			FROM Team
		`).catch((err) => {
			throw err;
		});
	});
};

const getPositions = () => {
	return withOracleDB((connection) => {
		return connection.execute(`
			SELECT *
			FROM PositionDetails
		`).catch((err) => {
			throw err;
		});
	});
};

const insertAthlete = (body) => {
	const { 
		person_id,
		name,
		birthdate,
		height,
		weight,
		phone_number,
		email,
		address,
		date_started,
		jersey_num,
		current_team,
		salary
	} = body;

	return withOracleDB((connection) => {
		return connection.execute(`
			INSERT INTO Athlete VALUES (
				:person_id, 
				:name, 
				TO_DATE(:birthdate, 'YYYY-MM-DD'),
				:height, 
				:weight, 
				:phone_number, 
				:email, 
				:address, 
				TO_DATE(:date_started, 'YYYY-MM-DD'),
				:jersey_num, 
				:current_team, 
				:salary
			)`, [	
				person_id,
				name,
				birthdate,
				height,
				weight,
				phone_number,
				email,
				address,
				date_started,
				jersey_num,
				current_team,
				salary
			],
			{ autoCommit: true}
		).catch((err) => {
			throw err;
		});
	});
};

const deleteAthlete = (person_id) => {
	return withOracleDB((connection) => {
		return connection.execute(`
				DELETE FROM Athlete
				WHERE person_id = :person_id
			`, 
			[person_id],
			{ autoCommit: true }
		).catch((err) => {
			throw err;
		});
	});
};

const getAthlete = (person_id) => {
	return withOracleDB((connection) => {
		return connection.execute(`
			SELECT *
			FROM Athlete
			WHERE Athlete.person_id = ${person_id}
		`).catch((err) => {
			throw err;
		});
	});
};

const updateAthlete = (body) => {
	const { 
		person_id,
		name,
		birthdate,
		height,
		weight,
		phone_number,
		email,
		address,
		date_started,
		jersey_num,
		current_team,
		salary
	} = body;

	// for some reason bind parameters don't work here...
	return withOracleDB((connection) => {
		return connection.execute(`
				UPDATE Athlete 
				SET name='${name}',
					birthdate=TO_DATE('${birthdate}', 'YYYY-MM-DD'),
					height=${height}, 
					weight=${weight}, 
					phone_number=${phone_number}, 
					email='${email}', 
					address='${address}', 
					date_started=TO_DATE('${date_started}', 'YYYY-MM-DD'),
					jersey_num=${jersey_num}, 
					current_team='${current_team}', 
					salary=${salary}
				WHERE person_id=${person_id}
			`, []
			, { autoCommit: true })
		.catch((err) => {
			throw err;
		});
	});
};

const getPlayerAwards = (person_id) => {
	return withOracleDB((connection) => {
		return connection.execute(`
			SELECT Athlete.person_id, Awards.year, Awards.award_name
			FROM Athlete, WinsAward, Awards
			WHERE Athlete.person_id=WinsAward.person_id AND WinsAward.award_id=Awards.award_id AND Athlete.person_id=${person_id}
		`).catch((err) => {
			throw err;
		});
	});	
};

const getTables = () => {
	return withOracleDB((connection) => {
		// not allowing user to see certain "private" tables, but otherwise is dynamic
		// https://www.sqltutorial.org/sql-list-all-tables/
		return connection.execute(`
			SELECT table_name
			FROM user_tables
			WHERE table_name <> 'PARTICIPATESIN' AND
				table_name <> 'LOCATEDIN' AND
				table_name <> 'HASSPONSOR' AND
				table_name <> 'GIVENBY' AND
				table_name <> 'WINSAWARD' AND
				table_name <> 'REFEREES'
		`).catch((err) => {
			throw err;
		});
	});	
};

const getAttributes = (table_name) => {
	// https://stackoverflow.com/a/32240681
	return withOracleDB((connection) => {
		return connection.execute(`
			SELECT column_name
			FROM USER_TAB_COLS
			WHERE table_name=UPPER('${table_name}')
		`).catch((err) => {
			throw err;
		});
	});	
};

const getTable = (body) => {
	const { table, attributes } = body;

	return withOracleDB((connection) => {
		return connection.execute(`SELECT ${attributes.toString()} FROM ${table}`)
			.catch((err) => {
				throw err;
			});
	});
};

const getStandings = () => {
	const query = 
		`WITH GamesPerTeam AS (
			SELECT t.team_name, COUNT(*) as games_played
			FROM Game g, Team t, ParticipatesIn p
			WHERE g.game_ID = p.game_ID AND (t.team_name = p.team_1 OR t.team_name = p.team_2)
			GROUP BY t.team_name
		),
		-- begin calculations for W/L
		GoalsPerAthlete AS (
			SELECT s.STATS_ID, s.PERSON_ID, s.GAME_ID, SUM(s.goals) AS total_goals
			FROM Athlete a, Statistics s
			WHERE s.PERSON_ID = a.PERSON_ID
			GROUP BY s.stats_ID, s.PERSON_ID, s.GAME_ID
		),
		GoalsPerTeam AS (
			SELECT gpa.stats_id, gpa.game_id, a.CURRENT_TEAM, g.home, g.away, gpa.total_goals
			FROM GoalsPerAthlete gpa, athlete a, Game g
			WHERE gpa.person_id = a.person_id AND gpa.game_id = g.GAME_ID
		),
		HomeGoals AS (
			SELECT gpt.game_id, gpt.home, SUM(gpt.total_goals) as total_goals
			FROM GoalsPerTeam gpt
			WHERE gpt.CURRENT_TEAM = gpt.home
			GROUP BY gpt.game_id, gpt.home
		),
		AwayGoals AS (
		SELECT gpt.game_id, gpt.away, SUM(gpt.total_goals) as total_goals
			FROM GoalsPerTeam gpt
			WHERE gpt.CURRENT_TEAM = gpt.away
			GROUP BY gpt.game_id, gpt.away
		),
		-- col 2, wins
		HomeWins AS (
			SELECT t1.game_id, t1.home, t1.total_goals as home_goals, t2.away, t2.total_goals as away_goals
			FROM HomeGoals t1, AwayGoals t2
			WHERE t1.game_id = t2.game_id AND t1.total_goals > t2.total_goals
		),
		AwayWins AS (
			SELECT t1.game_id, t1.home, t1.total_goals as home_goals, t2.away, t2.total_goals as away_goals
			FROM HomeGoals t1, AwayGoals t2
			WHERE t1.game_id = t2.game_id AND t1.total_goals < t2.total_goals
		),
		WinnerPerGame AS (
			SELECT aw.game_id as game_id, aw.away as team
			FROM AwayWins aw
			UNION
			SELECT hw.game_id as game_id, hw.home as team
			FROM HomeWins hw
		),
		CountWins AS (
			SELECT w.team, Count(*) as winCount
			FROM WinnerPerGame w
			GROUP BY w.team
		),
		CountWinsAll AS (
			SELECT team_name, COALESCE(cw.winCount, 0) as winCount
			FROM team t
				LEFT OUTER JOIN CountWins cw ON t.TEAM_NAME = cw.TEAM
		),
		-- col3, losses
		HomeLosses AS (
			SELECT t1.game_id, t1.home, t1.total_goals as home_goals, t2.away, t2.total_goals as away_goals
			FROM HomeGoals t1, AwayGoals t2
			WHERE t1.game_id = t2.game_id AND t1.total_goals < t2.total_goals
		),
		AwayLosses AS (
			SELECT t1.game_id, t1.home, t1.total_goals as home_goals, t2.away, t2.total_goals as away_goals
			FROM HomeGoals t1, AwayGoals t2
			WHERE t1.game_id = t2.game_id AND t1.total_goals > t2.total_goals
		),
		LosersPerGame AS (
			SELECT al.game_id as game_id, al.away as team
			FROM AwayLosses al
			UNION
			SELECT hl.game_id as game_id, hl.home as team
			FROM HomeLosses hl
		),
		CountLosses AS (
			SELECT l.team, Count(*) as lossCount
			FROM LosersPerGame l
			GROUP BY l.team
		),
		CountLossesAll AS (
			SELECT team_name, COALESCE(lossCount, 0) as lossCount
			FROM team t
				LEFT OUTER JOIN CountLosses cl ON t.TEAM_NAME = cl.TEAM
		),
		-- col4, draws
		HomeDraws AS (
			SELECT t1.game_id, t1.home, t1.total_goals as home_goals, t2.away, t2.total_goals as away_goals
			FROM HomeGoals t1, AwayGoals t2
			WHERE t1.game_id = t2.game_id AND t1.total_goals = t2.total_goals
		),
		AwayDraws AS (
			SELECT t1.game_id, t1.home, t1.total_goals as home_goals, t2.away, t2.total_goals as away_goals
			FROM HomeGoals t1, AwayGoals t2
			WHERE t1.game_id = t2.game_id AND t1.total_goals = t2.total_goals
		),
		DrawsPerGame AS (
			SELECT ad.game_id as game_id, ad.away as team
			FROM AwayDraws ad
			UNION
			SELECT hd.game_id as game_id, hd.home as team
			FROM HomeDraws hd
		),
		CountDraws AS (
			SELECT d.team, Count(*) as drawCount
			FROM DrawsPerGame d
			GROUP BY d.team
		),
		CountDrawsAll AS (
			SELECT team_name, COALESCE(drawCount, 0) as drawCount
			FROM team t
				LEFT OUTER JOIN CountDraws cd ON t.TEAM_NAME = cd.TEAM
		)
		SELECT t.team_name as TeamName, g.games_played as GamesPlayed,
				w.winCount as WinCount, l.lossCount as LossCount, d.drawCount as DrawCount
		FROM team t, GamesPerTeam g, CountWinsAll w, CountLossesAll l, CountDrawsAll d
		WHERE t.TEAM_NAME = g.TEAM_NAME AND t.TEAM_NAME = w.TEAM_NAME AND
			t.TEAM_NAME = l.TEAM_NAME AND t.TEAM_NAME = d.TEAM_NAME
		ORDER BY WinCount DESC
	`;

	return withOracleDB((connection) => {
		return connection.execute(query)
			.catch((err) => {
				throw err;
			});
	});
};


const getMaxAvgGoalsPerGame = () => {
	const query = 
		`WITH GoalsPerAthlete AS (
			SELECT s.STATS_ID, s.PERSON_ID, s.GAME_ID, SUM(s.goals) AS total_goals
			FROM Athlete a, Statistics s
			WHERE s.PERSON_ID = a.PERSON_ID
			GROUP BY s.stats_ID, s.PERSON_ID, s.GAME_ID
		),
		GoalsPerTeam AS (
			SELECT gpa.stats_id, gpa.game_id, a.CURRENT_TEAM, g.home, g.away, gpa.total_goals
			FROM GoalsPerAthlete gpa, athlete a, Game g
			WHERE gpa.person_id = a.person_id AND gpa.game_id = g.GAME_ID
		),
		HomeGoals AS (
			SELECT gpt.game_id, gpt.home, SUM(gpt.total_goals) as total_goals
			FROM GoalsPerTeam gpt
			WHERE gpt.CURRENT_TEAM = gpt.home
			GROUP BY gpt.game_id, gpt.home
		),
		AwayGoals AS (
		SELECT gpt.game_id, gpt.away, SUM(gpt.total_goals) as total_goals
			FROM GoalsPerTeam gpt
			WHERE gpt.CURRENT_TEAM = gpt.away
			GROUP BY gpt.game_id, gpt.away
		),
		AvgGoalsPerGame AS (
			(SELECT home as team, total_goals
			FROM HomeGoals)
			UNION ALL
			(SELECT away as team, total_goals
			FROM AwayGoals)
		)
		SELECT team, avg(total_goals) as AvgGoalsPerGame
		FROM AvgGoalsPerGame a
		GROUP BY team
		HAVING avg(total_goals) >= all  (SELECT avg(a.total_goals)
										FROM AvgGoalsPerGame a
										GROUP BY a.team)
	`;

	return withOracleDB((connection) => {
		return connection.execute(query)
			.catch((err) => {
				throw err;
			});
	});
};

const getFourMostRecentGames = (limit) => {
	const rowsToFetch = limit ? `FETCH FIRST ${limit} ROWS ONLY` : "";

	const query = `
		SELECT game_date, home, home_goals, away, away_goals
		FROM ( -- home TEAM NAME AND home TEAM GOALS
			SELECT hg.game_id, home, "SUM(GOALS)" AS home_goals
			FROM (
				SELECT SUM(GOALS), st.game_id -- all goals in all matches
				FROM ( -- person_id for home team.
					SELECT person_id, game_id
					FROM ( SELECT home, game_id
							FROM game
							ORDER BY game_date DESC
							${rowsToFetch} ) g, Athlete a
					WHERE g.home = a.current_team ) pn , Statistics st
				WHERE pn.PERSON_ID = st.PERSON_ID AND pn.game_id = st.game_id
				GROUP BY st.game_id ) hg, (
						SELECT game_id, home -- game id
							FROM game
							ORDER BY game_date DESC
							${rowsToFetch} ) hgid
			WHERE hg.game_id = hgid.game_id) hid, ( -- away TEAM NAME AND away TEAM GOALS
			SELECT hg.game_id, away, "SUM(GOALS)" AS away_goals
			FROM (
				SELECT SUM(GOALS), st.game_id -- all goals in all matches
				FROM ( -- person_id for away team.
					SELECT person_id, game_id
					FROM (
						SELECT away, game_id
						FROM game
						ORDER BY game_date DESC
						${rowsToFetch} ) g, Athlete a
					WHERE g.away = a.current_team ) pn , Statistics st
				WHERE pn.PERSON_ID = st.PERSON_ID AND pn.game_id = st.game_id
				GROUP BY st.game_id ) hg, (
						SELECT game_id, away -- game id
							FROM game
							ORDER BY game_date DESC
							${rowsToFetch} ) hgid
			WHERE hg.game_id = hgid.game_id) aid ,
			( -- game date
			SELECT game_date, game_id
			FROM game
			ORDER BY game_date DESC
			${rowsToFetch}) did
		WHERE hid.game_id = aid.game_id AND did.game_id = hid.game_id
	`;

	return withOracleDB((connection) => {
		return connection.execute(query)
			.catch((err) => {
				throw err;
			});
	});
}

const getTeamsByCoachExp = () => {
	return withOracleDB((connection) => {
		return connection.execute(`
			SELECT current_team, AVG(EXTRACT(YEAR FROM SYSDATE) - EXTRACT(YEAR FROM date_started)) AS avgCoachingYears
			FROM Coach
			GROUP BY current_team
			HAVING AVG(EXTRACT(YEAR FROM SYSDATE) - EXTRACT(YEAR FROM date_started)) > 15
			ORDER BY avgCoachingYears DESC
		`).catch((err) => {
			throw err;
		});
	});
};

const getRefsInAllGames = () => {
	return withOracleDB((connection) => {
		return connection.execute(`
			SELECT r.NAME, r.CERTIFICATION_LEVEL
			FROM Referee r
			WHERE NOT EXISTS
				((SELECT g.game_id
				FROM Game g)
				MINUS
				(SELECT rs.game_id
				FROM Referees rs
				WHERE r.PERSON_ID = rs.PERSON_ID))
		`).catch((err) => {
			throw err;
		});
	});	
};

const findPhoneNumber = (body) => {
	const {
		person_id,
		phone_number
	} = body;

	return withOracleDB((connection) => {
		return connection.execute(`
			SELECT phone_number
			FROM (
				SELECT person_id, phone_number
				FROM Athlete
				UNION
				SELECT person_id, phone_number
				FROM Coach
				UNION
				SELECT person_id, phone_number
				FROM Referee )
			WHERE phone_number=${phone_number} AND person_id<>${person_id}
		`).catch((err) => {
			throw err;
		});
	});	
};

const findEmail = (body) => {
	const {
		person_id,
		email
	} = body;

	return withOracleDB((connection) => {
		return connection.execute(`
			SELECT email
			FROM (
				SELECT person_id, email
				FROM Athlete
				UNION
				SELECT person_id, email
				FROM Coach
				UNION
				SELECT person_id, email
				FROM Referee )
			WHERE email='${email}' AND person_id<>${person_id}
		`).catch((err) => {
			throw err;
		});
	});	
};

const getVenues = () => {
	return withOracleDB((connection) => {
		return connection.execute(`
			SELECT *
			FROM Venue
		`).catch((err) => {
			throw err;
		});
	});
};

const findGames = (body) => {
	const { venueName } = body;
	return withOracleDB((connection) => {
		return connection.execute(`
			SELECT TO_CHAR(g.game_date, 'YYYY-MM-DD'), g.home, g.away, v.venue_address
			FROM Game g, LocatedIn l, Venue v
			WHERE g.GAME_ID = l.GAME_ID AND l.venue_address = v.venue_address AND v.venue_name = '${venueName}'
			ORDER BY g.game_date DESC
		`).catch((err) => {
			throw err;
		});
	});
};

const filterSponsor = (body) => {
	const { whereClause } = body;

	const where = whereClause ? `WHERE ${whereClause}` : "";

	return withOracleDB((connection) => {
		return connection.execute(`
			SELECT *
			FROM Sponsor
			${where}
		`).catch((err) => {
			throw err;
		});
	});
};

module.exports = {
	testOracleConnection,
	getAllNamePositionTeam,
	getTeams,
	getPositions,
	insertAthlete,
	deleteAthlete,
	getAthlete,
	updateAthlete,
	getPlayerAwards,
	getTables,
	getAttributes,
	getTable,
	getStandings,
	getMaxAvgGoalsPerGame,
	getFourMostRecentGames,
	getTeamsByCoachExp,
	getRefsInAllGames,
	findPhoneNumber,
	findEmail,
	getVenues,
	findGames,
	filterSponsor
};
