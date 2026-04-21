// =============================================
// Customer Data Store
// =============================================

function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
}

function daysFromNow(n) {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
}

// Each customer now has:
//   id, name, address (full), phone, area, brand, btype, ah
//   install  – installation date
//   last     – last maintenance date
//   amc      – { from, to, amount } AMC contract details
//   paymentDate – date payment was received
//   reschedules – [{ date, reason }]
//   history  – [{ date, voltMains, voltLoad, notes }]

window.customers = [
  {
    id: 1,
    name: 'Rajesh Sharma',
    phone: '9823401122',
    area: 'Koregaon Park',
    brand: 'Luminous',
    btype: 'Tall Tubular',
    ah: 150,
    address: '12 MG Road, Koregaon Park, Pune – 411001',
    notes: 'Gate code: 1234. Call before visit.',
    install: '2023-04-10',
    last: daysAgo(89),
    amc: { from: '2024-04-10', to: daysFromNow(20), amount: 2500 },
    paymentDate: '2024-04-10',
    reschedules: [],
    history: [
      { date: daysAgo(89), voltMains: '13.2', voltLoad: '12.4', notes: 'Topped up distilled water.' }
    ]
  },
  {
    id: 2,
    name: 'Priya Mehta',
    phone: '9012345678',
    area: 'Koregaon Park',
    brand: 'Microtek',
    btype: 'SMF / VRLA',
    ah: 100,
    address: '45 North Main Road, Koregaon Park, Pune – 411001',
    notes: '',
    install: '2024-01-15',
    last: daysAgo(91),
    amc: { from: '2024-01-15', to: daysFromNow(60), amount: 2000 },
    paymentDate: '2024-01-15',
    reschedules: [],
    history: []
  },
  {
    id: 3,
    name: 'Suresh Patil',
    phone: '9876500001',
    area: 'Kothrud',
    brand: 'Su-Kam',
    btype: 'Tubular Flat Plate',
    ah: 200,
    address: '7 Paud Road, Kothrud, Pune – 411038',
    notes: 'Battery in basement.',
    install: '2022-10-01',
    last: daysAgo(92),
    amc: { from: '2023-10-01', to: daysAgo(5), amount: 3000 },
    paymentDate: '2023-10-01',
    reschedules: [],
    history: []
  },
  {
    id: 4,
    name: 'Anita Desai',
    phone: '9988776655',
    area: 'Hadapsar',
    brand: 'Exide',
    btype: 'Tall Tubular',
    ah: 180,
    address: '22 Hadapsar Industrial Estate, Pune – 411013',
    notes: '',
    install: '2024-06-20',
    last: daysAgo(95),
    amc: { from: '2024-06-20', to: daysFromNow(90), amount: 2800 },
    paymentDate: '2024-06-20',
    reschedules: [],
    history: []
  },
  {
    id: 5,
    name: 'Mohammed Khan',
    phone: '9900112233',
    area: 'Camp',
    brand: 'Amara Raja',
    btype: 'Lithium-Ion',
    ah: 100,
    address: '8 East Street, Camp, Pune – 411001',
    notes: '',
    install: '2024-07-01',
    last: daysAgo(96),
    amc: { from: '2024-07-01', to: daysFromNow(10), amount: 3500 },
    paymentDate: '2024-07-01',
    reschedules: [],
    history: []
  },
  {
    id: 6,
    name: 'Kavita Joshi',
    phone: '9712345001',
    area: 'Baner',
    brand: 'Luminous',
    btype: 'Tall Tubular',
    ah: 150,
    address: '33 Baner Road, Baner, Pune – 411045',
    notes: '',
    install: '2023-08-10',
    last: daysAgo(88),
    amc: { from: '2024-08-10', to: daysFromNow(120), amount: 2500 },
    paymentDate: '2024-08-10',
    reschedules: [],
    history: []
  },
  {
    id: 7,
    name: 'Vikram Nair',
    phone: '9712345002',
    area: 'Baner',
    brand: 'Microtek',
    btype: 'Tall Tubular',
    ah: 120,
    address: '81 Baner-Pashan Link Road, Pune – 411021',
    notes: 'Flat on 3rd floor, no lift.',
    install: '2024-02-14',
    last: daysAgo(94),
    amc: { from: '2024-02-14', to: daysFromNow(200), amount: 2200 },
    paymentDate: '2024-02-14',
    reschedules: [],
    history: []
  },
  {
    id: 8,
    name: 'Sneha Kulkarni',
    phone: '9712345003',
    area: 'Kothrud',
    brand: 'Exide',
    btype: 'SMF / VRLA',
    ah: 100,
    address: '5 Karve Road, Kothrud, Pune – 411038',
    notes: '',
    install: '2023-11-20',
    last: daysAgo(87),
    amc: { from: '2024-11-20', to: daysFromNow(45), amount: 2000 },
    paymentDate: '2024-11-20',
    reschedules: [],
    history: []
  },
  {
    id: 9,
    name: 'Arun Menon',
    phone: '9712345004',
    area: 'Viman Nagar',
    brand: 'Okaya',
    btype: 'Tall Tubular',
    ah: 180,
    address: '14 Viman Nagar Road, Pune – 411014',
    notes: '',
    install: '2024-03-05',
    last: daysAgo(60),
    amc: { from: '2024-03-05', to: daysFromNow(180), amount: 2800 },
    paymentDate: '2024-03-05',
    reschedules: [],
    history: []
  },
  {
    id: 10,
    name: 'Deepa Rao',
    phone: '9712345005',
    area: 'Viman Nagar',
    brand: 'Luminous',
    btype: 'Tubular Flat Plate',
    ah: 150,
    address: '29 Clover Park, Viman Nagar, Pune – 411014',
    notes: '',
    install: '2024-04-18',
    last: daysAgo(58),
    amc: { from: '2024-04-18', to: daysFromNow(5), amount: 2500 },
    paymentDate: '2024-04-18',
    reschedules: [],
    history: []
  },
  {
    id: 11,
    name: 'Ganesh Bhosale',
    phone: '9712345006',
    area: 'Hadapsar',
    brand: 'Amara Raja',
    btype: 'Tall Tubular',
    ah: 200,
    address: '7 Magarpatta Road, Hadapsar, Pune – 411013',
    notes: 'Customer available only in mornings.',
    install: '2023-09-01',
    last: daysAgo(93),
    amc: { from: '2024-09-01', to: daysFromNow(150), amount: 3000 },
    paymentDate: '2024-09-01',
    reschedules: [],
    history: []
  },
  {
    id: 12,
    name: 'Rekha Shetty',
    phone: '9712345007',
    area: 'Camp',
    brand: 'Su-Kam',
    btype: 'SMF / VRLA',
    ah: 100,
    address: '3 Moledina Road, Camp, Pune – 411001',
    notes: '',
    install: '2024-05-22',
    last: daysAgo(97),
    amc: { from: '2024-05-22', to: daysFromNow(35), amount: 2000 },
    paymentDate: '2024-05-22',
    reschedules: [],
    history: []
  },
];

window.nextCustomerId = 13;
