import { Calendar } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';

export const CalendarUI = {
  instance: null,

  getColorForAllotment(entry) {
    const palette = [
      {
        bg: 'rgba(99, 102, 241, 0.16)',
        border: 'rgba(99, 102, 241, 0.35)',
        text: '#4338ca',
      },

      {
        bg: 'rgba(14, 165, 233, 0.16)',
        border: 'rgba(14, 165, 233, 0.35)',
        text: '#0369a1',
      },

      {
        bg: 'rgba(168, 85, 247, 0.16)',
        border: 'rgba(168, 85, 247, 0.35)',
        text: '#7e22ce',
      },

      {
        bg: 'rgba(20, 184, 166, 0.16)',
        border: 'rgba(20, 184, 166, 0.35)',
        text: '#0f766e',
      },

      {
        bg: 'rgba(245, 158, 11, 0.16)',
        border: 'rgba(245, 158, 11, 0.35)',
        text: '#b45309',
      },

      {
        bg: 'rgba(239, 68, 68, 0.16)',
        border: 'rgba(239, 68, 68, 0.35)',
        text: '#b91c1c',
      },
    ];

    const str = `${entry.from}-${entry.to}`;

    let hash = 0;

    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }

    return palette[Math.abs(hash) % palette.length];
  },

  init(selector, allotments) {
    const el = document.querySelector(selector);

    if (!el) return;

    // container styling
    el.style.width = '100%';
    el.style.maxWidth = '950px';
    el.style.margin = '0 auto';
    el.style.background = '#ffffff';
    el.style.boxShadow = '0 4px 14px rgba(15, 23, 42, 0.05)';

    el.style.border = '1px solid rgba(148, 163, 184, 0.12)';
    el.style.borderRadius = '20px';
    el.style.padding = '20px';

    if (this.instance) {
      this.instance.destroy();
      this.instance = null;
    }

    const today = new Date();

    const events = allotments.map((entry) => {
      const now = new Date();

      const isCurrent = new Date(entry.from) <= now && new Date(entry.to) >= now;

      const colors = isCurrent
        ? {
            bg: 'rgba(34, 197, 94, 0.18)',
            border: 'rgba(34, 197, 94, 0.45)',
            text: '#15803d',
          }
        : this.getColorForAllotment(entry);

      return {
        title: `Allotted To :${entry.bookedBy}`,
        start: entry.from,
        end: this.getNextDay(entry.to),

        allDay: true,
        backgroundColor: colors.bg,
        borderColor: colors.border,
        textColor: colors.text,

        display: 'auto',
      };
    });
    const bookedDatesSet = new Set();

    allotments.forEach((entry) => {
      const start = new Date(entry.from);
      const end = new Date(entry.to);

      const current = new Date(start);

      while (current <= end) {
        bookedDatesSet.add(current.toDateString());

        current.setDate(current.getDate() + 1);
      }
    });

    this.instance = new Calendar(el, {
      plugins: [dayGridPlugin],
      initialView: 'dayGridMonth',

      height: 500,

      aspectRatio: 0.8,
      dayMaxEventRows: 1,

      eventContent: function (arg) {
        // if event continues on next row/week
        // don't show text again
        if (!arg.isStart) {
          return {
            html: `
      <div style="
        visibility: hidden;
        height: 10px;
      ">
        hidden
      </div>
    `,
          };
        }

        return {
          html: `
      <div style="
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        width: 100%;
      ">
        ${arg.event.title}
      </div>
    `,
        };
      },

      fixedWeekCount: false,

      expandRows: true,

      dayMaxEvents: true,

      selectable: false,

      editable: false,

      events,

      headerToolbar: {
        left: 'prev,next',
        center: 'title',
        right: 'today',
      },

      buttonText: {
        today: 'Today',
      },

      dayCellDidMount: (info) => {
        const cell = info.el;
        const dayNumber = cell.querySelector('.fc-daygrid-day-number');

        // cell sizing
        cell.style.minHeight = '95px';
        cell.style.transition = '0.2s ease';

        const current = new Date(
          info.date.getFullYear(),
          info.date.getMonth(),
          info.date.getDate(),
        );

        const now = new Date(today.getFullYear(), today.getMonth(), today.getDate());

        // borders
        cell.style.borderColor = 'rgba(148, 163, 184, 0.10)';

        // today
        if (current.getTime() === now.getTime()) {
          cell.style.background = 'rgba(59, 130, 246, 0.12)';
        }

        // past dates
        else if (current < now) {
          cell.style.background = 'rgba(100, 116, 139, 0.06)';
          cell.style.opacity = '0.65';
        }

        // free dates
        else {
          cell.style.background = 'rgba(148, 163, 184, 0.045)';
        }

        if (bookedDatesSet.has(current.toDateString())) {
          if (dayNumber) {
            dayNumber.style.textDecoration = 'line-through';
            dayNumber.style.textDecorationThickness = '2px';
            dayNumber.style.opacity = '0.50';
          }
        }
      },
      eventDidMount: (info) => {
        info.el.style.borderRadius = '6px';
        info.el.style.padding = '3px 8px';
        info.el.style.fontSize = '11px';
        info.el.style.fontWeight = '600';

        info.el.style.whiteSpace = 'nowrap';
        info.el.style.overflow = 'hidden';
        info.el.style.textOverflow = 'ellipsis';
      },

      viewDidMount: () => {
        // toolbar title
        const title = el.querySelector('.fc-toolbar-title');

        if (title) {
          title.style.fontSize = '2rem';
          title.style.fontWeight = '700';
          title.style.color = '#111827';
        }

        // toolbar buttons
        const buttons = el.querySelectorAll('.fc-button');

        buttons.forEach((btn) => {
          btn.style.background = '#334155';
          btn.style.borderRadius = '10px';
          btn.style.padding = '8px 14px';
          btn.style.fontWeight = '400';
          btn.style.cursor = 'pointer';
          btn.style.pointerEvents = 'auto';
          btn.onmouseenter = () => {
            btn.style.background = '#1e293b';
          };

          btn.onmouseleave = () => {
            btn.style.background = '#334155';
          };
        });

        // table borders
        const tableCells = el.querySelectorAll('.fc-theme-standard td, .fc-theme-standard th');

        tableCells.forEach((cell) => {
          cell.style.borderColor = '#e5e7eb';
        });

        // weekday headers
        const headers = el.querySelectorAll('.fc-col-header-cell-cushion');

        headers.forEach((header) => {
          header.style.fontWeight = '700';
          header.style.color = '#64748b';
          header.style.textDecoration = 'none';
          header.style.padding = '10px 0';
        });
      },
    });

    this.instance.render();
  },

  getNextDay(dateStr) {
    const d = new Date(dateStr);

    d.setDate(d.getDate() + 1);

    return d.toISOString().split('T')[0];
  },
};
