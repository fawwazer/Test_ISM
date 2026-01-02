function getRiskCategory(totalScore) {
  if (totalScore < 55) {
    return "HIGH RISK";
  } else if (totalScore >= 55 && totalScore < 70) {
    return "MEDIUM RISK";
  } else {
    return "LOW RISK";
  }
}

module.exports = { getRiskCategory };
