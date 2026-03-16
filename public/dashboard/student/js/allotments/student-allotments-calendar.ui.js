const MONTH_NAMES = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];

const WEEKDAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

function buildBookedDatesMap(allotments) {
    const map = {};

    for (const allotment of allotments) {
        const start = new Date(allotment.startTime.$date || allotment.startTime);
        const end = new Date(allotment.endTime.$date || allotment.endTime);
        let day = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), start.getUTCDate()));
        const lastDay = new Date(Date.UTC(end.getUTCFullYear(), end.getUTCMonth(), end.getUTCDate()));

        while (day <= lastDay) {
            const y = day.getUTCFullYear();
            const m = String(day.getUTCMonth() + 1).padStart(2, '0');
            const d = String(day.getUTCDate()).padStart(2, '0');
            const key = `${y}-${m}-${d}`;

            if (!map[key]) {
                map[key] = { active: false, expired: false };
            }

            if (allotment.status === 'active') {
                map[key].active = true;
            } else {
                map[key].expired = true;
            }

            day.setUTCDate(day.getUTCDate() + 1);
        }
    }

    return map;
}

function buildCalendarHTML(year, month, bookedDatesMap) {
    const firstWeekday = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const weekdayHeaders = WEEKDAYS
        .map(day => `<div class="booking-calendar__weekday">${day}</div>`)
        .join('');

    const leadingEmptyCells = Array(firstWeekday)
        .fill('<div class="booking-calendar__day booking-calendar__day--empty"></div>')
        .join('');

    const dayCells = [];
    for (let day = 1; day <= daysInMonth; day++) {
        const key = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const booked = bookedDatesMap[key];

        let cls = 'booking-calendar__day';
        if (booked) {
            cls += ' booking-calendar__day--booked';
            if (booked.active) {
                cls += ' booking-calendar__day--active';
            }
            if (booked.expired) {
                cls += ' booking-calendar__day--expired';
            }
        }

        dayCells.push(`<div class="${cls}">${day}</div>`);
    }

    return `
        <div class="booking-calendar">
            <div class="booking-calendar__nav">
                <button type="button" class="booking-calendar__nav-btn js-booking-cal-prev" aria-label="Previous month">&#8249;</button>
                <span class="booking-calendar__label">${MONTH_NAMES[month]} ${year}</span>
                <button type="button" class="booking-calendar__nav-btn js-booking-cal-next" aria-label="Next month">&#8250;</button>
            </div>

            <div class="booking-calendar__grid">
                ${weekdayHeaders}
                ${leadingEmptyCells}
                ${dayCells.join('')}
            </div>

        </div>`;
}

export function mountAllotmentsCalendar(container, allotments, initialDate = new Date()) {
    const bookedDatesMap = buildBookedDatesMap(allotments);
    let year = initialDate.getFullYear();
    let month = initialDate.getMonth();

    const render = () => {
        container.innerHTML = buildCalendarHTML(year, month, bookedDatesMap);

        const prevBtn = container.querySelector('.js-booking-cal-prev');
        const nextBtn = container.querySelector('.js-booking-cal-next');

        prevBtn.addEventListener('click', () => {
            month -= 1;
            if (month < 0) {
                month = 11;
                year -= 1;
            }
            render();
        });

        nextBtn.addEventListener('click', () => {
            month += 1;
            if (month > 11) {
                month = 0;
                year += 1;
            }
            render();
        });
    };

    render();
}