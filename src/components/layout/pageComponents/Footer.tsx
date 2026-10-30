import Logo from '@components/common/Logo';
import LinkComponent from '@components/common/Link';
import { Mail, Phone, MapPin } from 'lucide-react';
import { SHOP_LINKS } from '@fixtures/footer';

const CONTACT_INFO = [
  {
    icon: Mail,
    content: (
      <a
        href="mailto:vedora@gmail.com"
        className="hover:underline transition-colors"
      >
        vedora@gmail.com
      </a>
    ),
  },
  {
    icon: Phone,
    content: (
      <a href="tel:+380984769000" className="hover:underline transition-colors">
        +380984769000
      </a>
    ),
  },
  {
    icon: MapPin,
    content: (
      <a
        href="https://maps.google.com/?cid=10098392707417717193"
        target="_blank"
        rel="noopener noreferrer"
        className="hover:underline transition-colors"
      >
        New Scotland Avenue St. 567, Albany
      </a>
    ),
  },
];

const Footer = () => {
  return (
    <footer className="relative w-full font-sans overflow-hidden">
      <div className="bg-[#C3E3BD] pt-3 pb-16 px-6 md:px-12 lg:px-20 text-foreground">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-center items-start gap-12 md:gap-24 pt-2">
          <div className="flex flex-col items-start gap-3 md:max-w-xs">
            <Logo fontSize="text-3xl text-foreground" />
            <p className="text-sm leading-relaxed">
              Your trusted botanical store. We offer fresh indoor plants and
              unique green decor to make your home feel alive
            </p>
          </div>

          <div className="flex flex-col items-start gap-3">
            <h3 className="text-base font-semibold">Shop</h3>
            <ul className="flex flex-col gap-2 text-sm">
              {SHOP_LINKS.map(link => (
                <li key={link.to}>
                  <LinkComponent
                    text={link.text}
                    to={link.to}
                    className="text-sm font-normal no-underline hover:underline text-foreground"
                  />
                </li>
              ))}
            </ul>
          </div>

          <div className="flex flex-col items-start gap-3">
            <h3 className="text-base font-semibold">Contact us</h3>
            <address className="not-italic">
              <ul className="flex flex-col gap-3 text-sm">
                {CONTACT_INFO.map(({ icon: Icon, content }, index) => (
                  <li key={index} className="flex items-center gap-3">
                    <Icon className="size-4 shrink-0" />
                    {content}
                  </li>
                ))}
              </ul>
            </address>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
