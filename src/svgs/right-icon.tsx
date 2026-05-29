type IconProps = {
  size?: number | string;
};

const RightIcon = ({ size = '268.83' }: IconProps) => (
  <svg
    width={`${size}px`}
    height={`${size}px`}
    version="1.1"
    viewBox="0 0 268.832 268.832"
    xmlns="http://www.w3.org/2000/svg"
  >
    <g id="right" fill="#000" fillRule="nonzero">
      <path d="m265.17 125.58l-80-80c-4.881-4.881-12.797-4.881-17.678 0-4.882 4.882-4.882 12.796 0 17.678l58.661 58.661h-213.65c-6.903 0-12.5 5.597-12.5 12.5 0 6.902 5.597 12.5 12.5 12.5h213.65l-58.659 58.661c-4.882 4.882-4.882 12.796 0 17.678 2.44 2.439 5.64 3.661 8.839 3.661s6.398-1.222 8.839-3.661l79.998-80c4.882-4.882 4.882-12.796 0-17.678z" />
    </g>
  </svg>
);

export default RightIcon;
