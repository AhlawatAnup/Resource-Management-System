export const CalendarUI = {
  instance: null,

  getColorForAllotment(entry) {
    const str = `${entry.from}-${entry.to}`;
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }

    const h = Math.abs(hash) % 360;
    return {
      bg: `hsl(${h}, 70%, 90%)`,
      border: `hsl(${h}, 70%, 80%)`,
      text: `hsl(${h}, 80%, 25%)`,
    };
  },

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

    const getBookedEntry = (date) => {
      const current = toSlotStart(date);

      return disabledDates.find((entry) => {
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
      dateFormat: 'Y-m-d',
      monthSelectorType: 'static',
      clickOpens: false,
      allowInput: false,
      onDayCreate: (dObj, dStr, fp, dayElem) => {
        const isCurrentMonthDay =
          !dayElem.classList.contains('prevMonthDay') &&
          !dayElem.classList.contains('nextMonthDay');

        if (!isCurrentMonthDay) {
          return;
        }

        const bookedEntry = getBookedEntry(dayElem.dateObj);

        if (bookedEntry) {
          const colors = this.getColorForAllotment(bookedEntry);
          dayElem.classList.add('booked-date');
          dayElem.style.backgroundColor = colors.bg;
          dayElem.style.color = colors.text;
          dayElem.style.borderColor = colors.border;
          dayElem.style.opacity = '1';
          dayElem.style.textDecoration = 'line-through';
          dayElem.style.textDecorationThickness = '3px';
        }

        if (isPastDate(dayElem.dateObj)) {
          dayElem.classList.add('past-date');
          dayElem.style.backgroundColor = '#f3f4f6';
          dayElem.style.color = '#9ca3af';
          dayElem.style.borderColor = 'transparent';
        }

        if (!bookedEntry && !isPastDate(dayElem.dateObj)) {
          dayElem.classList.add('free-date');
          dayElem.style.backgroundColor = '#a7f3d0';
          dayElem.style.color = '#065f46';
          dayElem.style.borderColor = '#02a865';
        }

        if (!dayElem.classList.contains('flatpickr-disabled')) {
          dayElem.style.cursor = 'default';
        }
      },
    });
  },
};
