type ImgLogoProps = {
  inverted_color?: boolean;
  className?: string;
  alt?: string;
};

export default function AppLogoIcon({ inverted_color = false, className = '', alt = 'Logo' }: ImgLogoProps) {
  return (
    <img
      src="/assets/images/logo/startech-logo.svg"
      alt={alt}
      className={`relative w-[50px] h-[50px] ${inverted_color ? 'invert' : ''} ${className} filter dark:invert-0`}
    />
  );
}
