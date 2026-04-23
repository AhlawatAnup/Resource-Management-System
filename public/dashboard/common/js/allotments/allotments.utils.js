export const AllotmentsUtils = {
  formatAllotments(allotments = []) {
    return allotments.map((entry) => ({
      from: new Date(entry.startTime?.$date || entry.startTime),
      to: new Date(entry.endTime?.$date || entry.endTime),
    }));
  },
};
