export function validate(value) {
  if (isNaN(value)) {
    return value.slice(0, -1);
  }
  return value;
}

export function numericFormat(value) {
  let v = value.split(".");
  let firstNonNullDecimal = 0;

  if (v[0] == "0") {
    for (let i in v[1]) {
      if (v[1][i] == 0) {
        continue;
      }
      firstNonNullDecimal = i;
      const factor = Math.pow(10, firstNonNullDecimal) * 10000;
      const out = Math.floor(value * factor) / factor;
      return out.toFixed(parseInt(firstNonNullDecimal) + 3);
    }
  } else if (v[0].length < 5) {
    return (Math.floor(value * 1000) / 1000).toLocaleString().replaceAll(",","'");
  } else if (v[0].length >= 5) {
    return Math.floor(value).toLocaleString().replaceAll(",","'");
  }
  return value;
}