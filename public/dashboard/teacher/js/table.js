// Sample contact data
const contactsData = [
  {
    name: "Darlene Robertson",
    email: "bill.sanders@example.com",
    phone: "(907) 555-0101",
    leadSource: "Online store",
    company: "Google",
    companyType: "google",
    owner: "Chad Thundercock",
    avatar: "DR",
    avatarColor: "blue",
    time: "Today at 4:30 PM",
  },
  {
    name: "Guy Hawkins",
    email: "michelle.rivera@example.com",
    phone: "(319) 555-0115",
    leadSource: "External Referral",
    company: "Google",
    companyType: "google",
    owner: "Chad Thundercock",
    avatar: "GH",
    avatarColor: "green",
    time: "Today at 4:30 PM",
  },
  {
    name: "Theresa Webb",
    email: "nathan.roberts@example.com",
    phone: "(225) 555-0118",
    leadSource: "Advertisement",
    company: "Facebook",
    companyType: "facebook",
    owner: "Chad Thundercock",
    avatar: "TW",
    avatarColor: "orange",
    time: "Today at 4:30 PM",
  },
  {
    name: "Robert Fox",
    email: "alma.lawson@example.com",
    phone: "(217) 555-0113",
    leadSource: "Online store",
    company: "Google",
    companyType: "google",
    owner: "Chad Thundercock",
    avatar: "RF",
    avatarColor: "purple",
    time: "Today at 4:30 PM",
  },
  {
    name: "Devon Lane",
    email: "tanya.hill@example.com",
    phone: "(704) 555-0127",
    leadSource: "Advertisement",
    company: "Facebook",
    companyType: "facebook",
    owner: "Chad Thundercock",
    avatar: "DL",
    avatarColor: "green",
    time: "Today at 4:30 PM",
  },
  {
    name: "Cody Fisher",
    email: "curtis.weaver@example.com",
    phone: "(316) 555-0116",
    leadSource: "Website",
    company: "Swell",
    companyType: "swell",
    owner: "Chad Thundercock",
    avatar: "CF",
    avatarColor: "orange",
    time: "Today at 4:30 PM",
  },
];

let filteredContacts = [...contactsData];
let currentSort = { field: null, direction: "asc" };

function getBadgeClass(leadSource) {
  const source = leadSource.toLowerCase().replace(/\s+/g, "-");
  return `badge ${source}`;
}

function getCompanyIcon(companyType) {
  switch (companyType) {
    case "google":
      return '<div class="company-icon google-icon">G</div>';
    case "facebook":
      return '<div class="company-icon facebook-icon">f</div>';
    case "swell":
      return '<div class="company-icon swell-icon">S</div>';
    default:
      return '<div class="company-icon"></div>';
  }
}

function renderContacts() {
  const tbody = document.getElementById("contactTableBody");

  if (filteredContacts.length === 0) {
    tbody.innerHTML =
      '<tr><td colspan="5" class="loading">No student found</td></tr>';
    return;
  }

  tbody.innerHTML = filteredContacts
    .map(
      (contact) => `
                <tr>
                    <td>
                        <div class="contact-info">
                            <div class="avatar ${contact.avatarColor}">${
        contact.avatar
      }</div>
                            <div class="contact-details">
                                <h4>${contact.name}</h4>
                                <div class="contact-time">${contact.time}</div>
                            </div>
                        </div>
                    </td>
                    <td>
                        <div class="contact-methods">
                            <div class="email">${contact.email}</div>
                            <div class="phone">${contact.phone}</div>
                        </div>
                    </td>
                    <td>
                        <span class="${getBadgeClass(contact.leadSource)}">${
        contact.leadSource
      }</span>
                    </td>
                    <td>
                        <div class="company-info">
                            ${getCompanyIcon(contact.companyType)}
                            <span>${contact.company}</span>
                        </div>
                    </td>
                    <td>
                        <div class="owner-info">
                            <div class="owner-avatar">CT</div>
                            <span>${contact.owner}</span>
                        </div>
                    </td>
                </tr>
            `
    )
    .join("");
}

function filterContacts(searchTerm) {
  if (!searchTerm.trim()) {
    filteredContacts = [...contactsData];
  } else {
    const term = searchTerm.toLowerCase();
    filteredContacts = contactsData.filter(
      (contact) =>
        contact.name.toLowerCase().includes(term) ||
        contact.email.toLowerCase().includes(term) ||
        contact.phone.includes(term) ||
        contact.company.toLowerCase().includes(term) ||
        contact.leadSource.toLowerCase().includes(term)
    );
  }

  updateResultsCount();
  renderContacts();
}

function sortContacts(field) {
  const direction =
    currentSort.field === field && currentSort.direction === "asc"
      ? "desc"
      : "asc";
  currentSort = { field, direction };

  filteredContacts.sort((a, b) => {
    let aValue, bValue;

    switch (field) {
      case "name":
        aValue = a.name;
        bValue = b.name;
        break;
      case "contact":
        aValue = a.email;
        bValue = b.email;
        break;
      case "lead":
        aValue = a.leadSource;
        bValue = b.leadSource;
        break;
      case "company":
        aValue = a.company;
        bValue = b.company;
        break;
      case "owner":
        aValue = a.owner;
        bValue = b.owner;
        break;
      default:
        return 0;
    }

    if (direction === "asc") {
      return aValue.localeCompare(bValue);
    } else {
      return bValue.localeCompare(aValue);
    }
  });

  renderContacts();
}

function updateResultsCount() {
  document.getElementById("totalResults").textContent = filteredContacts.length;
}

// Event listeners
document.getElementById("searchInput").addEventListener("input", (e) => {
  filterContacts(e.target.value);
});

document.querySelectorAll(".sortable").forEach((th) => {
  th.addEventListener("click", () => {
    const sortField = th.dataset.sort;
    sortContacts(sortField);
  });
});

// Initialize
renderContacts();
