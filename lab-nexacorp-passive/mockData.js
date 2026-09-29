// All data below is entirely fictional. "nexacorp.test" uses the .test TLD,
// which is reserved by IANA and never resolves on the real internet, and every
// IP is inside the TEST-NET-1 documentation range (RFC 5737: 203.0.113.0/24).
// Nothing here can be pointed at a real target.

const WHOIS_DB = {
  'nexacorp.test': {
    domain: 'NEXACORP.TEST',
    registrar: 'MockRegistrar Inc.',
    registrantOrg: 'NexaCorp IT Operations',
    registrantEmail: 'hostmaster@nexacorp.test',
    createdDate: '2014-03-11T00:00:00Z',
    updatedDate: '2026-06-02T00:00:00Z',
    expiryDate: '2027-03-11T00:00:00Z',
    nameServers: ['ns1.nexacorp.test', 'ns2.nexacorp.test'],
    status: 'clientTransferProhibited'
  }
};

// Zone records. "staging" is deliberately not linked from any public nav menu -
// the only ways to learn it exists are the DNS zone itself and the leak snippet.
const DNS_ZONES = {
  'nexacorp.test': [
    { name: 'nexacorp.test.',         type: 'A',     value: '203.0.113.10' },
    { name: 'www.nexacorp.test.',     type: 'CNAME', value: 'nexacorp.test.' },
    { name: 'mail.nexacorp.test.',    type: 'A',     value: '203.0.113.11' },
    { name: 'ns1.nexacorp.test.',     type: 'A',     value: '203.0.113.2' },
    { name: 'ns2.nexacorp.test.',     type: 'A',     value: '203.0.113.3' },
    { name: 'vpn.nexacorp.test.',     type: 'A',     value: '203.0.113.55' },
    { name: 'staging.nexacorp.test.', type: 'A',     value: '203.0.113.42' }
  ]
};

const J = (company, title, location, type, posted, body) => ({ company, title, location, type, posted, body });

const JOB_POSTINGS = [
  J('NexaCorp', 'DevOps Engineer', 'Remote (US)', 'Full-time', '2026-05-02',
`NexaCorp is hiring a DevOps Engineer to help modernize our release pipeline.
Responsibilities include maintaining our Jenkins 2.x CI server on the staging
environment, managing our Docker build agents, and improving deploy times for
the customer portal. Experience with legacy CI upgrades is a big plus - our
Jenkins instance has been due for a patch for a while.`),
  J('NexaCorp', 'Front-End Developer', 'Austin, TX', 'Full-time', '2026-04-18',
`Looking for a front-end developer comfortable with React and Tailwind
to join the customer portal team. You'll work closely with design and backend
engineering on nexacorp.test's public-facing site.`),
  J('NexaCorp', 'Sales Associate', 'Austin, TX', 'Full-time', '2026-03-09',
`Join the NexaCorp sales team and help regional freight companies adopt our
routing software. Prior B2B software sales experience preferred.`),
  J('NexaCore Systems', 'Build Engineer', 'Denver, CO', 'Full-time', '2026-05-11',
`NexaCore Systems (not affiliated with any similarly named company) is looking
for a Build Engineer to own our Jenkins and Artifactory setup. You will manage
agents, plugins and nightly builds for our embedded firmware products.`),
  J('Brightline Freight', 'Logistics Coordinator', 'Chicago, IL', 'Full-time', '2026-05-20',
`Coordinate inbound and outbound shipments across 12 regional depots. Strong
spreadsheet skills and a calm voice on the phone are a must.`),
  J('Brightline Freight', 'Fleet Data Analyst', 'Chicago, IL', 'Hybrid', '2026-04-30',
`Analyze telematics data to reduce idle time and fuel cost. SQL and Tableau
experience required; Python is a plus.`),
  J('Harbor & Finch Bank', 'Security Analyst', 'New York, NY', 'Full-time', '2026-05-15',
`Monitor alerts in our SIEM, triage phishing reports and support quarterly
audit evidence collection. CompTIA Security+ or equivalent preferred.`),
  J('Pinecrest Health', 'Front-End Developer', 'Remote (US)', 'Contract', '2026-05-06',
`Build accessible patient-facing web apps in React and TypeScript. Experience
with design systems and WCAG 2.2 is a big plus.`),
  J('Orbit Retail', 'DevOps Engineer', 'Seattle, WA', 'Full-time', '2026-05-22',
`Run our Kubernetes clusters and GitLab CI pipelines that serve 300 stores.
Terraform, Helm and on-call rotation experience expected.`),
  J('Kestrel Analytics', 'Data Engineer', 'Boston, MA', 'Hybrid', '2026-04-25',
`Design ETL pipelines in Airflow and dbt for our customer analytics platform.`),
  J('Solace Media', 'QA Engineer', 'Los Angeles, CA', 'Full-time', '2026-05-01',
`Write and maintain Selenium and Playwright suites for our streaming apps.`),
  J('Tidewater Logistics', 'IT Support Technician', 'Norfolk, VA', 'Full-time', '2026-05-13',
`Provide first-line support for 200 dock and office staff. Active Directory,
Microsoft 365 and basic networking knowledge required.`),
  J('Vantage Cloud', 'Site Reliability Engineer', 'Remote (Global)', 'Full-time', '2026-05-27',
`Keep our multi-region platform healthy. Our stack includes Prometheus, Grafana,
Jenkins, ArgoCD and a lot of Go. You will join a 24/7 follow-the-sun rotation.`),
  J('Northwind Foods', 'Staff Accountant', 'Portland, OR', 'Full-time', '2026-04-12',
`Month-end close, accounts payable review and support for external auditors.`),
  J('Sable Labs', 'Mobile Developer', 'San Diego, CA', 'Full-time', '2026-05-18',
`Ship features in Swift and Kotlin for our consumer fitness app.`)
];

