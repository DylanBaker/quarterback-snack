export interface QB {
  id: number;
  name: string;
  team: string;
  abbr: string;
  color: string;
  division: string;
}

export const QBS: QB[] = [
  { id: 0,  name: "Josh Allen",        team: "Bills",      abbr: "BUF", color: "#00338D", division: "AFC East" },
  { id: 1,  name: "Malik Willis",       team: "Dolphins",   abbr: "MIA", color: "#008E97", division: "AFC East" },
  { id: 2,  name: "Drake Maye",         team: "Patriots",   abbr: "NE",  color: "#0A2342", division: "AFC East" },
  { id: 3,  name: "Geno Smith",         team: "Jets",       abbr: "NYJ", color: "#125740", division: "AFC East" },
  { id: 4,  name: "Lamar Jackson",      team: "Ravens",     abbr: "BAL", color: "#241773", division: "AFC North" },
  { id: 5,  name: "Joe Burrow",         team: "Bengals",    abbr: "CIN", color: "#FB4F14", division: "AFC North" },
  { id: 6,  name: "Shedeur Sanders",    team: "Browns",     abbr: "CLE", color: "#FF3C00", division: "AFC North" },
  { id: 7,  name: "Aaron Rodgers",      team: "Steelers",   abbr: "PIT", color: "#FFB612", division: "AFC North" },
  { id: 8,  name: "C.J. Stroud",        team: "Texans",     abbr: "HOU", color: "#A71930", division: "AFC South" },
  { id: 9,  name: "Daniel Jones",       team: "Colts",      abbr: "IND", color: "#002C5F", division: "AFC South" },
  { id: 10, name: "Trevor Lawrence",    team: "Jaguars",    abbr: "JAX", color: "#006778", division: "AFC South" },
  { id: 11, name: "Cam Ward",           team: "Titans",     abbr: "TEN", color: "#4B92DB", division: "AFC South" },
  { id: 12, name: "Bo Nix",             team: "Broncos",    abbr: "DEN", color: "#FA4616", division: "AFC West" },
  { id: 13, name: "Patrick Mahomes",    team: "Chiefs",     abbr: "KC",  color: "#E31837", division: "AFC West" },
  { id: 14, name: "Kirk Cousins",       team: "Raiders",    abbr: "LV",  color: "#161616", division: "AFC West" },
  { id: 15, name: "Justin Herbert",     team: "Chargers",   abbr: "LAC", color: "#0080C6", division: "AFC West" },
  { id: 16, name: "Dak Prescott",       team: "Cowboys",    abbr: "DAL", color: "#003594", division: "NFC East" },
  { id: 17, name: "Jaxson Dart",        team: "Giants",     abbr: "NYG", color: "#0B2265", division: "NFC East" },
  { id: 18, name: "Jalen Hurts",        team: "Eagles",     abbr: "PHI", color: "#004C54", division: "NFC East" },
  { id: 19, name: "Jayden Daniels",     team: "Commanders", abbr: "WAS", color: "#5A1414", division: "NFC East" },
  { id: 20, name: "Caleb Williams",     team: "Bears",      abbr: "CHI", color: "#C83803", division: "NFC North" },
  { id: 21, name: "Jared Goff",         team: "Lions",      abbr: "DET", color: "#0076B6", division: "NFC North" },
  { id: 22, name: "Jordan Love",        team: "Packers",    abbr: "GB",  color: "#203731", division: "NFC North" },
  { id: 23, name: "Kyler Murray",       team: "Vikings",    abbr: "MIN", color: "#4F2683", division: "NFC North" },
  { id: 24, name: "Michael Penix Jr.",  team: "Falcons",    abbr: "ATL", color: "#C8102E", division: "NFC South" },
  { id: 25, name: "Bryce Young",        team: "Panthers",   abbr: "CAR", color: "#0085CA", division: "NFC South" },
  { id: 26, name: "Tyler Shough",       team: "Saints",     abbr: "NO",  color: "#9F8958", division: "NFC South" },
  { id: 27, name: "Baker Mayfield",     team: "Buccaneers", abbr: "TB",  color: "#D50A0A", division: "NFC South" },
  { id: 28, name: "Jacoby Brissett",    team: "Cardinals",  abbr: "ARI", color: "#97233F", division: "NFC West" },
  { id: 29, name: "Matthew Stafford",   team: "Rams",       abbr: "LAR", color: "#003594", division: "NFC West" },
  { id: 30, name: "Brock Purdy",        team: "49ers",      abbr: "SF",  color: "#AA0000", division: "NFC West" },
  { id: 31, name: "Sam Darnold",        team: "Seahawks",   abbr: "SEA", color: "#69BE28", division: "NFC West" },
];

export const QB_MAP = new Map(QBS.map(qb => [qb.id, qb]));

export const ROUND_LABELS = ["WILD CARD", "DIVISIONAL", "CONFERENCE", "CHAMPIONSHIP", "FINAL", "COMPLETE"];
