
"use client";

import AppLogo from "@/components/app-logo";
import {
  Footer,
  FooterBrand,
  FooterCopyright,
  FooterDivider,
  FooterIcon,
  FooterLink,
  FooterLinkGroup,
  FooterTitle,
} from "flowbite-react";
import { BsDribbble, BsFacebook, BsGithub, BsInstagram, BsTwitter } from "react-icons/bs";

export function CustomFooter() {
  return (
    <Footer container className="!rounded-none bg-gradient-to-b from-[#fc1304] via-[#f32d2d] to-[#fdc700 ] text-[#ffffff]">
      <div className="w-full">
        <div className="grid grid-cols-1 w-full justify-between sm:flex sm:justify-between md:flex md:grid-cols-1">
          <div className="lg:mb-[0] mb-5">
            <AppLogo />
          </div>
          <div className="grid grid-cols-2 gap-8 sm:mt-4 sm:grid-cols-3 sm:gap-6">
            <div>
              <FooterTitle title="about" className="!text-white" /><FooterLinkGroup col>
                <FooterLink href="#" className="!text-white">Flowbite</FooterLink>
                <FooterLink href="#" className="!text-white">Tailwind CSS</FooterLink>
              </FooterLinkGroup>
            </div>
            <div>
              <FooterTitle title="Follow us" className="!text-white" />
              <FooterLinkGroup col>
                <FooterLink href="#" className="!text-white">Github</FooterLink>
                <FooterLink href="#" className="!text-white">Discord</FooterLink>
              </FooterLinkGroup>
            </div>
            <div>
              <FooterTitle title="Legal" className="!text-white" />
              <FooterLinkGroup col>
                <FooterLink href="#" className="!text-white">Privacy Policy</FooterLink>
                <FooterLink href="#" className="!text-white">Terms &amp; Conditions</FooterLink>
              </FooterLinkGroup>
            </div>
          </div>
        </div>
        <FooterDivider />
        <div className="w-full sm:flex sm:items-center sm:justify-between">
          <FooterCopyright
            href="#"
            by="NEMCO Development Team™"
            year={2025}
            className="!text-white"
          />
          <div className="mt-4 flex space-x-6 sm:mt-0 sm:justify-center">
            <FooterIcon href="#" icon={BsFacebook} className="!text-white" />
            <FooterIcon href="#" icon={BsInstagram} className="!text-white" />
            <FooterIcon href="#" icon={BsTwitter} className="!text-white" />
            <FooterIcon href="#" icon={BsGithub} className="!text-white" />
            <FooterIcon href="#" icon={BsDribbble} className="!text-white" />
          </div>
        </div>
      </div>
    </Footer>
  );
}