const P = (id, name, headline, company, location, about, extra = {}) =>
  Object.assign({ id, name, headline, company, location, about, experience: [], skills: [], contact: null }, extra);

const PEOPLE = [
  P('alice-johnson', 'Alice Johnson', 'Staff Accountant at NexaCorp', 'NexaCorp', 'Austin, Texas',
    'Numbers person. Month-end close enthusiast.',
    { experience: ['Staff Accountant, NexaCorp (2021 - present)', 'Junior Accountant, Northwind Foods (2018 - 2021)'], skills: ['Accounts Payable', 'Excel', 'Audit Support'] }),
  P('bob-smith', 'Bob Smith', 'Sales Associate at NexaCorp', 'NexaCorp', 'Austin, Texas',
    'Helping regional freight companies move faster with better software.',
    { experience: ['Sales Associate, NexaCorp (2023 - present)', 'Account Rep, Brightline Freight (2020 - 2023)'], skills: ['B2B Sales', 'CRM', 'Negotiation'] }),
  P('priya-raman', 'Priya Raman', 'DevOps Engineer at NexaCorp', 'NexaCorp', 'Remote, United States',
    'I keep the build pipeline moving. Docker fan, coffee drinker, patch-day optimist.',
    { experience: ['DevOps Engineer, NexaCorp (2022 - present)', 'Systems Administrator, Tidewater Logistics (2019 - 2022)'], skills: ['Docker', 'Jenkins', 'Linux', 'Bash'],
      contact: 'PasteBucket: @praman_ops' }),
  P('marcus-webb', 'Marcus Webb', 'IT Support Technician at NexaCorp', 'NexaCorp', 'Austin, Texas',
    'First stop for laptops, passwords and printers. Happy to help colleagues and candidates alike.',
    { experience: ['IT Support Technician, NexaCorp (2024 - present)', 'Help Desk Analyst, Tidewater Logistics (2021 - 2024)'], skills: ['Active Directory', 'Microsoft 365', 'Troubleshooting'],
      contact: 'marcus.webb@nexacorp.test' }),
  P('dana-whitfield', 'Dana Whitfield', 'Talent Acquisition Partner at NexaCorp', 'NexaCorp', 'Austin, Texas',
    'Hiring engineers and sales folks. Send me a note if you want to chat about open roles.',
    { experience: ['Talent Acquisition Partner, NexaCorp (2023 - present)'], skills: ['Recruiting', 'Interviewing', 'Employer Branding'],
      contact: 'dana.whitfield@nexacorp.test' }),
  P('Sherwine-sheba', 'Sherwine Sheba', 'Devops Engineer at Orbit Retail', 'Orbit Retail', 'Seattle Washington',
    'Turning messy data into tidy dashboards.',
    { experience: ['Data Analyst, Kestrel Analytics (2021 - present)'], skills: ['SQL', 'Tableau', 'Python'],
      contact: 'PasteBucket: @praman_data' }),
  P('tom-nakamura', 'Tom Nakamura', 'Build Engineer at NexaCore Systems', 'NexaCore Systems', 'Denver, Colorado',
    'Firmware builds, Jenkins plugins and too many YAML files.',
    { experience: ['Build Engineer, NexaCore Systems (2022 - present)'], skills: ['Jenkins', 'Artifactory', 'C'] }),
  P('laura-chen', 'Laura Chen', 'Logistics Coordinator at Brightline Freight', 'Brightline Freight', 'Chicago, Illinois',
    'Keeping 12 depots on schedule.', { skills: ['Scheduling', 'Excel'] }),
  P('omar-haddad', 'Omar Haddad', 'Security Analyst at Harbor & Finch Bank', 'Harbor & Finch Bank', 'New York, New York',
    'Blue teamer. Phishing report whisperer.', { skills: ['SIEM', 'Incident Response'] }),
  P('sofia-reyes', 'Sofia Reyes', 'Front-End Developer at Pinecrest Health', 'Pinecrest Health', 'Remote, United States',
    'Accessibility-first UI engineer.', { skills: ['React', 'TypeScript', 'WCAG'] }),
  P('jake-morrison', 'Jake Morrison', 'DevOps Engineer at Orbit Retail', 'Orbit Retail', 'Seattle, Washington',
    'Kubernetes wrangler.', { skills: ['Kubernetes', 'Terraform', 'GitLab CI'] }),
  P('mei-lin', 'Mei Lin', 'Site Reliability Engineer at Vantage Cloud', 'Vantage Cloud', 'Singapore',
    'On-call veteran.', { skills: ['Go', 'Prometheus', 'Jenkins'] }),
  P('carlos-vega', 'Carlos Vega', 'Recruiter at Solace Media', 'Solace Media', 'Los Angeles, California',
    'Hiring QA and media engineers.', { skills: ['Recruiting'] }),
  P('hannah-brooks', 'Hannah Brooks', 'Former Sales Associate, now Account Manager at Sable Labs', 'Sable Labs', 'San Diego, California',
    'Previously at NexaCorp in sales, now helping fitness brands grow.',
    { experience: ['Account Manager, Sable Labs (2025 - present)', 'Sales Associate, NexaCorp (2021 - 2024)'], skills: ['Account Management'] })
];

