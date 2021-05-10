var AGE_LIMIT = 18;

function searchByPIN() {
  const pin = document.getElementById('pin').value;
  if (pin) {
    const date = new Date(Date.now());
    const dateString = `${date.getDate()}-${
      date.getMonth() + 1
    }-${date.getFullYear()}`;

    localStorage.setItem('pin', pin);

    fetch(
      `https://cdn-api.co-vin.in/api/v2/appointment/sessions/public/calendarByPin?pincode=${pin}&date=${dateString}`
    )
      .then((res) => res.json())
      .then((res) => {
        console.log('data', res);
        parseAvailabilityData(res);
      })
      .catch((err) => {
        console.error(err);
        alert('Some error occured!');
      });
  }
}

function parseAvailabilityData(data) {
  const availableCenters = [];
  let isAvailable;
  data.centers.forEach((center) => {
    center.sessions.forEach((session) => {
      if (
        session.min_age_limit == AGE_LIMIT &&
        session.available_capacity > 0
      ) {
        isAvailable = true;
      }
    });
    if (isAvailable) {
      availableCenters.push(center);
    }
    isAvailable = false;
  });

  if (availableCenters.length > 0) {
    let html = '';
    availableCenters.forEach((center) => {
      html += `<li>${center.name}</li>`;
    });

    $('#results-list')[0].innerHTML = html;
    $('#no-slot').attr('class', 'hide');
    $('#results').attr('class', 'show');
    alert('Available. Book on CoWIN now!');
  } else {
    $('#no-slot').attr('class', 'show');
    $('#results').attr('class', 'hide');
    alert('Sorry, not available');
  }
}

function searchByDistrict(district_id) {
  if (!district_id) {
    return;
  }
  const date = new Date(Date.now());
  const dateString = `${date.getDate()}-${
    date.getMonth() + 1
  }-${date.getFullYear()}`;

  localStorage.setItem('district_id', district_id);

  fetch(
    `https://cdn-api.co-vin.in/api/v2/appointment/sessions/public/calendarByDistrict?district_id=${district_id}&date=${dateString}`
  )
    .then((res) => res.json())
    .then((res) => {
      console.log('data', res);
      parseAvailabilityData(res);
    })
    .catch((err) => {
      console.error(err);
      alert('Some error occured!');
    });
}

$(document).ready(function () {
  // const pin = localStorage.getItem('pin');
  // if (pin) {
  //   document.getElementById('pin').value = pin;
  //   document.getElementById('search-btn').click();
  // }

  if (localStorage.getItem('age_limit')) {
    AGE_LIMIT = localStorage.getItem('age_limit');
    $('input[name=age_limit]').val([AGE_LIMIT]);
  }

  fetch('./districts.json')
    .then((res) => res.json())
    .then((res) => {
      $('#district-selector').select2({
        placeholder: {
          id: '-1',
          text: 'Select your district',
        },
        width: '200px',
        data: res,
      });

      const districtId = localStorage.getItem('district_id');

      $('select').val(districtId);
      $('select').trigger('change');
    });
});

$('#district-selector').on('change', function (e) {
  const data = $('#district-selector').select2('data');
  searchByDistrict(data[0].id);
});

$('#district-selector').on('select2:open', function (e) {
  $('.select2-search__field')[0].focus();
});

$('input[name=age_limit]').on('change', function (e) {
  AGE_LIMIT = e.target.value;
  localStorage.setItem('age_limit', AGE_LIMIT);
  $('select').trigger('change');
});
