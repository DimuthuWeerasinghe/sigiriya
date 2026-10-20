export type Service = {
  slug: string;
  title: string;
  summary: string;
  details: string[];
  status: string;
};

export type Article = {
  slug: string;
  title: string;
  summary: string;
  date: string;
  image?: string;
};

export type TourismPlace = {
  slug: string;
  title: string;
  summary: string;
  image: string;
  notes: string[];
};

export const services: Service[] = [
  {
    slug: 'rates-and-taxes',
    title: 'Rates and Taxes',
    summary: 'Assessment rates, council levies, certificates, and related resident support.',
    status: 'In-person service',
    details: [
      'Use this pathway for assessment-related questions, payment guidance, and council revenue support.',
      'Online payment is marked as a future service until the council confirms payment providers, fees, and receipt rules.',
    ],
  },
  {
    slug: 'trade-licences',
    title: 'Trade Licences',
    summary: 'Applications and renewals for local businesses operating within the council area.',
    status: 'Draft process',
    details: [
      'The source material describes business licensing requirements and renewal steps.',
      'Fee values and effective dates must be verified before this page is used as an official fee schedule.',
    ],
  },
  {
    slug: 'building-applications',
    title: 'Building Applications',
    summary: 'Planning, development, and permit application guidance for residents and businesses.',
    status: 'Guidance',
    details: [
      'Supports visitors who need to understand how to begin a building or development request.',
      'Final checklists should be connected to approved forms when PDF files are supplied.',
    ],
  },
  {
    slug: 'waste-management',
    title: 'Waste Management',
    summary: 'Collection information, environmental requests, and civic cleanliness services.',
    status: 'Council service',
    details: [
      'Use this service for collection questions, public cleanliness concerns, and environmental support requests.',
      'Route-level content can be expanded once collection schedules and responsible officers are confirmed.',
    ],
  },
  {
    slug: 'complaints-and-requests',
    title: 'Complaints and Requests',
    summary: 'A public pathway for civic issues, follow-up requests, and service feedback.',
    status: 'Online requests',
    details: [
      'Submit an issue or service request through the complaints form. Your message is saved for council staff.',
      'Keep your reference number and private access code to read replies and follow the request status.',
    ],
  },
  {
    slug: 'download-forms',
    title: 'Download Forms',
    summary: 'Application form categories and document templates for public use.',
    status: 'Document library',
    details: [
      'Published PDFs are available in the searchable document library.',
      'Council administrators maintain the available forms, reports and publications.',
    ],
  },
];

export const notices: Article[] = [
  {
    slug: 'public-information-update',
    title: 'Public Information Update',
    summary: 'A documentary placeholder for official council notices while dated notices are prepared.',
    date: 'Date to be confirmed',
    image: '/assets/optimized/doc-news-image1-480.webp',
  },
  {
    slug: 'community-programme-gallery',
    title: 'Community Programme Gallery',
    summary: 'Photographs supplied with the news source document for future article publication.',
    date: 'Date to be confirmed',
    image: '/assets/optimized/doc-news-image2-360.webp',
  },
  {
    slug: 'service-announcement',
    title: 'Service Announcement',
    summary: 'A reserved notice area for verified service announcements, tenders, and council updates.',
    date: 'Date to be confirmed',
    image: '/assets/optimized/doc-news-image3-960.webp',
  },
];

export const downloads = [
  'Assessment and rates application',
  'Trade licence application',
  'Building application checklist',
  'Solid waste request form',
  'Complaint and request form',
  'General certificate request',
];

export const tourismPlaces: TourismPlace[] = [
  {
    slug: 'sigiriya',
    title: 'Sigiriya',
    summary: 'A world-renowned rock fortress and heritage landscape near Dambulla.',
    image: '/assets/optimized/rock-fortress-close-1200.webp',
    notes: ['Frescoes, mirror wall, water gardens, and the lion entrance are highlighted in the source material.'],
  },
  {
    slug: 'mapagala',
    title: 'Mapagala',
    summary: 'A historically significant rock complex south of Sigiriya and near Sigiriya Wewa.',
    image: '/assets/optimized/doc-gallery-image1-720.webp',
    notes: ['The source describes an older defensive landscape and distinctive stonework that needs final verification.'],
  },
  {
    slug: 'kaludiya-pokuna',
    title: 'Kaludiya Pokuna',
    summary: 'A quiet archaeological and forest setting associated with Kandalama.',
    image: '/assets/optimized/doc-gallery-image2-1200.webp',
    notes: ['Visitor information such as opening times and responsible authority should be confirmed before launch.'],
  },
  {
    slug: 'dambulla-cave-temple',
    title: 'Dambulla Cave Temple',
    summary: 'A sacred cave-temple landscape central to the cultural identity of Dambulla.',
    image: '/assets/optimized/dambulla-hero-1200.webp',
    notes: ['Historical and religious descriptions are available in the source draft, with dates pending review.'],
  },
];

export const verificationItems = [
  'Area values conflict across supplied drafts.',
  'Administrative division dates and totals need a dated official reference.',
  'Officeholder names, photographs, fees, and service hours need final confirmation.',
  'Tourism opening times, fees, and responsible authorities were not supplied.',
];

export const contactDetails = [
  ['Address', 'Dambulla Pradeshiya Sabha, Dambulla'],
  ['Telephone', 'To be verified from the final source document'],
  ['Email', 'To be verified from the final source document'],
  ['Office hours', 'Pending official confirmation'],
];
