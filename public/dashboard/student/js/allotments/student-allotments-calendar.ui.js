export const CalendarUI = {
  instance: null,

  init(selector, disabledDates) {
    if (this.instance) {
      this.instance.destroy();
    }

    const toSlotStart = (date) => {
      const d = new Date(date);
      d.setHours(0, 30, 0, 0);
      return d;
    };

    const toSlotEnd = (date) => {
      const d = new Date(date);
      d.setHours(23, 30, 0, 0);
      return d;
    };

    const today = toSlotStart(new Date());

    const isPastDate = (date) => {
      const current = toSlotStart(date);
      return current < today;
    };

    const isBookedDate = (date) => {
      const current = toSlotStart(date);

      return disabledDates.some((entry) => {
        if (!entry || !entry.from || !entry.to) {
          return false;
        }

        const from = toSlotStart(entry.from);
        const to = toSlotEnd(entry.to);

        return current >= from && current <= to;
      });
    };

    this.instance = flatpickr(selector, {
      inline: true,
      disable: [...disabledDates, isPastDate],
      dateFormat: "Y-m-d",
      monthSelectorType: "static",
      clickOpens: false,
      allowInput: false,
      onDayCreate: (dObj, dStr, fp, dayElem) => {
        const isCurrentMonthDay =
          !dayElem.classList.contains("prevMonthDay") &&
          !dayElem.classList.contains("nextMonthDay");

        if (!isCurrentMonthDay) {
          return;
        }

        if (isBookedDate(dayElem.dateObj)) {
          dayElem.classList.add("booked-date");
          dayElem.style.backgroundColor = "#fee2e2";
          dayElem.style.color = "#991b1b";
          dayElem.style.borderColor = "#fca5a5";
          dayElem.style.opacity = "1";
        }

        if (isPastDate(dayElem.dateObj)) {
          dayElem.classList.add("past-date");
          dayElem.style.backgroundColor = "#f3f4f6";
          dayElem.style.color = "#9ca3af";
          dayElem.style.borderColor = "transparent";
        }

        if (!dayElem.classList.contains("booked-date") && !dayElem.classList.contains("past-date")) {
          dayElem.classList.add("free-date");
          dayElem.style.backgroundColor = "#dcfce7";
          dayElem.style.color = "#166534";
          dayElem.style.borderColor = "#86efac";
        }

        if (!dayElem.classList.contains("flatpickr-disabled")) {
          dayElem.style.cursor = "default";
        }
      }
    });
  }
};