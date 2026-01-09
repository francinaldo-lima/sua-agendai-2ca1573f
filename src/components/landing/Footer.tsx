import { Link } from "react-router-dom";
import { Calendar, Mail, Phone, MapPin, Linkedin, Instagram, Youtube } from "lucide-react";

const footerLinks = {
  produto: [
    { name: "Recursos", href: "#features" },
    { name: "Preços", href: "#pricing" },
    { name: "Integrações", href: "#" },
    { name: "API", href: "#" },
    { name: "Changelog", href: "#" },
  ],
  empresa: [
    { name: "Sobre nós", href: "#" },
    { name: "Blog", href: "#" },
    { name: "Carreiras", href: "#" },
    { name: "Parceiros", href: "#" },
    { name: "Contato", href: "#" },
  ],
  suporte: [
    { name: "Central de Ajuda", href: "#" },
    { name: "Documentação", href: "#" },
    { name: "Status", href: "#" },
    { name: "Comunidade", href: "#" },
  ],
  legal: [
    { name: "Termos de Uso", href: "/termos" },
    { name: "Privacidade", href: "/privacidade" },
    { name: "Cookies", href: "#" },
    { name: "LGPD", href: "#" },
  ],
};

export const Footer = () => {
  return (
    <footer className="bg-foreground text-background/80">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-8 mb-12">
          {/* Logo and info */}
          <div className="col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 rounded-xl bg-gradient-primary flex items-center justify-center">
                <Calendar className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold text-background">
                AgendAI
              </span>
            </Link>
            <p className="text-background/60 text-sm mb-6 max-w-xs">
              A plataforma mais completa de agendamentos do Brasil. 
              Automatize, organize e cresça seu negócio.
            </p>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-background/60">
                <Mail className="w-4 h-4" />
                <span>contato@agendai.com.br</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-background/60">
                <Phone className="w-4 h-4" />
                <span>(11) 4002-8922</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-background/60">
                <MapPin className="w-4 h-4" />
                <span>São Paulo, Brasil</span>
              </div>
            </div>
          </div>

          {/* Product */}
          <div>
            <h4 className="font-semibold text-background mb-4">Produto</h4>
            <ul className="space-y-2">
              {footerLinks.produto.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-sm text-background/60 hover:text-background transition-colors"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-semibold text-background mb-4">Empresa</h4>
            <ul className="space-y-2">
              {footerLinks.empresa.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-sm text-background/60 hover:text-background transition-colors"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-semibold text-background mb-4">Suporte</h4>
            <ul className="space-y-2">
              {footerLinks.suporte.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-sm text-background/60 hover:text-background transition-colors"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-semibold text-background mb-4">Legal</h4>
            <ul className="space-y-2">
              {footerLinks.legal.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-sm text-background/60 hover:text-background transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="pt-8 border-t border-background/10 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-background/40">
            © {new Date().getFullYear()} AgendAI. Todos os direitos reservados.
          </p>
          <div className="flex items-center gap-4">
            <a
              href="#"
              className="w-10 h-10 rounded-lg bg-background/5 hover:bg-background/10 flex items-center justify-center transition-colors"
            >
              <Linkedin className="w-5 h-5 text-background/60" />
            </a>
            <a
              href="#"
              className="w-10 h-10 rounded-lg bg-background/5 hover:bg-background/10 flex items-center justify-center transition-colors"
            >
              <Instagram className="w-5 h-5 text-background/60" />
            </a>
            <a
              href="#"
              className="w-10 h-10 rounded-lg bg-background/5 hover:bg-background/10 flex items-center justify-center transition-colors"
            >
              <Youtube className="w-5 h-5 text-background/60" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
