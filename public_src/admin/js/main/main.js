import { ui_states } from '../../../common/ui.states/ui.states';

const main_items = document.querySelectorAll('main .main');

ui_states.addEventListener('SIDEBAR_CHANGE', (event) => {
  main_items[event.detail.previous_item].classList.add('hide-default');
  main_items[event.detail.current_item].classList.remove('hide-default');

   setTimeout(() => {
    window.dispatchEvent(new Event('resize'));
  }, 10);
});
