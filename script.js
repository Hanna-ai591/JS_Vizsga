let selectedHairdresser = null;
let selectedDate = null;
let selectedTime = null;
let weekOffset = 0;

document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('hairdresser-container');

  fetch('https://salonsapi.prooktatas.hu/api/hairdressers')
    .then(response => response.json())
    .then(data => {
      data.forEach(person => {
        const card = document.createElement('div');
        card.classList.add('card');

        const img = document.createElement('img');
        img.src = `images/${person.id}.jpg`;
        img.alt = `${person.name}'s profile picture`;
        img.onerror = () => { img.src = 'images/default.jpg'; };
        card.appendChild(img);

        const name = document.createElement('h3');
        name.textContent = person.name;
        card.appendChild(name);

        const serviceTitle = document.createElement('p');
        serviceTitle.textContent = 'Szolgáltatások:';
        card.appendChild(serviceTitle);

        const serviceList = document.createElement('ul');
        let services = typeof person.services === 'string'
          ? person.services.split(',').map(s => s.trim())
          : person.services;

        services.forEach(service => {
          const li = document.createElement('li');
          li.textContent = service;
          serviceList.appendChild(li);
        });

        card.appendChild(serviceList);

        const button = document.createElement('button');
        button.textContent = "Időpont foglalás";
        button.classList.add('button');
        button.addEventListener('click', () => openBookingPopup(person));
        card.appendChild(button);

        container.appendChild(card);
      });
    })
    .catch(error => console.error('Error loading hairdressers:', error));

  const adminButton = document.getElementById('show-appointments');
  if (adminButton) {
    adminButton.addEventListener('click', () => {
      const adminContainer = document.getElementById('admin-container');
      adminContainer.innerHTML = '<h2>Foglalások</h2>';
      const appointments = JSON.parse(localStorage.getItem('appointments')) || [];
      appointments.forEach(app => {
        const entry = document.createElement('div');
        entry.className = 'appointment';
        entry.textContent = `${app.customer_name} - ${app.appointment_date} - ${app.service} (${app.hairdresser_name})`;
        adminContainer.appendChild(entry);
      });
    });
  }
});

function openBookingPopup(person) {
  selectedHairdresser = person;
  selectedDate = null;
  selectedTime = null;
  weekOffset = 0;

  let modal = document.getElementById('booking-modal');
  if (modal) modal.remove();

  modal = document.createElement('div');
  modal.id = 'booking-modal';
  modal.className = 'modal';

  const content = document.createElement('div');
  content.className = 'modal-content';

  const close = document.createElement('span');
  close.className = 'close-button';
  close.innerHTML = '&times;';
  close.addEventListener('click', () => modal.remove());

  const layout = document.createElement('div');
  layout.className = 'booking-layout';

  const info = document.createElement('div');
  info.className = 'hairdresser-info';

  const img = document.createElement('img');
  img.src = `images/${person.id}.jpg`;
  img.onerror = () => img.src = 'images/default.jpg';

  const name = document.createElement('h2');
  name.textContent = person.name;

  const services = document.createElement('p');
  services.innerHTML = `<strong>Szolgáltatások:</strong> ${Array.isArray(person.services) ? person.services.join(', ') : person.services}`;

  const phone = document.createElement('p');
  phone.innerHTML = `<strong>Telefon:</strong> ${person.phone_number ?? 'nincs adat'}`;

  const email = document.createElement('p');
  email.innerHTML = `<strong>Email:</strong> ${person.email ?? 'nincs adat'}`;

  const hours = document.createElement('p');
  hours.innerHTML = `<strong>Munkaidő:</strong> ${person.work_start_time || 'N/A'} - ${person.work_end_time || 'N/A'}`;

  info.append(img, name, services, phone, email, hours);

  const options = document.createElement('div');
  options.className = 'booking-options';

  const dateHeader = document.createElement('div');
  dateHeader.className = 'date-header';
  const weekLabel = document.createElement('span');
  weekLabel.id = 'week-label';

  const dateBoxes = document.createElement('div');
  dateBoxes.className = 'date-boxes';
  dateBoxes.id = 'date-boxes';

  const navButtons = document.createElement('div');
  navButtons.className = 'nav-buttons';

  const prev = document.createElement('button');
  prev.textContent = '<';
  prev.id = 'prev-week';
  prev.disabled = true;
  prev.addEventListener('click', () => {
    if (weekOffset > 0) {
      weekOffset--;
      updateWeekView();
    }
  });

  const next = document.createElement('button');
  next.textContent = '>';
  next.id = 'next-week';
  next.addEventListener('click', () => {
    weekOffset++;
    updateWeekView();
  });

  navButtons.append(prev, next);
  dateHeader.append(weekLabel, navButtons);

  const hr = document.createElement('hr');

  const timeBox = document.createElement('div');
  timeBox.id = 'time-selector';
  timeBox.className = 'time-selector';

  const bookBtn = document.createElement('button');
  bookBtn.className = 'book-button';
  bookBtn.textContent = 'Lefoglalom';

  const msg = document.createElement('div');
  msg.id = 'confirmation-message';

  options.append(dateHeader, dateBoxes, hr, timeBox, bookBtn, msg);
  layout.append(info, options);
  content.append(close, layout);
  modal.appendChild(content);
  document.body.appendChild(modal);

  updateWeekView();

  bookBtn.addEventListener('click', () => {
    if (!selectedDate || !selectedTime) {
      alert('Válassz dátumot és időpontot!');
      return;
    }
  
    const appointment = {
      hairdresser_id: selectedHairdresser.id,
      hairdresser_name: selectedHairdresser.name,
      customer_name: 'Teszt Felhasználó',
      customer_phone: '0612345678',
      appointment_date: `${selectedDate} ${selectedTime}`,
      service: Array.isArray(selectedHairdresser.services)
        ? selectedHairdresser.services[0]
        : selectedHairdresser.services
    };
  

    const saved = JSON.parse(localStorage.getItem('appointments')) || [];
    saved.push(appointment);
    localStorage.setItem('appointments', JSON.stringify(saved));
  

    const options = document.querySelector('.booking-options');
    options.innerHTML = '';
  
    const successMsg = document.createElement('div');
    successMsg.className = 'success-message';
    successMsg.textContent = '✅ Sikeres foglalás!';
  
    const backBtn = document.createElement('button');
    backBtn.textContent = 'Vissza a főoldalra';
    backBtn.className = 'back-button';
    backBtn.addEventListener('click', () => {
      const modal = document.getElementById('booking-modal');
      if (modal) modal.remove();
    });
  
    options.appendChild(successMsg);
    options.appendChild(backBtn);
  });
  
}

