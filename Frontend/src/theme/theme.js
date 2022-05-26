const night = true;
module.exports = {
  background: night ? "#423E37" : "white",
  tintedBackground: night ? "#373F42" : "#b7c0c4",
  primary: night ? "#25ced1" : "#2176AE",
  secondary: night ? "#E3B23C" : "#FF8A5B",
  highlight: night ? "#FF8A5B" : "#FE7F2D",
  backgroundGradient: night
    ? "linear-gradient(-30deg, rgba(33, 118, 174,1) 10%, rgba(37,206,209,1) 80%);"
    : "linear-gradient(30deg, rgba(33, 118, 174,1) 10%, rgba(37,206,209,1) 80%);",
        highlightGradient:night 
        ? "linear-gradient(18deg, rgba(255,138,91,1) 22%, rgba(227,178,60,1) 64%)"
        :"linear-gradient(18deg, rgba(255,138,91,1) 22%, rgba(227,178,60,1) 64%)",
  shadowEffect: night ? "teal" : "#25ced1",
};