const PS = (id, title, author, date, syntax, views, body) => ({ id, title, author, date, syntax, views, body });

const PASTES = [
  PS('a1c02e', 'fizzbuzz.py', 'devbeginner77', '2026-06-28', 'Python', 412,
`for i in range(1, 101):
    out = ''
    if i % 3 == 0: out += 'Fizz'
    if i % 5 == 0: out += 'Buzz'
    print(out or i)`),
  PS('b77d10', 'nginx reverse proxy sample', 'opsguy_kim', '2026-06-29', 'Nginx', 1290,
`server {
  listen 80;
  server_name app.example.test;
  location / { proxy_pass http://127.0.0.1:8080; }
}`),
  PS('c34ee9', 'weekly standup notes', 'kestrel_pm', '2026-06-30', 'Text', 96,
`- dashboards v2 shipped
- airflow retries fixed
- need review on dbt model rename
- lunch order for Friday`),
  PS('d90b41', 'chili recipe', 'north_wind_cook', '2026-07-01', 'Text', 3011,
`2 lb beef, 2 cans beans, 1 can tomatoes, chili powder, cumin, onion, garlic.
Simmer 90 min. Better next day.`),
  PS('a91f3', 'untitled', 'anon_user_884', '2026-07-02', 'Text', 58,
`just doing some routine checks on our infra, don't mind me...

staging.nexacorp.test is still up and still running that old Jenkins build,
someone from ops should really patch that before it becomes a problem.
reported it in #devops-internal last week, no fix yet.

(sorry, wrong paste tool tab, ignore this)`),
  PS('e12a77', 'crontab backup', 'sysadmin_dee', '2026-07-03', 'Bash', 240,
`0 2 * * * /usr/local/bin/backup.sh >> /var/log/backup.log 2>&1
30 2 * * 0 /usr/local/bin/rotate.sh`),
  PS('f88c02', 'build failing on ci.nexacore.test', 'tom_n', '2026-07-03', 'Text', 133,
`ci.nexacore.test build #482 failing since the artifactory plugin update.
rolled back to 2.12, will retry tomorrow. not related to anything else.`),
  PS('g05d19', 'resume draft v3', 'jobhunter_22', '2026-07-04', 'Text', 77,
`Summary: motivated junior sysadmin with 2 years experience in help desk,
Active Directory and Microsoft 365. Looking for a new opportunity.`),
  PS('h61b93', 'TODO list', 'anon_user_120', '2026-07-05', 'Text', 21,
`renew domain, fix printer, order cables, update wiki, dentist thursday`),
  PS('k27c5e', 'notes (personal)', 'praman_ops', '2026-06-24', 'Text', 34,
`notes for myself before vacation
- jenkins is at staging.nexacorp.test (login page, no SSO yet)
- temp admin acct: ci-admin / Stg-Deploy!2026   (TODO rotate!!)
- job to watch: customer-portal-deploy
- back on the 8th`),
  PS('l19a30', 'dbt model tips', 'praman_data', '2026-06-26', 'Text', 88,
`rename staging models with stg_ prefix, keep marts in a separate folder,
and always add a unique test on primary keys.`),
  PS('m55b72', 'runner setup', 'jmorrison_ops', '2026-06-27', 'Bash', 61,
`gitlab-runner register --url https://gitlab.orbit-retail.test \
  --token REDACTED --executor docker
# local jenkins test box login: ci-admin / changeme123`),
  PS('i44f08', 'sql snippet', 'analyst_jo', '2026-07-05', 'SQL', 305,
`SELECT depot, AVG(idle_minutes) FROM telematics
GROUP BY depot ORDER BY 2 DESC LIMIT 10;`)
];

const STAGING = {
  host: 'staging.nexacorp.test',
  user: 'ci-admin',
  pass: 'Stg-Deploy!2026',
  flag: 'FLAG{jenkins_creds_leaked_in_public_paste}',
  jobs: {
    'customer-portal-deploy': { status: 'Stable', builds: [214, 213] },
    'portal-frontend-build':  { status: 'Stable', builds: [88] },
    'nightly-cleanup':        { status: 'Failing', builds: [401] }
  }
};

module.exports = { WHOIS_DB, DNS_ZONES, JOB_POSTINGS, PEOPLE, PASTES, STAGING };
