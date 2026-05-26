import { ui_states } from '../../../common/ui.states/ui.states';

const aside = document.querySelector('aside');

const aside_items = aside.querySelectorAll('nav a');
let active_item = 0;

const sidebar_active_item = localStorage.getItem('side-bar-active-item') ?? 0;

aside_items.forEach((item, index) => {
  item.addEventListener('click', function () {
    // console.log(index);
    aside_items[active_item].classList.remove('active');

    ui_states.dispatchEvent(
      new CustomEvent('SIDEBAR_CHANGE', {
        detail: {
          current_item: index,
          previous_item: active_item,
        },
      }),
    );

    this.classList.add('active');
    active_item = index;
    localStorage.setItem('side-bar-active-item', active_item);
  });
});

if (sidebar_active_item) {
  aside_items[sidebar_active_item].click();
}