function updateWeekView() {
  const label = document.getElementById('week-label');
  const dateBoxes = document.getElementById('date-boxes');
  const today = new Date();
  const start = new Date();
  start.setDate(today.getDate() + weekOffset * 7);

  label.textContent = `${start.toLocaleDateString('hu-HU', { month: 'long', day: 'numeric' })} hét`;
  dateBoxes.innerHTML = '';

  for (let i = 0; i < 7; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    const iso = d.toISOString().split('T')[0];

    const box = document.createElement('div');
    box.className = 'date-box';
    box.textContent = `${d.getDate()}.${d.getMonth() + 1}`;
    box.dataset.date = iso;

    box.addEventListener('click', () => {
      selectedDate = iso;
      document.querySelectorAll('.date-box').forEach(b => b.classList.remove('selected'));
      box.classList.add('selected');
      loadTimeSlots();
    });

    dateBoxes.appendChild(box);
  }

  document.getElementById('prev-week').disabled = weekOffset === 0;
}

function loadTimeSlots() {
  const container = document.getElementById('time-selector');
  container.innerHTML = '';

  const existingAppointments = JSON.parse(localStorage.getItem('appointments')) || [];
  const takenTimes = existingAppointments
    .filter(app => app.appointment_date.startsWith(selectedDate))
    .map(app => app.appointment_date.split(' ')[1]); // pl. "13:30:00"

  const addGroup = (label, startHour, endHour) => {
    const wrapper = document.createElement('div');
    wrapper.className = 'time-wrapper';

    const labelDiv = document.createElement('div');
    labelDiv.className = 'time-section-label';
    labelDiv.textContent = label;
    wrapper.appendChild(labelDiv);

    const group = document.createElement('div');
    group.className = 'time-slot-group';

    for (let h = startHour; h <= endHour; h++) {
      ['00', '30'].forEach(min => {
        const time = `${h.toString().padStart(2, '0')}:${min}:00`;
        const btn = document.createElement('button');
        btn.className = 'time-slot';
        btn.textContent = `${h}:${min}`;

        if (takenTimes.includes(time)) {
          btn.disabled = true;
          btn.classList.add('taken');
        } else {
          btn.addEventListener('click', () => {
            selectedTime = time;
            document.querySelectorAll('.time-slot').forEach(b => b.classList.remove('selected'));
            btn.classList.add('selected');
          });
        }

        group.appendChild(btn);
      });
    }

    wrapper.appendChild(group);
    container.appendChild(wrapper);
  };

  addGroup('Délelőtt', 9, 12);
  addGroup('Délután', 13, 16);
}
