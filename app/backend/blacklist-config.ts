const gaBlacklist = [
  'UA-110571495-2',
  'UA-33458420-1'
];

const gtmBlacklist = [
  'GTM-NPR9HT7'
];

const fbAppBlacklist = [
  '955357184504374',
];

const fbPixelBlacklist = [
  '166690417336028'
];

const pingdomAuthBlacklist = [
  '57ebf19d254226f0c0df7f98'
];

const pingdomViewerBlacklist = [
  '585a8854e629a5eb9048a348'
];

const emailBlacklist = [
  'support@readymag.com',
  'hello@readymag.com',
  'edu@readymag.com',
  'no-reply@readymag.com'
];

const stringsBlacklist = [
  '<!-- Designed with Readymag 🧩 -->',
  '<meta name="twitter:card" content="summary_large_image"/>',
  '<meta name="twitter:site" content="@readymag"/>',
  '<meta name="description" content="Built with Readymag—a tool to design anything on the web."/>',
  '<meta content="Built with Readymag—a tool to design anything on the web." property="og:description"/>',
  '<meta name="robots" content="noindex,nofollow"/>'
];

const blacklistConfig = {
  remove: [
    ...gaBlacklist,
    ...gtmBlacklist,
    ...fbAppBlacklist,
    ...emailBlacklist,
    ...stringsBlacklist,
    ...fbPixelBlacklist,
    ...pingdomAuthBlacklist,
    ...pingdomViewerBlacklist
  ],
}

export {blacklistConfig}