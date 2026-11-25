export function initEditProfileSidePanel() {
  const editProfileBtn = document.getElementById('edit-profile-btn');
  const editProfileSidePanel = document.getElementById('edit-profile-side-panel');
  const closePanelBtn = document.getElementById('close-edit-profile-panel-btn');

  editProfileBtn.addEventListener('click', () => {
    editProfileSidePanel.classList.toggle('close');
  });

  closePanelBtn.addEventListener('click', () => {
    editProfileSidePanel.classList.add('close');
  });
}
