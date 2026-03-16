export const CalendarUI = {
  instance: null,

  init(selector, disabledDates) {
    if (this.instance) {
      this.instance.destroy();
    }

    this.instance = flatpickr(selector, {
      inline: true,
      disable: disabledDates,
      dateFormat: "Y-m-d",
      monthSelectorType: "static",
      clickOpens: false,
      allowInput: false,
      onDayCreate: (dObj, dStr, fp, dayElem) => {
        if (!dayElem.classList.contains("flatpickr-disabled")) {
          dayElem.style.cursor = "default";
        }
      }
    });
  }
};