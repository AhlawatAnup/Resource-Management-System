export const AllotmentsUtils = {
  formatAllotments(allotments = []) {
    return allotments.map((entry) => ({
      from: new Date(entry.startTime?.$date || entry.startTime),
      to: new Date(entry.endTime?.$date || entry.endTime),
      bookedBy: entry.resourceRequestId?.studentId?.name || 'Unknown',
    }));
  },
  getAvailableFrom(allotments = []) {
    if (!allotments.length) {
      return 'Today';
    }

    const latestEnd = allotments.reduce((latest, entry) => {
      const end = new Date(entry.to);

      return end > latest ? end : latest;
    }, new Date(0));

    latestEnd.setDate(latestEnd.getDate());

    const today = new Date();

    const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());

    const diffTime = latestEnd.getTime() - startOfToday.getTime();

    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays <= 0) {
      return 'Today';
    }

    if (diffDays === 1) {
      return 'Tomorrow';
    }

    if (diffDays <= 3) {
      return 'Within 3 Days';
    }

    if (diffDays <= 7) {
      return 'Within 7 Days';
    }

    return latestEnd.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
    });
  },
};
