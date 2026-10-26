// Outlined from Archivo at 125% width and weight 800, so the mark renders the
// same before fonts load and inside the favicon.
const letters =
  "M260 917.5V230.0H578.6L696.5 528.1Q704 546.8 713.6 574.8Q723.2 602.7 733 632.1Q742.8 661.4 750.1 684.1H757.1Q763.9 663.3 773.4 635.5Q783 607.7 793.1 578.9Q803.2 550.2 811.2 529.0L929.1 230.0H1238.9V917.5H1035.2V562.8Q1035.2 541.4 1035.7 515.5Q1036.2 489.6 1037.2 464.5Q1038.2 439.4 1038.7 421.1H1030.7Q1024.6 440.5 1015.8 466.6Q1007 492.8 998.2 518.4Q989.3 544 981.8 562.8L837.7 917.5H651.2L506.6 562.8Q496.5 536.2 487 509.3Q477.4 482.4 470.1 459.1Q462.7 435.8 457.7 421.1H449.7Q450.7 435.3 451.2 458.6Q451.7 481.9 452.2 508.8Q452.7 535.8 452.7 562.8V917.5ZM1388 917.5V230.0H1960.3Q2035.4 230 2084.7 260.9Q2133.9 291.7 2158.5 342.1Q2183.1 392.5 2183.1 452.1Q2183.1 517.4 2152.2 570.9Q2121.2 624.4 2059 655.5L2199.6 917.5H1969.9L1855.8 688.8H1591.6V917.5ZM1591.6 538.4H1893.8Q1930.5 538.4 1952.4 516.3Q1974.4 494.3 1974.4 457.8Q1974.4 433.1 1964.5 415.9Q1954.6 398.7 1936.7 389.8Q1918.7 380.9 1893.8 380.9H1591.6Z";
const brackets =
  "M0 0H300V72H72V300H0ZM2460 0V300H2388V72H2160V0ZM0 1148V848H72V1076H300V1148ZM2460 1148H2160V1076H2388V848H2460Z";

/** The bracket mark: MR framed like a detection. */
export function Logo({ className = "", title }) {
  return (
    <svg
      className={`logo ${className}`}
      viewBox="0 0 2460 1148"
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : true}
      aria-label={title}
      focusable="false"
    >
      <path className="logo-brackets" d={brackets} />
      <path className="logo-letters" d={letters} />
    </svg>
  );
}
