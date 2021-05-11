var AGE_LIMIT = 18;
var dataTable;

const date = new Date(Date.now());
const dateString = `${('0' + date.getDate()).slice(-2)}-${(
  '0' +
  (date.getMonth() + 1)
).slice(-2)}-${date.getFullYear()}`;

function searchByPIN() {
  const pin = document.getElementById('pin').value;
  if (pin) {
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
        session.available_capacity > 1
      ) {
        isAvailable = true;
        console.log(center);
      }
    });
    if (isAvailable) {
      availableCenters.push(center);
    }
    isAvailable = false;
  });

  if (availableCenters.length > 0) {
    const tableData = [];
    availableCenters.forEach((center) => {
      tableData.push({ name: center.name });
    });

    dataTable.clear();
    dataTable.rows.add(tableData);
    dataTable.draw();

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

  dataTable = $('#results-table').DataTable({
    paging: false,
    searching: false,
    responsive: true,
    destroy: true,
    columns: [{ data: 'name', title: 'Center name' }],
    language: {
      emptyTable: 'No slots available',
    },
    bInfo: false,
    bSort: false,
  });

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
