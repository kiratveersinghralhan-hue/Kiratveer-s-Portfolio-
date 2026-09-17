export const site = {
  name: 'Kiratveer Singh Ralhan',
  shortName: 'Kirat',
  title: 'Kirat — Digital Products & Experiences',
  description: 'Independent digital product developer in India. Design, development, AI and motion, brought together to build memorable websites and useful digital products.',
  email: 'kiratveersinghralhan@gmail.com',
  whatsapp: '919814800017',
  whatsappMessage: "Hi Kirat, I came across your portfolio and I’d like to discuss a project.",
  formEndpoint: 'https://formspree.io/f/xjgadypw',
  location: 'Punjab, India',
  availability: 'Available for selected projects',
  offer: 'A complimentary digital presence audit for qualified new website and product projects.',
  socials: [{ name: 'Instagram', url: 'https://instagram.com/ralhanx' }],
  navigation: [{ name: 'Work', href: '/#work' }, { name: 'Capabilities', href: '/#capabilities' }, { name: 'About', href: '/#about' }, { name: 'Investment', href: '/#pricing' }]
};
export const whatsappUrl = `https://wa.me/${site.whatsapp}?text=${encodeURIComponent(site.whatsappMessage)}`;
export const capabilities = [
  { title: 'Digital experiences', label: 'The first impression. And everything after.', description: 'Websites that make the business feel as considered as the work behind it. Clear journeys, distinctive design and a reason to get in touch.', items: ['Premium websites', 'Interactive storytelling', 'UI / UX', 'Commerce & lead capture'], image: '/assets/images/project-veyrath.webp' },
  { title: 'AI & products', label: 'An idea, with a working system behind it.', description: 'From product structure to the workflows inside it. AI-assisted features, web applications and integrations shaped around a practical need.', items: ['Product development', 'AI workflows', 'Automation', 'Applications & integrations'], image: '/assets/images/qortra-system.svg' },
  { title: 'Brand & visual', label: 'A point of view, made visible.', description: 'A coherent visual language across identity, interface and the content a brand puts into the world.', items: ['Visual direction', 'Brand systems', 'Interface design', 'Graphics'], image: '/assets/images/project-gaane-gpt.webp' },
  { title: 'Motion & growth', label: 'Give the launch something to say.', description: 'Film, launch content and a considered digital presence. The things that help people notice, understand and take the next step.', items: ['Professional video editing', 'Launch content', 'SEO foundations', 'Social & content systems'], image: '/assets/images/poster-glossboss.webp' }
];
export const process = [
  { title: 'Discover', text: 'We get clear on the business, the audience and what this project needs to achieve.', output: 'A shared brief' },
  { title: 'Direction', text: 'References, structure and a visual concept turn the brief into a tangible direction.', output: 'A direction you can see' },
  { title: 'Design & build', text: 'The interface, development, content and integrations come together as a working experience.', output: 'A working product' },
  { title: 'Refine', text: 'We test real journeys, screen sizes, speed and the small details that make it feel right.', output: 'A considered finish' },
  { title: 'Launch', text: 'Deployment, agreed analytics and a practical handover make the work yours to use.', output: 'A confident handover' },
  { title: 'Grow', text: 'Optional ongoing improvements, website care and content support as the business evolves.', output: 'Room to keep moving' }
];
