// Shared helper: turns a preset name (or explicit from/to) into a concrete
// { start, end, groupBy } window used by both the Reports and Revenue endpoints.
function getRange({ range, from, to }) {
  const now = new Date();

  if (range === "custom" && from && to) {
    const start = new Date(from);
    const end = new Date(to);
    end.setHours(23, 59, 59, 999);
    return { start, end, groupBy: "day" };
  }

  const end = new Date(now);
  end.setHours(23, 59, 59, 999);

  let start, groupBy;
  if (range === "daily") {
    start = new Date(now);
    start.setHours(0, 0, 0, 0);
    groupBy = "hour";
  } else if (range === "weekly") {
    start = new Date(now);
    start.setDate(start.getDate() - 6);
    start.setHours(0, 0, 0, 0);
    groupBy = "weekday";
  } else if (range === "monthly") {
    start = new Date(now.getFullYear(), now.getMonth(), 1);
    groupBy = "day";
  } else {
    start = new Date(now.getFullYear(), 0, 1);
    groupBy = "month";
  }

  return { start, end, groupBy };
}

function bucketLabel(date, groupBy) {
  if (groupBy === "hour") return `${date.getHours().toString().padStart(2, "0")}:00`;
  if (groupBy === "weekday") return date.toLocaleDateString("en-US", { weekday: "short" });
  if (groupBy === "day") return date.getDate().toString();
  if (groupBy === "month") return date.toLocaleDateString("en-US", { month: "short" });
  return date.toISOString().slice(0, 10);
}

module.exports = { getRange, bucketLabel };